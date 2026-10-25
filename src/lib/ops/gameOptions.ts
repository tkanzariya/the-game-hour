import bookingForm from '@/data/content/booking-form.json'

export type Option = { value: string; label: string }

/** Same event types as the booking form, plus Corporate (corporate bookings use their own form). */
export const GAME_EVENT_TYPES: Option[] = [
  ...bookingForm.eventTypes,
  { value: 'corporate', label: 'Corporate' },
]

export const GAME_AGE_GROUPS: Option[] = bookingForm.ageGroups
export const GAME_VENUE_TYPES: Option[] = bookingForm.venueTypes

export const GAME_FORMATIONS: string[] = [
  'Open Formation',
  'Circle Formation',
  'Team Game',
  'Race Game',
  'Rest Game',
]

export const GAME_GROUP_SIZES: string[] = [
  'Small (1-5 people)',
  'Medium (6-10 people)',
  'Large (11-20 people)',
  'Extra Large (21+ people)',
]

export const GAME_DEFAULT_TRAITS: string[] = [
  'Fun & Engaging',
  'Team Building',
  'Competitive',
  'Collaborative',
  'Strategy-Based',
  'Fast-Paced',
  'Physical Activity',
  'Creative',
  'Ice-Breaker',
  'Problem Solving',
  'Communication Skills',
  'Leadership',
  'Critical Thinking',
  'Coordination',
  'Trust Building',
]

export const MAX_GAME_TRAITS = 12

const eventLabels = Object.fromEntries(GAME_EVENT_TYPES.map((o) => [o.value, o.label]))
const ageLabels = Object.fromEntries(GAME_AGE_GROUPS.map((o) => [o.value, o.label]))

export function gameEventTypeLabel(value: string): string {
  return eventLabels[value] ?? value.replaceAll('_', ' ')
}

export function gameAgeGroupLabel(value: string): string {
  return ageLabels[value] ?? value
}

export function gameVenueLabels(game: {
  venue_indoor?: boolean
  venue_outdoor?: boolean
}): string[] {
  const out: string[] = []
  if (game.venue_indoor) out.push('Indoor')
  if (game.venue_outdoor) out.push('Outdoor')
  return out
}

/** Short group-size label for tight spaces: "Medium (6-10 people)" → "Medium · 6-10". */
export function groupSizeShort(value: string | null | undefined): string {
  if (!value) return ''
  const m = value.match(/^(.*?)\s*\((.*?)(?:\s*people)?\)$/)
  return m ? `${m[1]} · ${m[2]}` : value
}
