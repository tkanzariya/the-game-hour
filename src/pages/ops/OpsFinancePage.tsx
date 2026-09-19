import { useEffect, useState } from 'react'
import { fetchSummary } from '@/lib/ops/api'
import { formatMoney } from '@/lib/ops/format'
import type { OpsSummary, OpsSummaryPeriod } from '@/lib/ops/types'

const PERIODS: { id: OpsSummaryPeriod; label: string }[] = [
  { id: 'all', label: 'All dates' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
  { id: 'last_year', label: 'Last year' },
]

export default function OpsFinancePage() {
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
        return
      }
      setError(null)
      setSummary(result.summary)
    })
    return () => {
      cancelled = true
    }
  }, [period])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold">Finance</h1>
        <div role="tablist" className="tabs tabs-box">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={`tab ${period === item.id ? 'tab-active' : ''}`}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}
      {loading && !summary ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" aria-label="Loading" />
        </div>
      ) : null}
      {summary ? (
        <>
          <div className="stats stats-vertical bg-base-100 shadow sm:stats-horizontal w-full">
            <div className="stat">
              <div className="stat-title">Booked</div>
              <div className="stat-value text-xl">{formatMoney(summary.kpis.booked_price)}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Advances in</div>
              <div className="stat-value text-xl">{formatMoney(summary.kpis.collected_advance)}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Still to collect</div>
              <div className="stat-value text-xl">{formatMoney(summary.kpis.remaining)}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Expenses</div>
              <div className="stat-value text-xl">{formatMoney(summary.kpis.expenses)}</div>
            </div>
          </div>
          <p className="text-sm opacity-70">
            Social {summary.kpis.social_in_range} · Corporate {summary.kpis.corporate_in_range}
          </p>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Price</th>
                  <th>Advances</th>
                  <th>Finals received</th>
                  <th>Expenses</th>
                  <th>Social</th>
                  <th>Corporate</th>
                </tr>
              </thead>
              <tbody>
                {summary.by_month.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No money recorded in this range.</td>
                  </tr>
                ) : (
                  summary.by_month.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatMoney(row.price)}</td>
                      <td>{formatMoney(row.advance)}</td>
                      <td>{formatMoney(row.final)}</td>
                      <td>{formatMoney(row.expenses)}</td>
                      <td>{row.social}</td>
                      <td>{row.corporate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}
