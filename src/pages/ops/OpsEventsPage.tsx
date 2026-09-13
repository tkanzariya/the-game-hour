import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { fetchEvents } from '@/lib/ops/api'
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
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<OpsEventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(q), 250)
    return () => window.clearTimeout(handle)
  }, [q])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchEvents({ category, status, q: search })
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
  }, [category, status, search])

  const grouped = useMemo(() => groupByMonth(events), [events])

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
        <div className="card-body gap-4">
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
              <span className="status status-info" />
              Upcoming
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
              {grouped.map((group) => (
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
        <div className="space-y-4 md:hidden">
          {grouped.map((group) => (
            <section key={group.heading} className="space-y-2">
              <h2 className="text-lg font-medium">{group.heading}</h2>
              <ul className="list rounded-box bg-base-100 shadow">
                {group.events.map((event) => (
                  <EventMobileRow key={String(event.id)} event={event} />
                ))}
              </ul>
            </section>
          ))}
        </div>
        </>
      )}
    </div>
  )
}

function EventMobileRow({ event }: { event: OpsEventSummary }) {
  const navigate = useNavigate()
  const viewPath = `${ROUTES.opsEvents}/${event.id}`

  return (
    <li
      role="link"
      tabIndex={0}
      aria-label={`View ${event.display_name}`}
      className={`list-row cursor-pointer ${rowTone(event.event_category)}`}
      onClick={() => navigate(viewPath)}
      onKeyDown={(e) => onRowKey(e, () => navigate(viewPath))}
    >
      <StatusDot status={event.event_status} />
      <div className="list-col-grow">
        <div className="font-medium">{event.display_name}</div>
        <div className="text-sm text-base-content/70">{eventTypeLabel(event.event_type)}</div>
        <div className="text-sm text-base-content/70">
          Event {formatEventDate(event.event_date)}
        </div>
        <div className="text-sm text-base-content/70">
          Booked {formatBookingDate(event.created_at)}
        </div>
        <div className="text-sm font-medium">{formatMoney(event.price)}</div>
      </div>
      <EditEventButton id={event.id} name={event.display_name} />
    </li>
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
      className="btn btn-ghost btn-square btn-sm"
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
      : status === 'upcoming'
        ? 'status-info'
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
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]

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
