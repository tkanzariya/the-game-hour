import type {
  EventCategoryFilter,
  EventStatusFilter,
  OpsEventDetail,
  OpsEventPatch,
  OpsEventSummary,
  OpsGame,
  OpsGameFieldErrors,
  InventoryFieldErrors,
  InventoryItem,
  InventoryItemDetail,
  InventoryItemInput,
  InventoryAdjustmentInput,
  InventoryPurchaseInput,
  InventoryTotals,
  OpsGameInput,
  OpsInquiry,
  OpsInquiryFieldErrors,
  OpsInquiryInput,
  PublicInquiry,
  OpsSummary,
  OpsSummaryPeriod,
  OpsTeamMember,
  OpsUser,
} from './types'

const AUTH_ME = '/cms/api/auth/me.php'
const AUTH_LOGIN = '/cms/api/auth/login.php'
const AUTH_LOGOUT = '/cms/api/auth/logout.php'
const EVENTS_URL = '/cms/api/ops/events.php'
const GAMES_URL = '/cms/api/ops/games.php'
const INQUIRIES_URL = '/cms/api/ops/inquiries.php'
const PUBLIC_INQUIRY_VIEW = '/cms/api/inquiry/view.php'
const PUBLIC_INQUIRY_SUBMIT = '/cms/api/inquiry/submit.php'
const INVENTORY_URL = '/cms/api/ops/inventory.php'
const TEAM_URL = '/cms/api/ops/team.php'
const SUMMARY_URL = '/cms/api/ops/summary.php'

type JsonMap = Record<string, unknown>

async function readJson(res: Response): Promise<JsonMap> {
  try {
    return (await res.json()) as JsonMap
  } catch {
    return {}
  }
}

function notifySessionExpired(res: Response): void {
  if (res.status === 401 || res.status === 419) {
    window.dispatchEvent(new Event('ops:session-expired'))
  }
}

