import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchEvents } from '@/lib/ops/api'
import { formatEventDate, formatMoney } from '@/lib/ops/format'
import type { OpsEventSummary } from '@/lib/ops/types'
import { ROUTES } from '@/constants/routes'

type PayTab = 'screenshot' | 'advance' | 'final'

export default function OpsPaymentsPage() {
  const [tab, setTab] = useState<PayTab>('screenshot')
  const [events, setEvents] = useState<OpsEventSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void fetchEvents({ category: 'all', status: 'pending', q: '' }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEvents(result.events)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const lists = useMemo(
    () => ({
      screenshot: events.filter((e) => !e.has_screenshot),
      advance: events.filter((e) => !e.advance_payment_completed),
      final: events.filter((e) => e.advance_payment_completed && !e.full_payment_completed),
    }),
    [events],
  )

  const rows = lists[tab]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Payments</h1>
      <div role="tablist" className="tabs tabs-box">
        <button
          type="button"
          role="tab"
          className={`tab ${tab === 'screenshot' ? 'tab-active' : ''}`}
          onClick={() => setTab('screenshot')}
        >
          Missing screenshots ({lists.screenshot.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${tab === 'advance' ? 'tab-active' : ''}`}
          onClick={() => setTab('advance')}
        >
          Advance not received ({lists.advance.length})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${tab === 'final' ? 'tab-active' : ''}`}
          onClick={() => setTab('final')}
        >
          Final not received ({lists.final.length})
        </button>
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
      ) : rows.length === 0 ? (
        <div role="status" className="alert">
          <span>Nothing in this list.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Advance</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((event) => (
                <tr key={String(event.id)} className={event.event_category === 'corporate' ? 'bg-info/15' : 'bg-secondary/15'}>
                  <td>
                    <Link className="link link-hover font-medium" to={`${ROUTES.opsEvents}/${event.id}`}>
                      {event.display_name}
                    </Link>
                  </td>
                  <td>{formatEventDate(event.event_date)}</td>
                  <td>{formatMoney(event.advance_amount)}</td>
                  <td>{formatMoney(event.full_payment_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
