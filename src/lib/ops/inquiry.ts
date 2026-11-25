import { ROUTES } from '@/constants/routes'
import { gameEventTypeLabel } from './gameOptions'
import type { InquiryStatus, OpsGame, OpsInquiry } from './types'

export const INQUIRY_EXPIRY_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
  { minutes: 360, label: '6 hours' },
  { minutes: 720, label: '12 hours' },
  { minutes: 1440, label: '24 hours' },
  { minutes: 2880, label: '2 days' },
  { minutes: 10080, label: '7 days' },
]

export const DEFAULT_EXPIRY_MINUTES = 1440

export const INQUIRY_STATUS: Record<
  InquiryStatus,
  { label: string; badge: string; hint: string }
> = {
  pending: {
    label: 'Pending',
    badge: 'badge-warning',
    hint: 'Created, not opened yet',
  },
  opened: {
    label: 'Opened',
    badge: 'badge-info',
    hint: 'The customer has opened the link',
  },
  submitted: {
    label: 'Submitted',
    badge: 'badge-success',
    hint: 'The customer chose their games',
  },
  expired: {
    label: 'Expired',
    badge: 'badge-neutral',
    hint: 'The link no longer works',
  },
}

export function inquiryLink(token: string): string {
  return `${window.location.origin}${ROUTES.chooseGames}/${token}`
}

/** Offset between the server clock and this browser, so countdowns match the server. */
export function clockOffsetMs(serverTime: string): number {
  const server = new Date(serverTime).getTime()
  return Number.isNaN(server) ? 0 : server - Date.now()
}

export function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return 'Expired'
  const totalMinutes = Math.ceil(msLeft / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  return `${minutes}m`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "Birthday, Kitty Party" */
export function eventTypesLabel(types: string[] | undefined): string {
  return (types ?? []).map(gameEventTypeLabel).join(', ')
}

/** "birthday and kitty party", for use inside a sentence. */
export function eventTypesPhrase(types: string[] | undefined): string {
  const labels = (types ?? []).map((type) => gameEventTypeLabel(type).toLowerCase())
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

export function whatsappShareUrl(inquiry: OpsInquiry): string {
  const first = inquiry.customer_name.trim().split(/\s+/)[0] || 'there'
  const event = eventTypesPhrase(inquiry.event_types) || 'event'
  const until = new Date(inquiry.expires_at).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
  const message = [
    `Hi ${first}! Here are the games The Game Hour can bring to your ${event}.`,
    '',
    'Pick the ones you like and send them to us:',
    inquiryLink(inquiry.token),
    '',
    `The link is open until ${until}.`,
  ].join('\n')

  let digits = (inquiry.customer_phone ?? '').replace(/\D+/g, '')
  if (digits.length === 10) digits = `91${digits}`
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

/** Event types and age groups steer the game list, but never lock it: any game can still be added. */
export function matchesFilters(
  game: OpsGame,
  eventTypes: string[],
  ageGroups: string[],
): boolean {
  const eventOk =
    eventTypes.length === 0 ||
    (game.event_types ?? []).some((type) => eventTypes.includes(type))
  const ageOk =
    ageGroups.length === 0 ||
    (game.age_groups ?? []).some((age) => ageGroups.includes(age))
  return eventOk && ageOk
}
