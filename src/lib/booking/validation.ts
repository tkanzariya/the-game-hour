import type { BookingDetails, BookingFieldErrors, EventCategory } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function todayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Email is required.'
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.'
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Contact number is required.'
  if (digits.length !== 10) return 'Contact number must be exactly 10 digits.'
  return undefined
}

export function validateParticipants(value: string): string | undefined {
  if (!/^\d+$/.test(value.trim())) return 'Enter a number (minimum 1).'
  if (Number(value) < 1) return 'Number of participants must be at least 1.'
  return undefined
}

export function validateEventDate(value: string): string | undefined {
  if (!value) return 'Date is required.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Select a valid date.'
  if (value < todayYmd()) return 'Date cannot be before today.'
  return undefined
}

export function validateEventTime(value: string): string | undefined {
  if (!value) return 'Time is required.'
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return 'Select a valid time.'
  const minute = Number(match[2])
  if (![0, 15, 30, 45].includes(minute)) return 'Minutes must be 00, 15, 30, or 45.'
  return undefined
}

export function validateDetails(
  details: BookingDetails,
  category: EventCategory,
): BookingFieldErrors {
  const errors: BookingFieldErrors = {}

  const emailErr = validateEmail(details.email)
  if (emailErr) errors.email = emailErr

  if (!details.contact_name.trim()) errors.contact_name = 'Your name is required.'
  if (!details.address.trim()) errors.address = 'Address is required.'

  const phoneErr = validatePhone(details.phone)
  if (phoneErr) errors.phone = phoneErr

  const participantsErr = validateParticipants(details.participant_count)
  if (participantsErr) errors.participant_count = participantsErr

  const dateErr = validateEventDate(details.event_date)
  if (dateErr) errors.event_date = dateErr

  const timeErr = validateEventTime(details.event_time)
  if (timeErr) errors.event_time = timeErr

  if (!details.venue_type) errors.venue_type = 'Venue type is required.'
  if (!details.payment_mode) errors.payment_mode = 'Payment mode is required.'
  if (!details.terms_accepted)
    errors.terms_accepted = 'Please agree to the terms and conditions.'

  if (category === 'social') {
    if (!details.event_type) errors.event_type = 'Type of event is required.'
    if (!details.age_group) errors.age_group = 'Age group is required.'
  } else if (!details.company_name.trim()) {
    errors.company_name = 'Company name is required.'
  }

  return errors
}

export function isDetailsValid(
  details: BookingDetails,
  category: EventCategory,
): boolean {
  return Object.keys(validateDetails(details, category)).length === 0
}

/** Convert 24h HH:mm to display label like "3:30 PM" */
export function formatTimeLabel(hhmm: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!match) return ''
  let hour = Number(match[1])
  const minute = match[2]
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:${minute} ${period}`
}

/** Build HH:mm (24h) from 12h parts */
export function to24Hour(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let hour = hour12 % 12
  if (period === 'PM') hour += 12
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function parse24Hour(
  hhmm: string,
): { hour12: number; minute: number; period: 'AM' | 'PM' } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  if (hour === 0) hour = 12
  return { hour12: hour, minute, period }
}

export function formatDisplayDate(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!match) return ymd
  return `${match[3]}/${match[2]}/${match[1]}`
}
