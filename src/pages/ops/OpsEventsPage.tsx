import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchEvents } from '@/lib/ops/api'
import {
  ageGroupLabel,
  categoryLabel,
  formatEventDate,
  formatEventTime,
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
  const [category, setCategory] = useState<EventCategoryFilter>('all')
  const [status, setStatus] = useState<EventStatusFilter>('upcoming')
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
        grouped.map((group) => (
          <section key={group.heading} className="space-y-3">
            <h2 className="text-lg font-medium">{group.heading}</h2>
            <div className="hidden overflow-x-auto rounded-box bg-base-100 shadow md:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Venue</th>
                    <th>People</th>
                    <th>Age</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {group.events.map((event) => (
                    <tr key={String(event.id)}>
                      <td>{formatEventDate(event.event_date)}</td>
                      <td>{formatEventTime(event.event_time)}</td>
                      <td>
                        <div className="font-medium">{event.display_name}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <StatusBadge status={event.event_status} />
                          <span className="badge badge-outline badge-sm">
                            {categoryLabel(event.event_category)}
                          </span>
                        </div>
                      </td>
                      <td>{event.phone || '—'}</td>
                      <td>{event.venue_name || '—'}</td>
                      <td>{event.participant_count}</td>
                      <td>{ageGroupLabel(event.age_group)}</td>
                      <td>
                        <Link
                          className="btn btn-sm"
                          to={`${ROUTES.opsEvents}/${event.id}`}
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 md:hidden">
              {group.events.map((event) => (
                <Link
                  key={String(event.id)}
                  to={`${ROUTES.opsEvents}/${event.id}`}
                  className="card bg-base-100 shadow"
                >
                  <div className="card-body gap-2">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge status={event.event_status} />
                      <span className="badge badge-outline badge-sm">
                        {categoryLabel(event.event_category)}
                      </span>
                    </div>
                    <h3 className="card-title text-base">{event.display_name}</h3>
                    <p>
                      {formatEventDate(event.event_date)} · {formatEventTime(event.event_time)}
                    </p>
                    <p>{event.venue_name || 'Venue not set'}</p>
                    <p>
                      {event.participant_count} people
                      {event.age_group ? ` · ${ageGroupLabel(event.age_group)}` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: OpsEventSummary['event_status'] }) {
  const color =
    status === 'pending'
      ? 'badge-warning'
      : status === 'upcoming'
        ? 'badge-info'
        : 'badge-success'
  return <span className={`badge badge-sm ${color}`}>{statusLabel(status)}</span>
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
