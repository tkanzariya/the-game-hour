import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { fetchEvents } from '@/lib/ops/api'
import {
  categoryLabel,
  formatEventDate,
  formatEventTime,
  formatMoney,
  statusLabel,
} from '@/lib/ops/format'
import type { OpsEventSummary } from '@/lib/ops/types'
import { ROUTES } from '@/constants/routes'

function monthBounds(anchor: Date): { from: string; to: string; label: string } {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const from = new Date(y, m, 1)
  const to = new Date(y, m + 1, 0)
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    from: ymd(from),
    to: ymd(to),
    label: from.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  }
}

export default function OpsCalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const bounds = useMemo(() => monthBounds(cursor), [cursor])
  const [events, setEvents] = useState<OpsEventSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchEvents({
      category: 'all',
      status: 'all',
      q: '',
      from: bounds.from,
      to: bounds.to,
    }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setEvents([])
        return
      }
      setError(null)
      setEvents(result.events)
    })
    return () => {
      cancelled = true
    }
  }, [bounds.from, bounds.to])

  const byDay = useMemo(() => {
    const map: Record<string, OpsEventSummary[]> = {}
    for (const event of events) {
      const key = event.event_date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(event)
    }
    return map
  }, [events])

  const start = new Date(`${bounds.from}T00:00:00`)
  const startWeekday = (start.getDay() + 6) % 7
  const daysInMonth = Number(bounds.to.slice(8, 10))
  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${bounds.from.slice(0, 7)}-${String(d).padStart(2, '0')}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Calendar</h1>
        <div className="join">
          <button
            type="button"
            className="btn join-item"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            Previous
          </button>
          <span className="btn join-item pointer-events-none">{bounds.label}</span>
          <button
            type="button"
            className="btn join-item"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>
      </div>
      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" aria-label="Loading" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-2 py-1 text-xs font-semibold uppercase opacity-60">
                {d}
              </div>
            ))}
            {cells.map((ymd, i) => (
              <div key={ymd ?? `e-${i}`} className="card card-border min-h-28 bg-base-100 p-2">
                {ymd ? (
                  <>
                    <p className="text-xs font-semibold">{Number(ymd.slice(8))}</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {(byDay[ymd] ?? []).map((event) => (
                        <li key={String(event.id)}>
                          <CalendarEventLink event={event} />
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarEventLink({ event }: { event: OpsEventSummary }) {
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null)

  return (
    <>
      <Link
        to={`${ROUTES.opsEvents}/${event.id}`}
        className={`block truncate rounded px-1 py-0.5 text-xs transition ${
          event.event_category === 'corporate' ? 'bg-info/20 hover:bg-info/40' : 'bg-secondary/20 hover:bg-secondary/40'
        }`}
        onMouseEnter={(mouseEvent) => {
          const box = mouseEvent.currentTarget.getBoundingClientRect()
          const width = 260
          const left = Math.min(box.left, window.innerWidth - width - 12)
          const top = box.bottom + 8
          setTip({ left: Math.max(12, left), top })
        }}
        onMouseLeave={() => setTip(null)}
      >
        {formatEventTime(event.event_time)} {event.display_name}
      </Link>
      {tip
        ? createPortal(
            <div
              role="tooltip"
              className="card card-sm pointer-events-none fixed z-50 w-64 bg-neutral text-neutral-content shadow-lg"
              style={{ left: tip.left, top: tip.top }}
            >
              <div className="card-body gap-1 py-3">
                <p className="font-heading font-semibold">{event.display_name}</p>
                <p className="text-sm text-neutral-content/80">
                  {formatEventDate(event.event_date)}
                  {event.event_time ? ` · ${formatEventTime(event.event_time)}` : ''}
                </p>
                <p className="text-sm">{event.venue_name || 'No venue'}</p>
                <p className="text-sm">
                  {categoryLabel(event.event_category)} · {statusLabel(event.event_status)}
                </p>
                <p className="text-sm tabular-nums">
                  {event.participant_count} people · {formatMoney(event.price)}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
