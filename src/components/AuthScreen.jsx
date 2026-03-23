import { useState } from 'react'
import { ownerOptions } from '../data/householdModel'
import { Panel } from '../ui/Panel'

export function AuthScreen({ cloudEnabled, onAuthenticate, authPending, authError, setupState, onSetupHousehold, user }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [householdName, setHouseholdName] = useState('JR & Lisa Household')
  const [slug, setSlug] = useState('jr-lisa')
  const [inviteCode, setInviteCode] = useState('')
  const [ownerLabel, setOwnerLabel] = useState('JR')
  const [joinMode, setJoinMode] = useState('create')

  const submitAuth = (event) => {
    event.preventDefault()
    onAuthenticate({ email, password, mode })
  }

  const submitSetup = (event) => {
    event.preventDefault()
    onSetupHousehold({
      action: joinMode,
      householdName,
      slug,
      inviteCode,
      ownerLabel,
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Panel className="border-brand-400/20 bg-gradient-to-br from-slate-950 via-slate-950 to-brand-950/30">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-300">WealthOS Shared</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">One household workspace. Two phones. Same truth.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            WealthOS now supports a shared household cloud workspace with owner attribution, autosave, local fallback caching,
            and a mobile-first setup flow for JR and Lisa.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Shared accounts, holdings, cash flow, planner goals, and schedules',
              'Email + password sign-in that works across multiple devices',
              'Refresh-on-load plus autosave with conflict-aware cloud writes',
              'Settings for sync status, active users, export, and demo reset',
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
          {!cloudEnabled && (
            <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-100">
              Supabase environment variables are missing. The app will continue in premium local-only mode until
              `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
            </div>
          )}
        </Panel>

        <Panel>
          {!user && cloudEnabled && (
            <>
              <div className="flex rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
                {[
                  ['signin', 'Sign in'],
                  ['signup', 'Create account'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      mode === value ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form className="mt-6 space-y-4" onSubmit={submitAuth}>
                <Field label="Email">
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="input-shell" />
                </Field>
                <Field label="Password">
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required className="input-shell" />
                </Field>
                {authError && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{authError}</p>}
                <button disabled={authPending} className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60">
                  {authPending ? 'Working…' : mode === 'signin' ? 'Sign in to household sync' : 'Create secure household login'}
                </button>
              </form>
            </>
          )}

          {user && setupState === 'needs-household' && (
            <form className="space-y-4" onSubmit={submitSetup}>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Household setup</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Connect {user.email} to the shared workspace</h2>
                <p className="mt-2 text-sm text-slate-400">Create the household once, or join it from the second phone using the same slug and invite code.</p>
              </div>

              <div className="flex rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
                {[
                  ['create', 'Create'],
                  ['join', 'Join'],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setJoinMode(value)} className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${joinMode === value ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {joinMode === 'create' && (
                <Field label="Household name">
                  <input value={householdName} onChange={(event) => setHouseholdName(event.target.value)} required className="input-shell" />
                </Field>
              )}
              <Field label="Household slug">
                <input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} required className="input-shell" />
              </Field>
              <Field label="Invite code">
                <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} type="password" minLength={6} required className="input-shell" />
              </Field>
              <Field label="Owner attribution">
                <select value={ownerLabel} onChange={(event) => setOwnerLabel(event.target.value)} className="input-shell">
                  {ownerOptions.filter((owner) => owner !== 'Joint').map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </Field>
              {authError && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{authError}</p>}
              <button disabled={authPending} className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60">
                {authPending ? 'Saving…' : joinMode === 'create' ? 'Create shared household' : 'Join shared household'}
              </button>
            </form>
          )}

          {!cloudEnabled && (
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Local fallback</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Cloud sync not configured yet</h2>
              <p className="mt-3 text-sm text-slate-400">
                You can still use the app locally with autosave to this device. Once Supabase variables are added, the same UI will unlock shared sign-in and household sync.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  )
}
