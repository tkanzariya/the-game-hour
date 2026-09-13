import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { fetchEvents } from '@/lib/ops/api'
import {
  DATE_RANGE_OPTIONS,
  eventDateRangeBounds,
  type EventDateRangeFilter,
} from '@/lib/ops/dateRange'
import {
  ageGroupLabel,
  eventTypeLabel,
  formatBookingDate,
  formatEventDate,
  formatEventTime,
  formatMoney,
  formatMonthHeading,
  statusLabel,
} from '@/lib/ops/format'
import type {
  EventCategoryFilter,
  EventStatusFilter,
  OpsEventSummary,
} from '@/lib/ops/types'
import { ROUTES } from '@/constants/routes'

export default function OpsEventsPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<EventCategoryFilter>('all')
  const [status, setStatus] = useState<EventStatusFilter>('all')
  const [dateRange, setDateRange] = useState<EventDateRangeFilter>('all')
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<OpsEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(q), 250)
    return () => window.clearTimeout(handle)
  }, [q])

  const rangeBounds = useMemo(() => eventDateRangeBounds(dateRange), [dateRange])

  useEffect(() => {
    setPage(1)
  }, [category, status, search, dateRange])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchEvents({
      category,
      status,
      q: search,
      from: rangeBounds.from,
      to: rangeBounds.to,
    })
      .then((result) => {
        if (cancelled) return
        if (!result.ok) {
          setError(result.error)
          setEvents([])
          return
        }
        setError(null)
        setEvents(result.events)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category, status, search, rangeBounds.from, rangeBounds.to])

  const grouped = useMemo(() => groupByMonth(events), [events])
  const pages = useMemo(() => paginateMonthGroups(grouped, PAGE_SIZE), [grouped])
  const pageCount = Math.max(pages.length, 1)
  const currentPage = Math.min(page, pageCount)
  const visibleGroups = pages[currentPage - 1] ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-base-content/70">
          Filter by category and status. New bookings from the website land here as
          pending.
        </p>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Category</legend>
              <div className="join">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn join-item ${category === option.value ? 'btn-active' : ''}`}
                    onClick={() => setCategory(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Status</legend>
              <div className="join join-vertical sm:join-horizontal">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn join-item ${status === option.value ? 'btn-active' : ''}`}
                    onClick={() => setStatus(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="fieldset w-full lg:w-56">
              <legend className="fieldset-legend">Date range</legend>
              <select
                className="select w-full"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value as EventDateRangeFilter)
                }
              >
                {DATE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
          <label className="input w-full">
            <span className="label">Search</span>
            <input
              type="search"
              placeholder="Customer, company, or phone"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/70">
            <li className="flex items-center gap-2">
              <span className="bg-secondary/30 inline-block size-4 rounded-field" />
              Social
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-info/30 inline-block size-4 rounded-field" />
              Corporate
            </li>
            <li className="flex items-center gap-2">
              <span className="status status-warning" />
              Pending
            </li>
            <li className="flex items-center gap-2">
              <span className="status status-error" />
              Cancelled
            </li>
            <li className="flex items-center gap-2">
              <span className="status status-success" />
              Completed
            </li>
          </ul>
        </div>
      </div>

      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" aria-label="Loading events" />
        </div>
      ) : events.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">No events in this view</h2>
            <p>Try another status or category, or wait for a new booking.</p>
          </div>
        </div>
      ) : (
        <>
        <div className="hidden md:block">
          <div className="rounded-box bg-base-100 shadow">
            <table className="table table-fixed table-sm w-full">
              <colgroup>
                <col className="w-28" />
                <col className="w-24" />
                <col />
                <col className="w-16" />
                <col className="w-32" />
                <col />
                <col className="w-16" />
                <col className="w-28" />
                <col className="w-12" />
              </colgroup>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>
                    <span className="sr-only">Status</span>
                  </th>
                  <th>Phone</th>
                  <th>Venue</th>
                  <th>People</th>
                  <th>Age</th>
                  <th>
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              {visibleGroups.map((group) => (
                <tbody key={group.heading}>
                  <tr>
                    <th colSpan={9} className="bg-base-200 font-semibold">
                      {group.heading}
                    </th>
                  </tr>
                  {group.events.map((event) => {
                    const viewPath = `${ROUTES.opsEvents}/${event.id}`
                    return (
                      <tr
                        key={String(event.id)}
                        className={`cursor-pointer ${rowTone(event.event_category)}`}
                        tabIndex={0}
                        aria-label={`View ${event.display_name}`}
                        onClick={() => navigate(viewPath)}
                        onKeyDown={(e) => onRowKey(e, () => navigate(viewPath))}
                      >
                        <td className="whitespace-nowrap">
                          {formatEventDate(event.event_date)}
                        </td>
                        <td className="whitespace-nowrap">
                          {formatEventTime(event.event_time)}
                        </td>
                        <td className="font-medium">
                          <CellTip text={event.display_name} />
                        </td>
                        <td>
                          <StatusDot status={event.event_status} />
                        </td>
                        <td>
                          <CellTip text={event.phone} />
                        </td>
                        <td>
                          <CellTip text={event.venue_name ?? ''} />
                        </td>
                        <td className="text-end tabular-nums">
                          {event.participant_count}
                        </td>
                        <td>
                          <CellTip text={ageGroupLabel(event.age_group)} />
                        </td>
                        <td>
                          <EditEventButton
                            id={event.id}
                            name={event.display_name}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              ))}
            </table>
          </div>
        </div>
        <div className="space-y-3 md:hidden">
          {visibleGroups.map((group) => (
            <section key={group.heading} className="space-y-2">
              <h2 className="text-base font-semibold">{group.heading}</h2>
              <div className="grid gap-2">
                {group.events.map((event) => (
                  <EventMobileRow key={String(event.id)} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
        {pageCount > 1 ? (
          <EventsPagination
            page={currentPage}
            pageCount={pageCount}
            onPage={setPage}
          />
        ) : null}
        </>
      )}
    </div>
  )
}

function EventMobileRow({ event }: { event: OpsEventSummary }) {
  const navigate = useNavigate()
  const viewPath = `${ROUTES.opsEvents}/${event.id}`

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${event.display_name}`}
      className={`card card-sm min-w-0 cursor-pointer overflow-hidden shadow-sm ${rowTone(event.event_category)}`}
      onClick={() => navigate(viewPath)}
      onKeyDown={(e) => onRowKey(e, () => navigate(viewPath))}
    >
      <div className="card-body min-w-0 gap-2 p-3">
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium leading-tight">{event.display_name}</h3>
            <p className="text-xs text-base-content/70">{eventTypeLabel(event.event_type)}</p>
          </div>
          <EditEventButton id={event.id} name={event.display_name} />
        </div>
        <span
          className={`badge badge-sm w-fit ${
            event.event_status === 'pending'
              ? 'badge-warning'
              : event.event_status === 'cancelled'
                ? 'badge-error'
                : 'badge-success'
          }`}
        >
          {statusLabel(event.event_status)}
        </span>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
          <div>
            <dt className="text-xs text-base-content/50">Event</dt>
            <dd>{formatEventDate(event.event_date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/50">Booked</dt>
            <dd>{formatBookingDate(event.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/50">Price</dt>
            <dd className="font-medium">{formatMoney(event.price)}</dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/50">People</dt>
            <dd>{event.participant_count}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

function EditEventButton({
  id,
  name,
}: {
  id: OpsEventSummary['id']
  name: string
}) {
  const stopRow = (event: MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <Link
      to={`${ROUTES.opsEvents}/${id}?edit=1`}
      className="btn btn-ghost btn-square btn-sm shrink-0"
      aria-label={`Edit ${name}`}
      onClick={stopRow}
    >
      <Icon name="pencil" size="sm" />
    </Link>
  )
}

function CellTip({ text }: { text: string }) {
  const value = text.trim()
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null)
  if (!value || value === '—') {
    return <span className="text-base-content/40">—</span>
  }
  return (
    <>
      <span
        className="block truncate"
        onMouseEnter={(event) => {
          const el = event.currentTarget
          if (el.scrollWidth <= el.clientWidth + 1) return
          const box = el.getBoundingClientRect()
          const maxWidth = 320
          const left = Math.min(box.left, window.innerWidth - maxWidth - 12)
          setTip({ left: Math.max(12, left), top: box.bottom + 8 })
        }}
        onMouseLeave={() => setTip(null)}
      >
        {value}
      </span>
      {tip
        ? createPortal(
            <div
              role="tooltip"
              className="rounded-box bg-neutral text-neutral-content pointer-events-none fixed z-50 max-w-xs px-3 py-2 text-sm shadow-lg"
              style={{ left: tip.left, top: tip.top }}
            >
              {value}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function StatusDot({ status }: { status: OpsEventSummary['event_status'] }) {
  const color =
    status === 'pending'
      ? 'status-warning'
      : status === 'cancelled'
        ? 'status-error'
        : 'status-success'
  const label = statusLabel(status)
  return (
    <div className="tooltip tooltip-bottom" data-tip={label}>
      <span className={`status ${color}`} aria-label={label} />
    </div>
  )
}

function rowTone(category: OpsEventSummary['event_category']) {
  return category === 'corporate'
    ? 'bg-info/15 hover:bg-info/25'
    : 'bg-secondary/15 hover:bg-secondary/25'
}

function onRowKey(event: KeyboardEvent, open: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    open()
  }
}

const categoryOptions: { value: EventCategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'social', label: 'Social' },
  { value: 'corporate', label: 'Corporate' },
]

const statusOptions: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

const PAGE_SIZE = 20

type MonthGroup = { heading: string; events: OpsEventSummary[] }

function paginateMonthGroups(groups: MonthGroup[], pageSize: number): MonthGroup[][] {
  const pages: MonthGroup[][] = []
  let current: MonthGroup[] = []
  let count = 0
  for (const group of groups) {
    const size = group.events.length
    if (current.length > 0 && count + size > pageSize) {
      pages.push(current)
      current = []
      count = 0
    }
    current.push(group)
    count += size
  }
  if (current.length > 0) pages.push(current)
  return pages
}

function EventsPagination({
  page,
  pageCount,
  onPage,
}: {
  page: number
  pageCount: number
  onPage: (page: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-base-content/70">
        Page {page} of {pageCount}
      </p>
      <div className="join">
        <button
          type="button"
          className="btn join-item"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        <button type="button" className="btn join-item btn-active">
          {page}
        </button>
        <button
          type="button"
          className="btn join-item"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function groupByMonth(events: OpsEventSummary[]) {
  const groups: { heading: string; events: OpsEventSummary[] }[] = []
  for (const event of events) {
    const heading = formatMonthHeading(event.event_date)
    const last = groups[groups.length - 1]
    if (last && last.heading === heading) {
      last.events.push(event)
    } else {
      groups.push({ heading, events: [event] })
    }
  }
  return groups
}
