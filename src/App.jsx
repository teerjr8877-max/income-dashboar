import { useEffect, useMemo, useRef, useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { AuthScreen } from './components/AuthScreen'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { SettingsPage } from './components/SettingsPage'
import { Sidebar } from './components/Sidebar'
import {
  createActivityEntry,
  createStarterWorkspace,
  formatCurrency,
  loadLocalWorkspace,
  normalizeWorkspace,
  stampWorkspace,
  toCashFlowBuckets,
} from './data/householdModel'
import { usePersistentAppData } from './hooks/usePersistentAppData'
import {
  authenticate,
  bootstrapSession,
  clearSession,
  cloudEnabled,
  createHouseholdWorkspace,
  exportLatestMergedWorkspace,
  fetchMembers,
  fetchMembership,
  fetchWorkspace,
  getUser,
  joinHouseholdWorkspace,
  saveWorkspace,
  touchMember,
} from './lib/supabaseApi'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
  Settings: SettingsPage,
}

const initialWorkspace = loadLocalWorkspace()

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const {
    appData: workspace,
    saveState,
    lastSavedAt,
    resetToDemoData,
  } = usePersistentAppData(
    initialWorkspace,
    () => createStarterWorkspace(),
  )
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [membership, setMembership] = useState(null)
  const [members, setMembers] = useState([])
  const [cloudVersion, setCloudVersion] = useState(1)
  const [syncState, setSyncState] = useState({ status: cloudEnabled ? 'booting' : 'local-only', label: cloudEnabled ? 'Connecting…' : 'Local-only mode', error: null, lastSavedLabel: 'Just now', lastSyncedLabel: 'Not yet' })
  const [authPending, setAuthPending] = useState(false)
  const [authError, setAuthError] = useState('')
  const [setupState, setSetupState] = useState(cloudEnabled ? 'signed-out' : 'local-ready')
  const [isLoaded, setIsLoaded] = useState(!cloudEnabled)
  const dirtyRef = useRef(false)
  const syncingRef = useRef(false)
  const lastLoadedRef = useRef(JSON.stringify(initialWorkspace))
  const pollerRef = useRef(null)

  useEffect(() => {
    if (!cloudEnabled) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const cachedSession = await bootstrapSession()
        if (!cachedSession) {
          if (!cancelled) {
            setSetupState('signed-out')
            setSyncState((current) => ({ ...current, status: 'signed-out', label: 'Sign in to enable sync' }))
          }
          return
        }
        if (cancelled) return
        setSession(cachedSession)
        const nextUser = await getUser(cachedSession.access_token)
        if (cancelled) return
        setUser(nextUser)
        await loadCloudWorkspace(cachedSession, nextUser)
      } catch (error) {
        if (!cancelled) {
          setAuthError(error.message)
          setSyncState((current) => ({ ...current, status: 'error', label: 'Sync unavailable', error: error.message }))
        }
      }
    })()
    return () => {
      cancelled = true
      if (pollerRef.current) clearInterval(pollerRef.current)
    }
  }, [])

  const loadCloudWorkspace = async (activeSession, activeUser) => {
    const nextMembership = await fetchMembership(activeSession.access_token, activeUser.id)
    setMembership(nextMembership)

    if (!nextMembership) {
      setSetupState('needs-household')
      setIsLoaded(true)
      setSyncState((current) => ({ ...current, status: 'awaiting-setup', label: 'Create or join household' }))
      return
    }

    await touchMember(activeSession.access_token, nextMembership, activeUser)
    const remoteWorkspace = await fetchWorkspace(activeSession.access_token, nextMembership.household_id)
    const fetchedMembers = await fetchMembers(activeSession.access_token, nextMembership.household_id)
    setMembers(fetchedMembers)

    if (remoteWorkspace?.payload) {
      const hydrated = normalizeWorkspace(remoteWorkspace.payload)
      const persisted = {
        ...hydrated,
        metadata: {
          ...hydrated.metadata,
          lastCloudSyncAt: new Date().toISOString(),
          lastLocalSaveAt: hydrated.metadata?.lastLocalSaveAt ?? new Date().toISOString(),
          source: 'cloud',
        },
      }
      saveState(persisted)
      lastLoadedRef.current = JSON.stringify(persisted)
      setCloudVersion(remoteWorkspace.version)
      setSyncState({ status: 'synced', label: 'Synced', error: null, lastSavedLabel: formatDateLabel(persisted.metadata.lastLocalSaveAt), lastSyncedLabel: formatDateLabel(new Date().toISOString()) })
    }

    setSetupState('ready')
    setIsLoaded(true)
    startPolling(activeSession, nextMembership.household_id)
  }

  const startPolling = (activeSession, householdId) => {
    if (pollerRef.current) clearInterval(pollerRef.current)
    pollerRef.current = setInterval(async () => {
      if (dirtyRef.current || syncingRef.current) return
      try {
        const remote = await fetchWorkspace(activeSession.access_token, householdId)
        if (!remote || remote.version === cloudVersion) return
        setCloudVersion(remote.version)
        const merged = normalizeWorkspace(remote.payload)
        const persisted = {
          ...merged,
          metadata: {
            ...merged.metadata,
            lastCloudSyncAt: new Date().toISOString(),
            lastLocalSaveAt: merged.metadata?.lastLocalSaveAt ?? new Date().toISOString(),
          },
        }
        saveState(persisted)
        lastLoadedRef.current = JSON.stringify(persisted)
        setSyncState((current) => ({ ...current, status: 'synced', label: 'New cloud updates loaded', lastSyncedLabel: formatDateLabel(new Date().toISOString()) }))
      } catch (error) {
        setSyncState((current) => ({ ...current, status: 'error', label: 'Polling error', error: error.message, lastSavedLabel: current.lastSavedLabel, lastSyncedLabel: current.lastSyncedLabel }))
      }
    }, 20_000)
  }

  useEffect(() => {
    setSyncState((current) => ({ ...current, lastSavedLabel: formatDateLabel(lastSavedAt ?? workspace.metadata.lastLocalSaveAt) }))
    if (!isLoaded) return
    if (JSON.stringify(workspace) === lastLoadedRef.current) return
    dirtyRef.current = true
    setSyncState((current) => ({ ...current, status: cloudEnabled && session && membership ? 'saving' : current.status, label: cloudEnabled && session && membership ? 'Saving household…' : current.label }))
  }, [workspace, isLoaded, lastSavedAt])

  useEffect(() => {
    if (!cloudEnabled || !session || !membership || !dirtyRef.current || !isLoaded) return undefined
    const timer = setTimeout(async () => {
      syncingRef.current = true
      try {
        let nextPayload = stampWorkspace(workspace, user?.id ?? null)
        let result = await saveWorkspace({ accessToken: session.access_token, householdId: membership.household_id, version: cloudVersion, payload: nextPayload, userId: user?.id ?? null })
        if (!result) {
          const merged = await exportLatestMergedWorkspace({ accessToken: session.access_token, householdId: membership.household_id, localWorkspace: nextPayload })
          nextPayload = stampWorkspace(merged.payload, user?.id ?? null)
          result = await saveWorkspace({ accessToken: session.access_token, householdId: membership.household_id, version: merged.version, payload: nextPayload, userId: user?.id ?? null })
        }
        if (!result) throw new Error('Could not save because another device updated the workspace at the same time.')
        const syncedWorkspace = {
          ...nextPayload,
          metadata: {
            ...nextPayload.metadata,
            lastCloudSyncAt: new Date().toISOString(),
            lastLocalSaveAt: nextPayload.metadata.lastLocalSaveAt ?? new Date().toISOString(),
          },
        }
        saveState(syncedWorkspace)
        setCloudVersion(result.version)
        lastLoadedRef.current = JSON.stringify(syncedWorkspace)
        dirtyRef.current = false
        setSyncState((current) => ({ ...current, status: 'synced', label: 'Saved to cloud', error: null, lastSavedLabel: formatDateLabel(syncedWorkspace.metadata.lastLocalSaveAt), lastSyncedLabel: formatDateLabel(syncedWorkspace.metadata.lastCloudSyncAt) }))
      } catch (error) {
        setSyncState((current) => ({ ...current, status: 'error', label: 'Save failed — local changes kept', error: error.message, lastSavedLabel: current.lastSavedLabel, lastSyncedLabel: current.lastSyncedLabel }))
      } finally {
        syncingRef.current = false
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [workspace, session, membership, cloudVersion, isLoaded, user])

  const mutateWorkspace = (reason, updater) => {
    saveState((current) => {
      const base = typeof updater === 'function' ? updater(current) : updater
      const now = new Date().toISOString()
      const stamped = stampWorkspace(base, user?.id ?? null)
      const next = { ...stamped, metadata: { ...stamped.metadata, lastLocalSaveAt: now } }
      return {
        ...next,
        activity: [createActivityEntry(reason, user?.email ?? 'Local device'), ...next.activity].slice(0, 20),
      }
    })
  }

  const setAccounts = (nextValue, reason = 'Updated accounts') => {
    mutateWorkspace(reason, (current) => ({ ...current, accounts: typeof nextValue === 'function' ? nextValue(current.accounts) : nextValue }))
  }

  const setCashFlowEntries = (nextValue, reason = 'Updated cash flow') => {
    mutateWorkspace(reason, (current) => ({ ...current, cashFlowEntries: typeof nextValue === 'function' ? nextValue(current.cashFlowEntries) : nextValue }))
  }

  const setGoals = (nextValue, reason = 'Updated planner goals') => {
    mutateWorkspace(reason, (current) => ({ ...current, plannerGoals: typeof nextValue === 'function' ? nextValue(current.plannerGoals) : nextValue }))
  }

  const handleAuthenticate = async ({ email, password, mode }) => {
    setAuthPending(true)
    setAuthError('')
    try {
      const nextSession = await authenticate(email, password, mode)
      const activeUser = await getUser(nextSession.access_token)
      setSession(nextSession)
      setUser(activeUser)
      await loadCloudWorkspace(nextSession, activeUser)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthPending(false)
    }
  }

  const handleSetupHousehold = async ({ action, householdName, slug, inviteCode, ownerLabel }) => {
    if (!session || !user) return
    setAuthPending(true)
    setAuthError('')
    try {
      if (action === 'create') {
        await createHouseholdWorkspace({ accessToken: session.access_token, user, householdName, slug, inviteCode, ownerLabel })
      } else {
        await joinHouseholdWorkspace({ accessToken: session.access_token, user, slug, inviteCode, ownerLabel })
      }
      await loadCloudWorkspace(session, user)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthPending(false)
    }
  }

  const handleResetDemo = () => {
    resetToDemoData(() => ({
      ...createStarterWorkspace({ householdId: membership?.household_id ?? null, householdName: workspace.household.name, slug: workspace.household.slug, createdBy: user?.id ?? null }),
      activity: [createActivityEntry('Reset demo data', user?.email ?? 'Local device')],
    }))
  }

  const handleExport = (payload) => {
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${workspace.household.slug || 'wealthos'}-export.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleSignOut = () => {
    clearSession()
    setSession(null)
    setUser(null)
    setMembership(null)
    setMembers([])
    setSetupState(cloudEnabled ? 'signed-out' : 'local-ready')
    setSyncState((current) => ({ ...current, status: 'signed-out', label: cloudEnabled ? 'Signed out — local cache kept' : current.label }))
    if (pollerRef.current) clearInterval(pollerRef.current)
  }

  const cashFlow = useMemo(() => toCashFlowBuckets(workspace.cashFlowEntries), [workspace.cashFlowEntries])
  const CurrentPage = pages[currentPage]
  const pageProps = useMemo(() => ({
    accounts: workspace.accounts,
    setAccounts,
    cashFlow,
    setCashFlowEntries,
    goals: workspace.plannerGoals,
    setGoals,
    workspace,
    syncState,
    members,
    user,
    onSignOut: handleSignOut,
    onResetDemo: handleResetDemo,
    onExport: handleExport,
    cloudEnabled,
  }), [workspace, cashFlow, syncState, members, user])

  if ((cloudEnabled && !isLoaded) || (cloudEnabled && !user && setupState === 'booting')) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Loading WealthOS…</div>
  }

  if (cloudEnabled && (!user || setupState === 'needs-household' || setupState === 'signed-out')) {
    return <AuthScreen cloudEnabled={cloudEnabled} onAuthenticate={handleAuthenticate} authPending={authPending} authError={authError} setupState={setupState} onSetupHousehold={handleSetupHousehold} user={user} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} householdName={workspace.household.name} syncState={syncState} userEmail={user?.email} />
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <SyncBanner syncState={syncState} members={members} householdName={workspace.household.name} />
        <div className="mt-6">
          <CurrentPage {...pageProps} />
        </div>
      </main>
    </div>
  )
}

function SyncBanner({ syncState, members, householdName }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-2xl shadow-slate-950/40">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Shared household workspace</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{householdName}</h2>
        <p className="mt-1 text-sm text-slate-400">{members.length} active household member{members.length === 1 ? '' : 's'} · {syncState.error || syncState.label}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Pill label="Local save" value={syncState.lastSavedLabel} />
        <Pill label="Cloud sync" value={syncState.lastSyncedLabel} />
      </div>
    </div>
  )
}

function Pill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function formatDateLabel(value) {
  if (!value) return 'Not yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not yet'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
