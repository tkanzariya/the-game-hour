/**
 * Runtime constants derived from src/data/content/*.json
 * Do not edit values here — update the JSON content files instead.
 */
import {
  getCorporateBookingUrl,
  getDefaultBookingUrl,
  getBookingLinks,
} from '@/lib/content/booking'
import { getContactInfo, getSiteInfo } from '@/lib/content/company'
import { getSocialUrlsRecord } from '@/lib/content/social'

const site = getSiteInfo()
const contact = getContactInfo()
const bookingUrls = getBookingLinks().urls
const socialUrls = getSocialUrlsRecord()

export const SITE = site

export const CONTACT = contact

export const BOOKING = {
  url: getDefaultBookingUrl(),
  corporateUrl: getCorporateBookingUrl(),
  /** Raw URLs from content (same as BOOKING.url / corporateUrl). */
  urls: bookingUrls,
} as const

export const SOCIAL = {
  instagram: socialUrls.instagram ?? '',
  linkedin: socialUrls.linkedin ?? '',
} as const

/** Feature flags for floating contact actions */
export const FEATURE_FLAGS = {
  floatingCta: true,
  whatsappButton: true,
  callButton: true,
} as const
