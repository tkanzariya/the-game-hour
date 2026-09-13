export type OpsRole = 'admin' | 'coach'

export type OpsUser = {
  id: number
  name: string
  email: string
  role: OpsRole
}

export type EventCategoryFilter = 'all' | 'social' | 'corporate'
export type EventStatusFilter = 'all' | 'pending' | 'upcoming' | 'completed'

export type OpsEventSummary = {
  id: number | string
  display_name: string
  event_category: 'social' | 'corporate'
  event_status: 'pending' | 'upcoming' | 'completed'
  email: string
  contact_name: string
  phone: string
  address: string
  birthday_person_name: string | null
  company_name: string | null
  instagram_handle: string | null
  event_type: string | null
  participant_count: number
  age_group: string | null
  event_date: string
  event_time: string
  venue_name: string | null
  venue_type: 'indoor' | 'outdoor' | null
  payment_mode: string | null
  referral_source: string | null
  special_requirements: string | null
  price: number | null
  advance_amount: number | null
  full_payment_amount: number | null
  event_expenses: number | null
  advance_payment_date: string | null
  full_payment_date: string | null
  advance_payment_completed: boolean
  full_payment_completed: boolean
  added_to_calendar: boolean
  has_screenshot: boolean
  created_at: string | null
}

export type OpsNamedRef = {
  id: number
  name: string
}

export type OpsEventDetail = OpsEventSummary & {
  games: OpsNamedRef[]
  team: OpsNamedRef[]
  screenshot_url: string | null
}

export type OpsGame = {
  id: number
  name: string
  description?: string | null
  formation?: string | null
  venue_indoor?: boolean
  venue_outdoor?: boolean
}

export type OpsTeamMember = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  position?: string
}

export type OpsEventPatch = {
  event_status?: OpsEventSummary['event_status']
  venue_name?: string | null
  event_date?: string
  event_time?: string
  price?: number | null
  event_expenses?: number | null
  advance_amount?: number | null
  full_payment_amount?: number | null
  advance_payment_date?: string | null
  full_payment_date?: string | null
  advance_payment_completed?: boolean
  full_payment_completed?: boolean
  added_to_calendar?: boolean
  instagram_handle?: string | null
  event_type?: string | null
  age_group?: string | null
  participant_count?: number
  venue_type?: 'indoor' | 'outdoor'
  special_requirements?: string | null
  game_ids?: number[]
  team_ids?: number[]
}
