import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventsByMonthChart, MoneyByMonthChart } from '@/components/ops/OpsCharts'
import { fetchSummary } from '@/lib/ops/api'
import { formatEventDate, formatEventTime, formatMoney, formatMonthHeading } from '@/lib/ops/format'
import type { OpsSummary, OpsSummaryEvent, OpsSummaryPeriod } from '@/lib/ops/types'
import { ROUTES } from '@/constants/routes'

const PERIODS: { id: OpsSummaryPeriod; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'year', label: 'This year' },
  { id: 'month', label: 'This month' },
]

function rowTint(category?: string): string {
  return category === 'corporate' ? 'bg-info/15' : 'bg-secondary/15'
}

export default function OpsDashboardPage() {
  const [period, setPeriod] = useState<OpsSummaryPeriod>('all')
  const [summary, setSummary] = useState<OpsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchSummary(period).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setSummary(null)
        return
      }
      setError(null)
      setSummary(result.summary)
    })
    return () => {
      cancelled = true
    }
  }, [period])

  const monthTitle = summary
    ? formatMonthHeading(`${summary.this_month.month}-01`)
    : 'This month'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-balance">Home</h1>
        <p className="mt-1 text-pretty text-sm text-base-content/70">
          This month and all time. Point at a line to see the numbers.
        </p>
      </div>

      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      {loading && !summary ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="stats stats-vertical w-full bg-base-100 shadow lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">This month · {monthTitle}</div>
              <div className="stat-value text-primary tabular-nums">
                {formatMoney(summary.this_month.revenue)}
              </div>
              <div className="stat-desc">Revenue</div>
            </div>
            <div className="stat">
              <div className="stat-title">This month</div>
              <div className="stat-value tabular-nums">
                {formatMoney(summary.this_month.expenses)}
              </div>
              <div className="stat-desc">Expense</div>
            </div>
            <div className="stat">
              <div className="stat-title">This month</div>
              <div
                className={`stat-value tabular-nums ${
                  summary.this_month.profit >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {formatMoney(summary.this_month.profit)}
              </div>
              <div className="stat-desc">Profit</div>
            </div>
          </div>

          <div className="stats stats-vertical w-full bg-base-100 shadow lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">All time</div>
              <div className="stat-value tabular-nums">{summary.overall.events}</div>
              <div className="stat-desc">Events</div>
            </div>
            <div className="stat">
              <div className="stat-title">All time</div>
              <div className="stat-value tabular-nums">
                {formatMoney(summary.overall.expenses)}
              </div>
              <div className="stat-desc">Expense</div>
            </div>
            <div className="stat">
              <div className="stat-title">All time</div>
              <div
                className={`stat-value tabular-nums ${
                  summary.overall.profit >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                {formatMoney(summary.overall.profit)}
              </div>
              <div className="stat-desc">Profit</div>
            </div>
          </div>

          <section className="card card-border bg-base-100">
            <div className="card-body">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="card-title text-base">Revenue vs expense</h2>
                  <p className="text-sm text-base-content/70">Each month: money in vs money spent.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-xs">
                    <span className="status status-primary" /> Revenue
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <span className="status status-warning" /> Expense
                  </span>
                  <select
                    className="select select-sm w-36"
                    value={period}
                    aria-label="Graph dates"
                    onChange={(event) => setPeriod(event.target.value as OpsSummaryPeriod)}
                  >
                    {PERIODS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <MoneyByMonthChart rows={summary.by_month} />
            </div>
          </section>

          <section className="card card-border bg-base-100">
            <div className="card-body">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="card-title text-base">Events by month</h2>
                  <p className="text-sm text-base-content/70">How many events in each month.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-info badge-lg gap-2">
                    Coming up
                    <span className="font-semibold tabular-nums">{summary.upcoming_count}</span>
                  </div>
                  <div className="badge badge-error badge-lg gap-2">
                    Date over
                    <span className="font-semibold tabular-nums">{summary.overdue_count}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="status status-success" /> Done
                </span>
                <span className="flex items-center gap-1">
                  <span className="status status-info" /> Coming
                </span>
                <span className="flex items-center gap-1">
                  <span className="status status-error" /> Date over, still pending
                </span>
              </div>
              <EventsByMonthChart rows={summary.by_month} />
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <EventList
              title="Coming up"
              empty="No upcoming events."
              events={summary.upcoming}
            />
            <EventList
              title="Date over, still pending"
              empty="Every past event is marked done or cancelled."
              events={summary.overdue}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

function EventList({
  title,
  empty,
  events,
}: {
  title: string
  empty: string
  events: OpsSummaryEvent[]
}) {
  return (
    <section className="card card-border bg-base-100">
      <div className="card-body">
        <h2 className="card-title text-base">{title}</h2>
        {events.length === 0 ? (
          <p className="text-sm text-base-content/70">{empty}</p>
        ) : (
          <ul className="list">
            {events.map((event) => (
              <li key={String(event.id)} className="list-row px-0">
                <Link
                  to={`${ROUTES.opsEvents}/${event.id}`}
                  className={`rounded-box px-3 py-2 ${rowTint(event.event_category)}`}
                >
                  <span className="font-medium">{event.display_name}</span>
                  <span className="mt-0.5 block text-sm text-base-content/70">
                    {formatEventDate(event.event_date)}
                    {event.event_time ? ` · ${formatEventTime(event.event_time)}` : ''}
                    {event.venue_name ? ` · ${event.venue_name}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
