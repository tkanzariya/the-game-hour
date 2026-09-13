import bookingForm from '@/data/content/booking-form.json'
import type { BookingDetails, EventCategory } from './types'

export function getBookingFormContent() {
  return bookingForm
}

export function getBookingTitle(category: EventCategory): string {
  return category === 'corporate'
    ? bookingForm.titles.corporate
    : bookingForm.titles.social
}

export type BookingSubmitResult =
  | { ok: true; bookingId: string | number }
  | { ok: false; error: string; fields?: Record<string, string> }

const BOOKINGS_URL = import.meta.env.VITE_BOOKINGS_API_URL ?? '/cms/api/bookings.php'

export async function submitBooking(
  details: BookingDetails,
  screenshot: File,
): Promise<BookingSubmitResult> {
  const form = new FormData()
  form.append(
    'payload',
    JSON.stringify({
      ...details,
      participant_count: Number(details.participant_count),
      terms_accepted: true,
    }),
  )
  form.append('payment_screenshot', screenshot)

  const res = await fetch(BOOKINGS_URL, {
    method: 'POST',
    body: form,
  })

  let data: {
    ok?: boolean
    bookingId?: string | number
    error?: string
    fields?: Record<string, string>
  } = {}

  try {
    data = (await res.json()) as typeof data
  } catch {
    return {
      ok: false,
      error: 'Could not reach the booking server. Is the PHP CMS running?',
    }
  }

  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data.error ?? 'Booking failed. Please try again.',
      fields: data.fields,
    }
  }

  return { ok: true, bookingId: data.bookingId ?? '' }
}