async function opsFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, { credentials: 'include', ...init })
  notifySessionExpired(res)
  return res
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
  from?: string
  to?: string
}): Promise<{ ok: true; events: OpsEventSummary[] } | { ok: false; error: string }> {
  const params = new URLSearchParams()
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  const query = params.toString()
  const res = await opsFetch(`${EVENTS_URL}${query ? `?${query}` : ''}`)
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
  const res = await opsFetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`)
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
  const res = await opsFetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`, {
    method: 'POST',
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
  const res = await opsFetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
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

export async function syncEventToCalendar(
  id: string,
  csrf: string,
): Promise<{ ok: true; event: OpsEventDetail; action: string } | { ok: false; error: string }> {
  try {
    const res = await opsFetch(`${EVENTS_URL}?id=${encodeURIComponent(id)}&action=calendar`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrf },
    })
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.event) {
      return { ok: false, error: String(data.error ?? 'Could not update Google Calendar.') }
    }
    return {
      ok: true,
      event: data.event as OpsEventDetail,
      action: String(data.action ?? ''),
    }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export async function fetchGames(): Promise<OpsGame[]> {
  const res = await opsFetch(GAMES_URL)
  const data = await readJson(res)
  if (!res.ok || !data.ok) return []
  return (data.games as OpsGame[]) ?? []
}

export async function loadGames(): Promise<
  { ok: true; games: OpsGame[] } | { ok: false; error: string }
> {
  try {
    const res = await opsFetch(GAMES_URL)
    const data = await readJson(res)
    if (!res.ok || !data.ok) {
      return { ok: false, error: String(data.error ?? 'Could not load games.') }
    }
    return { ok: true, games: (data.games as OpsGame[]) ?? [] }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export type GameSaveResult =
  | { ok: true; game: OpsGame }
  | { ok: false; error: string; fieldErrors?: OpsGameFieldErrors }

export async function saveGame(
  id: number | null,
  input: OpsGameInput,
  csrf: string,
): Promise<GameSaveResult> {
  const res = await opsFetch(id === null ? GAMES_URL : `${GAMES_URL}?id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify({
      ...input,
      avg_duration_minutes: input.avg_duration_minutes.trim(),
    }),
  })
  const data = await readJson(res)
  if (!res.ok || !data.ok || !data.game) {
    return {
      ok: false,
      error: String(data.error ?? 'Could not save game.'),
      fieldErrors: (data.errors as OpsGameFieldErrors | undefined) ?? undefined,
    }
  }
  return { ok: true, game: data.game as OpsGame }
}

export async function deleteGame(
  id: number,
  csrf: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await opsFetch(`${GAMES_URL}?id=${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrf },
  })
  const data = await readJson(res)
  if (!res.ok || !data.ok) {
    return { ok: false, error: String(data.error ?? 'Could not delete game.') }
  }
  return { ok: true }
}

export async function fetchTeam(): Promise<OpsTeamMember[]> {
  const res = await opsFetch(TEAM_URL)
  const data = await readJson(res)
  if (!res.ok || !data.ok) return []
  return (data.team as OpsTeamMember[]) ?? []
}

export async function fetchSummary(
  period: OpsSummaryPeriod,
): Promise<{ ok: true; summary: OpsSummary } | { ok: false; error: string }> {
  const res = await opsFetch(`${SUMMARY_URL}?period=${encodeURIComponent(period)}`)
  const data = await readJson(res)
  if (!res.ok || !data.ok || !data.summary) {
    return { ok: false, error: String(data.error ?? 'Could not load dashboard.') }
  }
  return { ok: true, summary: data.summary as OpsSummary }
}

/* ---------------------------------------------------------------- inquiries */

export async function loadInquiries(): Promise<
  { ok: true; inquiries: OpsInquiry[] } | { ok: false; error: string }
> {
  try {
    const res = await opsFetch(INQUIRIES_URL)
    const data = await readJson(res)
    if (!res.ok || !data.ok) {
      return { ok: false, error: String(data.error ?? 'Could not load inquiries.') }
    }
    return { ok: true, inquiries: (data.inquiries as OpsInquiry[]) ?? [] }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export async function loadInquiry(
  id: string,
): Promise<{ ok: true; inquiry: OpsInquiry } | { ok: false; error: string; notFound?: boolean }> {
  try {
    const res = await opsFetch(`${INQUIRIES_URL}?id=${encodeURIComponent(id)}`)
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.inquiry) {
      return {
        ok: false,
        error: String(data.error ?? 'Could not load this inquiry.'),
        notFound: res.status === 404,
      }
    }
    return { ok: true, inquiry: data.inquiry as OpsInquiry }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export type InquirySaveResult =
  | { ok: true; inquiry: OpsInquiry }
  | { ok: false; error: string; fieldErrors?: OpsInquiryFieldErrors }

export async function saveInquiry(
  id: number | null,
  input: OpsInquiryInput,
  csrf: string,
): Promise<InquirySaveResult> {
  try {
    const res = await opsFetch(id === null ? INQUIRIES_URL : `${INQUIRIES_URL}?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify(input),
    })
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.inquiry) {
      return {
        ok: false,
        error: String(data.error ?? 'Could not save the inquiry.'),
        fieldErrors: (data.errors as OpsInquiryFieldErrors | undefined) ?? undefined,
      }
    }
    return { ok: true, inquiry: data.inquiry as OpsInquiry }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export async function inquiryAction(
  id: number,
  action: 'expire' | 'extend' | 'reopen',
  csrf: string,
  minutes?: number,
): Promise<{ ok: true; inquiry: OpsInquiry } | { ok: false; error: string }> {
  try {
    const res = await opsFetch(`${INQUIRIES_URL}?id=${id}&action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ minutes }),
    })
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.inquiry) {
      return { ok: false, error: String(data.error ?? 'Could not update the inquiry.') }
    }
    return { ok: true, inquiry: data.inquiry as OpsInquiry }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

export async function deleteInquiry(
  id: number,
  csrf: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await opsFetch(`${INQUIRIES_URL}?id=${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrf },
    })
    const data = await readJson(res)
    if (!res.ok || !data.ok) {
      return { ok: false, error: String(data.error ?? 'Could not delete the inquiry.') }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
}

/* ----------------------------------------------- customer (public, no login) */

export type PublicInquiryResult =
  | { ok: true; inquiry: PublicInquiry }
  | { ok: false; error: string; code?: string }

async function publicInquiryRequest(
  url: string,
  init?: RequestInit,
): Promise<PublicInquiryResult> {
  try {
    const res = await fetch(url, init)
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.inquiry) {
      return {
        ok: false,
        error: String(data.error ?? 'Something went wrong. Please try again.'),
        code: typeof data.code === 'string' ? data.code : undefined,
      }
    }
    return { ok: true, inquiry: data.inquiry as PublicInquiry }
  } catch {
    return {
      ok: false,
      error: 'We could not reach the server. Check your connection and try again.',
      code: 'network',
    }
  }
}

export function fetchPublicInquiry(token: string): Promise<PublicInquiryResult> {
  return publicInquiryRequest(`${PUBLIC_INQUIRY_VIEW}?token=${encodeURIComponent(token)}`)
}

export function submitPublicInquiry(
  token: string,
  gameIds: number[],
): Promise<PublicInquiryResult> {
  return publicInquiryRequest(PUBLIC_INQUIRY_SUBMIT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, game_ids: gameIds }),
  })
}

/* ---------------------------------------------------------------- inventory */

export type InventoryResult =
  | { ok: true; item: InventoryItemDetail }
  | { ok: false; error: string; fieldErrors?: InventoryFieldErrors }

const NETWORK_ERROR = 'Could not reach the server. Check your connection.'

async function inventoryItemRequest(url: string, init: RequestInit): Promise<InventoryResult> {
  try {
    const res = await opsFetch(url, init)
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.item) {
      return {
        ok: false,
        error: String(data.error ?? 'Could not save that.'),
        fieldErrors: (data.errors as InventoryFieldErrors | undefined) ?? undefined,
      }
    }
    return { ok: true, item: data.item as InventoryItemDetail }
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
}

export async function loadInventory(): Promise<
  { ok: true; items: InventoryItem[]; totals: InventoryTotals } | { ok: false; error: string }
> {
  try {
    const res = await opsFetch(INVENTORY_URL)
    const data = await readJson(res)
    if (!res.ok || !data.ok) {
      return { ok: false, error: String(data.error ?? 'Could not load inventory.') }
    }
    return {
      ok: true,
      items: (data.items as InventoryItem[]) ?? [],
      totals: data.totals as InventoryTotals,
    }
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
}

export async function loadInventoryItem(
  id: number,
): Promise<{ ok: true; item: InventoryItemDetail } | { ok: false; error: string; notFound?: boolean }> {
  try {
    const res = await opsFetch(`${INVENTORY_URL}?id=${id}`)
    const data = await readJson(res)
    if (!res.ok || !data.ok || !data.item) {
      return {
        ok: false,
        error: String(data.error ?? 'Could not load this item.'),
        notFound: res.status === 404,
      }
    }
    return { ok: true, item: data.item as InventoryItemDetail }
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
}

export function saveInventoryItem(
  id: number | null,
  input: InventoryItemInput,
  csrf: string,
): Promise<InventoryResult> {
  return inventoryItemRequest(id === null ? INVENTORY_URL : `${INVENTORY_URL}?id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(input),
  })
}

export async function deleteInventoryItem(
  id: number,
  csrf: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await opsFetch(`${INVENTORY_URL}?resource=item&id=${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrf },
    })
    const data = await readJson(res)
    if (!res.ok || !data.ok) {
      return { ok: false, error: String(data.error ?? 'Could not delete the item.') }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
}

/** Create (purchaseId null) or edit a purchase. Sent as a form so an invoice file can ride along. */
export function saveInventoryPurchase(
  itemId: number,
  purchaseId: number | null,
  input: InventoryPurchaseInput,
  csrf: string,
): Promise<InventoryResult> {
  const form = new FormData()
  form.append('item_id', String(itemId))
  form.append('purchased_on', input.purchased_on)
  form.append('quantity', input.quantity.trim())
  form.append('price_mode', input.price_mode)
  form.append('price', input.price.trim())
  form.append('vendor', input.vendor)
  form.append('notes', input.notes)
  if (input.invoice) form.append('invoice', input.invoice)
  else if (input.remove_invoice) form.append('remove_invoice', '1')
  const query = purchaseId === null ? '?resource=purchase' : `?resource=purchase&id=${purchaseId}`
  return inventoryItemRequest(`${INVENTORY_URL}${query}`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrf },
    body: form,
  })
}

export function deleteInventoryPurchase(id: number, csrf: string): Promise<InventoryResult> {
  return inventoryItemRequest(`${INVENTORY_URL}?resource=purchase&id=${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrf },
  })
}

export function saveInventoryAdjustment(
  itemId: number,
  input: InventoryAdjustmentInput,
  csrf: string,
): Promise<InventoryResult> {
  return inventoryItemRequest(`${INVENTORY_URL}?resource=adjustment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify({ ...input, item_id: itemId }),
  })
}

export function deleteInventoryAdjustment(id: number, csrf: string): Promise<InventoryResult> {
  return inventoryItemRequest(`${INVENTORY_URL}?resource=adjustment&id=${id}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrf },
  })
}

export function inventoryInvoiceUrl(purchaseId: number, download = false): string {
  return `${INVENTORY_URL}?resource=invoice&id=${purchaseId}${download ? '&download=1' : ''}`
}
