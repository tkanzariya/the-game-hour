export type EventDateRangeFilter =
  | 'all'
  | 'current_month'
  | 'last_month'
  | 'last_6_months'
  | 'current_year'
  | 'last_year'

function ymd(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function eventDateRangeBounds(
  range: EventDateRangeFilter,
  now = new Date(),
): { from?: string; to?: string } {
  const year = now.getFullYear()
  const month = now.getMonth()
  if (range === 'current_month') {
    return { from: ymd(year, month, 1), to: ymd(year, month + 1, 0) }
  }
  if (range === 'last_month') {
    return { from: ymd(year, month - 1, 1), to: ymd(year, month, 0) }
  }
  if (range === 'last_6_months') {
    return { from: ymd(year, month - 5, 1), to: ymd(year, month + 1, 0) }
  }
  if (range === 'current_year') {
    return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
  if (range === 'last_year') {
    return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }
  }
  return {}
}

export const DATE_RANGE_OPTIONS: { value: EventDateRangeFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'current_month', label: 'Current month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'current_year', label: 'Current year' },
  { value: 'last_year', label: 'Last year' },
]
