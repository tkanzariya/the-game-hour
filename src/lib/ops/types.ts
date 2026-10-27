export type OpsRole = 'admin' | 'coach'

export type OpsUser = {
  id: number
  name: string
  email: string
  role: OpsRole
}

export type EventCategoryFilter = 'all' | 'social' | 'corporate'
export type EventStatusFilter = 'all' | 'pending' | 'cancelled' | 'completed'
export type EventDateRangeFilter = import('./dateRange').EventDateRangeFilter

export type OpsEventSummary = {
  id: number | string
  display_name: string
  event_category: 'social' | 'corporate'
  event_status: 'pending' | 'cancelled' | 'completed'
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
  /** True once the event exists on the shared Google Calendar. */
  on_google_calendar?: boolean
  /** False when Google Calendar has not been set up on the server. */
  calendar_sync_available?: boolean
  /** Plain-words reason Google Calendar is not running yet, if any. */
  calendar_setup_issue?: string | null
}

export type OpsGame = {
  id: number
  name: string
  description?: string | null
  formation?: string | null
  avg_duration_minutes?: number | null
  group_size?: string | null
  traits?: string[]
  video_url?: string | null
  venue_indoor?: boolean
  venue_outdoor?: boolean
  age_groups?: string[]
  event_types?: string[]
}

export type OpsGameInput = {
  name: string
  formation: string
  event_types: string[]
  age_groups: string[]
  venue_indoor: boolean
  venue_outdoor: boolean
  video_url: string
  avg_duration_minutes: string
  description: string
  group_size: string
  traits: string[]
}

export type OpsGameFieldErrors = Partial<Record<keyof OpsGameInput, string>>

export type InquiryStatus = 'pending' | 'opened' | 'submitted' | 'expired'

export type OpsInquiry = {
  id: number
  token: string
  customer_name: string
  customer_phone: string | null
  event_type: string
  age_groups: string[]
  participants: number | null
  max_games: number | null
  status: InquiryStatus
  created_at: string
  expires_at: string
  opened_at: string | null
  submitted_at: string | null
  game_count: number
  selected_count: number
  server_time: string
  /** Only on the single-inquiry response. */
  game_ids?: number[]
  selected_ids?: number[]
  selected_games?: { id: number; name: string }[]
}

export type OpsInquiryInput = {
  customer_name: string
  customer_phone: string
  event_type: string
  age_groups: string[]
  participants: string
  max_games: string
  game_ids: number[]
  expiry_minutes: number
}

export type OpsInquiryFieldErrors = Partial<Record<keyof OpsInquiryInput, string>>

export type PublicInquiryGame = {
  id: number
  name: string
  description: string
  formation: string | null
  avg_duration_minutes: number | null
  group_size: string | null
  traits: string[]
  video_url: string | null
  venue_indoor: boolean
  venue_outdoor: boolean
}

export type PublicInquiry = {
  customer_name: string
  event_type?: string
  age_groups?: string[]
  participants?: number | null
  max_games?: number | null
  status: InquiryStatus
  expires_at: string
  submitted_at?: string | null
  server_time: string
  games: PublicInquiryGame[]
  selected_ids: number[]
}

export type OpsTeamMember = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  position?: string
}

export type OpsSummaryPeriod =
  | 'all'
  | 'week'
  | 'month'
  | 'year'
  | 'last_month'
  | 'last_6_months'
  | 'last_year'

export type OpsSummaryEvent = {
  id: number | string
  display_name: string
  event_date: string
  event_time?: string
  venue_name?: string | null
  event_category?: string
  event_status?: string
}

export type OpsSummaryMonth = {
  month: string
  price: number
  advance: number
  final: number
  expenses: number
  social: number
  corporate: number
  events: number
  finished: number
  upcoming: number
  overdue: number
}

export type OpsSummary = {
  period: OpsSummaryPeriod
  from: string
  to: string
  kpis: {
    pending_next_7: number
    pending_in_range: number
    social_in_range: number
    corporate_in_range: number
    booked_price: number
    collected_advance: number
    remaining: number
    expenses: number
  }
  this_month: {
    month: string
    revenue: number
    expenses: number
    profit: number
  }
  overall: {
    events: number
    revenue: number
    expenses: number
    profit: number
  }
  upcoming: OpsSummaryEvent[]
  overdue: OpsSummaryEvent[]
  upcoming_count: number
  overdue_count: number
  by_month: OpsSummaryMonth[]
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
  payment_mode?: string | null
  referral_source?: string | null
  special_requirements?: string | null
  game_ids?: number[]
  team_ids?: number[]
}
