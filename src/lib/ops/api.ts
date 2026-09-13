import type {
  EventCategoryFilter,
  EventStatusFilter,
  OpsEventDetail,
  OpsEventPatch,
  OpsEventSummary,
  OpsGame,
  OpsTeamMember,
  OpsUser,
} from './types'

const AUTH_ME = '/cms/api/auth/me.php'
const AUTH_LOGIN = '/cms/api/auth/login.php'
const AUTH_LOGOUT = '/cms/api/auth/logout.php'
const EVENTS_URL = '/cms/api/ops/events.php'
const GAMES_URL = '/cms/api/ops/games.php'
const TEAM_URL = '/cms/api/ops/team.php'

type JsonMap = Record<string, unknown>

async function readJson(res: Response): Promise<JsonMap> {
  try {
    return (await res.json()) as JsonMap
  } catch {
    return {}
  }
}

export type SessionPayload = {
  ok: boolean
  user: OpsUser | null
  csrf: string
  error?: string
}

export async function fetchSession(): Promise<SessionPayload> {
  const res = await fetch(AUTH_ME, { credentials: 'include' })
  const data = await readJson(res)
  return {
    ok: Boolean(data.ok),
    user: (data.user as OpsUser | null) ?? null,
    csrf: String(data.csrf ?? ''),
    error: typeof data.error === 'string' ? data.error : undefined,
  }
}

export async function loginOps(
  username: string,
  password: string,
): Promise<SessionPayload> {
  let res: Response
  try {
    res = await fetch(AUTH_LOGIN, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    return {
      ok: false,
      user: null,
      csrf: '',
      error: 'The PHP CMS is not running on port 8765. Keep Vite open and run npm run cms:dev in another terminal (PHP must be installed and on PATH).',
    }
  }
  const raw = await res.text()
  let data: JsonMap = {}
  try {
    data = JSON.parse(raw) as JsonMap
  } catch {
    data = {}
  }
  const fallbackError =
    res.status === 502 || res.status === 503
      ? 'The PHP CMS is not running on port 8765. Keep Vite open and run npm run cms:dev in another terminal (PHP must be installed and on PATH).'
      : 'Could not sign in. Is the PHP CMS running?'
  return {
    ok: Boolean(data.ok) && data.user != null,
    user: (data.user as OpsUser | null) ?? null,
    csrf: String(data.csrf ?? ''),
    error: typeof data.error === 'string' ? data.error : fallbackError,
  }
}

export async function logoutOps(): Promise<void> {
  await fetch(AUTH_LOGOUT, { method: 'POST', credentials: 'include' })
}

export async function fetchEvents(filters: {
  category: EventCategoryFilter
  status: EventStatusFilter
  q: string
}): Promise<{ ok: true; events: OpsEventSummary[] } | { ok: false; error: string }> {
  const params = new URLSearchParams()
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.q.trim()) params.set('q', filters.q.trim())
  const query = params.toString()
  const res = await fetch(`${EVENTS_URL}${query ? `?${query}` : ''}`, {
    credentials: 'include',
  })
  const raw = await res.text()
  let data: JsonMap = {}
  try {
    data = JSON.parse(raw) as JsonMap
  } catch {
    data = {}
  }
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: String(data.error ?? 'Could not load events.'),
    }
  }
  return { ok: true, events: (data.events as OpsEventSummary[]) ?? [] }
}

export async function fetchEvent(
  id: string,
): Promise<{ ok: true; event: OpsEventDetail } | { ok: false; error: string }> {
  const res = await fetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`, {
    credentials: 'include',
  })
  const data = await readJson(res)
  if (!res.ok || !data.ok || !data.event) {
    return { ok: false, error: String(data.error ?? 'Event not found.') }
  }
  return { ok: true, event: data.event as OpsEventDetail }
}

export async function updateEvent(
  id: string,
  patch: OpsEventPatch,
  csrf: string,
): Promise<{ ok: true; event: OpsEventDetail } | { ok: false; error: string }> {
  const res = await fetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
    body: JSON.stringify(patch),
  })
  const data = await readJson(res)
  if (!res.ok || !data.ok || !data.event) {
    return { ok: false, error: String(data.error ?? 'Could not save event.') }
  }
  return { ok: true, event: data.event as OpsEventDetail }
}

export async function deleteEvent(
  id: string,
  csrf: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrf,
    },
  })
  const data = await readJson(res)
  if (!res.ok || !data.ok) {
    return { ok: false, error: String(data.error ?? 'Could not delete event.') }
  }
  return { ok: true }
}

export async function fetchGames(): Promise<OpsGame[]> {
  const res = await fetch(GAMES_URL, { credentials: 'include' })
  const data = await readJson(res)
  if (!res.ok || !data.ok) return []
  return (data.games as OpsGame[]) ?? []
}

export async function fetchTeam(): Promise<OpsTeamMember[]> {
  const res = await fetch(TEAM_URL, { credentials: 'include' })
  const data = await readJson(res)
  if (!res.ok || !data.ok) return []
  return (data.team as OpsTeamMember[]) ?? []
}
