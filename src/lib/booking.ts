import { getCorporateBookingSlug } from '@/lib/content/booking'

export {
  getBookingLinks,
  getDefaultBookingUrl,
  getCorporateBookingUrl,
  getCorporateBookingSlug,
  getBookingUrlForService,
  getBookingLabels,
  getBookingLabel,
} from '@/lib/content/booking'

/** @deprecated Use getCorporateBookingSlug() from content instead. */
export const CORPORATE_BOOKING_SLUG = getCorporateBookingSlug()

export type BookingContext = 'default' | 'corporate'

export function getBookingContext(serviceSlug?: string): BookingContext {
  return serviceSlug === getCorporateBookingSlug() ? 'corporate' : 'default'
}

export function isCorporateBookingSlug(serviceSlug: string): boolean {
  return serviceSlug === getCorporateBookingSlug()
}
