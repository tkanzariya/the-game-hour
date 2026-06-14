import bookingJson from '@/data/content/booking-links.json'
import type { BookingLinksData } from '@/data/types'

const bookingData = bookingJson as BookingLinksData

export function getBookingLinks() {
  return bookingData
}

export function getDefaultBookingUrl(): string {
  return bookingData.urls.default
}

export function getCorporateBookingUrl(): string {
  return bookingData.urls.corporate
}

export function getCorporateBookingSlug(): string {
  return bookingData.corporateServiceSlug
}

export function getBookingUrlForService(serviceSlug?: string): string {
  if (serviceSlug === bookingData.corporateServiceSlug) {
    return getCorporateBookingUrl()
  }
  return getDefaultBookingUrl()
}

export function getBookingLabels() {
  return bookingData.labels
}

export function getBookingLabel(key: keyof BookingLinksData['labels']): string {
  return bookingData.labels[key]
}
