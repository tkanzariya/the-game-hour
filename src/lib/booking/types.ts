export type EventCategory = 'social' | 'corporate'

export type VenueType = 'indoor' | 'outdoor'
export type PaymentMode = 'online' | 'online_cash'

export type BookingDetails = {
  event_category: EventCategory
  email: string
  birthday_person_name: string
  company_name: string
  contact_name: string
  address: string
  phone: string
  event_type: string
  participant_count: string
  age_group: string
  event_date: string
  event_time: string
  venue_name: string
  venue_type: VenueType | ''
  payment_mode: PaymentMode | ''
  referral_source: string
  special_requirements: string
  terms_accepted: boolean
}

export type BookingFieldErrors = Partial<
  Record<keyof BookingDetails | 'payment_screenshot', string>
>

export function emptyBookingDetails(category: EventCategory): BookingDetails {
  return {
    event_category: category,
    email: '',
    birthday_person_name: '',
    company_name: '',
    contact_name: '',
    address: '',
    phone: '',
    event_type: '',
    participant_count: '',
    age_group: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_type: '',
    payment_mode: '',
    referral_source: '',
    special_requirements: '',
    terms_accepted: false,
  }
}
