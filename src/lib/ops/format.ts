import bookingForm from '@/data/content/booking-form.json'
import type { OpsEventSummary } from './types'

const ageLabels = Object.fromEntries(
  bookingForm.ageGroups.map((item) => [item.value, item.label]),
)
const typeLabels = Object.fromEntries(
  bookingForm.eventTypes.map((item) => [item.value, item.label]),
)

export function formatEventTime(time: string): string {
  const match = time.match(/^(\d{2}):(\d{2})/)
  if (!match) return time
  let hour = Number(match[1])
  const minute = match[2]
  const suffix = hour >= 12 ? 'pm' : 'am'
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:${minute} ${suffix}`
}

export function formatEventDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatBookingDate(value: string | null | undefined): string {
  if (!value) return '—'
  return formatEventDate(value.slice(0, 10))
}

export function formatMonthHeading(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ageGroupLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return ageLabels[value] ?? value
}

export function eventTypeLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return typeLabels[value] ?? value.replaceAll('_', ' ')
}

export function statusLabel(status: OpsEventSummary['event_status']): string {
  if (status === 'pending') return 'Pending'
  if (status === 'cancelled') return 'Cancelled'
  return 'Completed'
}

export function categoryLabel(category: OpsEventSummary['event_category']): string {
  return category === 'corporate' ? 'Corporate' : 'Social'
}

export function timeInputValue(time: string): string {
  const match = time.match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}
