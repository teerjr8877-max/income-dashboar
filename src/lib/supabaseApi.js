import { createStarterWorkspace, loadSession, mergeWorkspaceRecords, normalizeWorkspace, saveSession } from '../data/householdModel'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const baseHeaders = supabaseUrl && supabaseAnonKey
  ? {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    }
  : null

export const cloudEnabled = Boolean(baseHeaders)

function buildUrl(path, params = {}) {
  const url = new URL(`${supabaseUrl}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

async function request(path, { method = 'GET', token, body, params, headers = {} } = {}) {
  if (!cloudEnabled) {
    throw new Error('Supabase environment variables are not configured.')
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      ...baseHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(json?.msg || json?.message || `Supabase request failed with ${response.status}`)
  }

  return json
}

export async function authenticate(email, password, mode = 'signin') {
  const path = mode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password'
  const headers = mode === 'signup' ? {} : { 'Content-Type': 'application/json' }
  const body = mode === 'signup'
    ? { email, password, data: { display_name: email.split('@')[0] } }
    : { email, password }

  const result = await request(path, { method: 'POST', body, headers })
  const session = result.session ?? result
  saveSession(session)
  return session
}

export async function getUser(accessToken) {
  return request('/auth/v1/user', { token: accessToken })
}

export async function refreshSession(refreshToken) {
  const result = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
  const session = result.session ?? result
  saveSession(session)
  return session
}

export function clearSession() {
  saveSession(null)
}

export async function fetchMembership(accessToken, userId) {
  const rows = await request('/rest/v1/household_members', {
    token: accessToken,
    params: {
      select: '*',
      user_id: `eq.${userId}`,
    },
  })
  return rows?.[0] ?? null
}

export async function fetchHouseholdBySlug(accessToken, slug) {
  const rows = await request('/rest/v1/households', {
    token: accessToken,
    params: { select: '*', slug: `eq.${slug}` },
  })
  return rows?.[0] ?? null
}

export async function fetchMembers(accessToken, householdId) {
  return request('/rest/v1/household_members', {
    token: accessToken,
    params: {
      select: 'user_id,display_name,owner_label,last_seen_at,email',
      household_id: `eq.${householdId}`,
      order: 'display_name.asc',
    },
  })
}

export async function fetchWorkspace(accessToken, householdId) {
  const rows = await request('/rest/v1/household_workspaces', {
    token: accessToken,
    params: { select: '*', household_id: `eq.${householdId}` },
  })
  const row = rows?.[0]
  return row
    ? { version: row.version ?? 1, updatedAt: row.updated_at, updatedBy: row.updated_by, payload: normalizeWorkspace(row.payload) }
    : null
}

async function upsert(table, accessToken, body) {
  return request(`/rest/v1/${table}`, {
    method: 'POST',
    token: accessToken,
    body,
    headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
  })
}

export async function createHouseholdWorkspace({ accessToken, user, householdName, slug, inviteCode, ownerLabel }) {
  const createdAt = new Date().toISOString()
  const householdId = crypto.randomUUID()
  const inviteCodeHash = await sha256(inviteCode)
  const householdRows = await upsert('households', accessToken, [{ id: householdId, name: householdName, slug, invite_code_hash: inviteCodeHash, created_by: user.id, created_at: createdAt, updated_at: createdAt }])
  const memberRows = await upsert('household_members', accessToken, [{ household_id: householdId, user_id: user.id, email: user.email, display_name: user.user_metadata?.display_name || user.email, owner_label: ownerLabel, role: 'admin', last_seen_at: createdAt }])
  const starter = createStarterWorkspace({ householdId, householdName, slug, createdBy: user.id })
  const workspaceRows = await upsert('household_workspaces', accessToken, [{ household_id: householdId, version: 1, payload: starter, updated_by: user.id, updated_at: createdAt }])
  return {
    household: householdRows?.[0],
    member: memberRows?.[0],
    workspace: { version: workspaceRows?.[0]?.version ?? 1, payload: starter },
  }
}

export async function joinHouseholdWorkspace({ accessToken, user, slug, inviteCode, ownerLabel }) {
  const household = await fetchHouseholdBySlug(accessToken, slug)
  if (!household) throw new Error('Household not found. Double-check the household slug.')
  const inviteCodeHash = await sha256(inviteCode)
  if (household.invite_code_hash !== inviteCodeHash) {
    throw new Error('Invite code did not match this household.')
  }
  const memberRows = await upsert('household_members', accessToken, [{ household_id: household.id, user_id: user.id, email: user.email, display_name: user.user_metadata?.display_name || user.email, owner_label: ownerLabel, role: 'member', last_seen_at: new Date().toISOString() }])
  return { household, member: memberRows?.[0] }
}

export async function touchMember(accessToken, membership, user) {
  await request('/rest/v1/household_members', {
    method: 'PATCH',
    token: accessToken,
    params: { household_id: `eq.${membership.household_id}`, user_id: `eq.${user.id}` },
    body: { last_seen_at: new Date().toISOString(), display_name: user.user_metadata?.display_name || user.email },
    headers: { Prefer: 'return=representation' },
  })
}

export async function saveWorkspace({ accessToken, householdId, version, payload, userId }) {
  const rows = await request('/rest/v1/household_workspaces', {
    method: 'PATCH',
    token: accessToken,
    params: {
      household_id: `eq.${householdId}`,
      version: `eq.${version}`,
      select: '*',
    },
    body: {
      payload,
      version: version + 1,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    headers: { Prefer: 'return=representation' },
  })
  return rows?.[0] ?? null
}

export async function exportLatestMergedWorkspace({ accessToken, householdId, localWorkspace }) {
  const remote = await fetchWorkspace(accessToken, householdId)
  if (!remote) {
    return { version: 1, payload: localWorkspace }
  }
  return {
    version: remote.version,
    payload: mergeWorkspaceRecords(localWorkspace, remote.payload),
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value)
  const buffer = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function bootstrapSession() {
  const session = loadSession()
  if (!session) return null
  if (session.expires_at && session.expires_at * 1000 < Date.now() + 60_000 && session.refresh_token) {
    try {
      return await refreshSession(session.refresh_token)
    } catch {
      clearSession()
      return null
    }
  }
  return session
}
