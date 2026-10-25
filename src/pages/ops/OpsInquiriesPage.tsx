import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { Countdown } from '@/components/ops/inquiries/Countdown'
import { InquiryStatusBadge } from '@/components/ops/inquiries/InquiryStatusBadge'
import { ROUTES } from '@/constants/routes'
import { loadInquiries } from '@/lib/ops/api'
import { gameAgeGroupLabel, gameEventTypeLabel } from '@/lib/ops/gameOptions'
import { INQUIRY_STATUS, formatDateTime } from '@/lib/ops/inquiry'
import type { InquiryStatus, OpsInquiry } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type StatusFilter = 'all' | InquiryStatus
const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: INQUIRY_STATUS.pending.label },
  { value: 'opened', label: INQUIRY_STATUS.opened.label },
  { value: 'submitted', label: INQUIRY_STATUS.submitted.label },
  { value: 'expired', label: INQUIRY_STATUS.expired.label },
]

export default function OpsInquiriesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [inquiries, setInquiries] = useState<OpsInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rawStatus = params.get('status')
  const status: StatusFilter = FILTERS.some((f) => f.value === rawStatus)
    ? (rawStatus as StatusFilter)
    : 'all'
  const q = params.get('q') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value && value !== 'all') next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const apply = useCallback((result: Awaited<ReturnType<typeof loadInquiries>>) => {
    if (result.ok) {
      setInquiries(result.inquiries)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadInquiries().then(apply)
    // Statuses change while the customer is on their page, so keep this list fresh.
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadInquiries().then(apply)
    }, 30000)
    return () => window.clearInterval(timer)
  }, [apply])

  const counts = useMemo(() => {
    const out: Record<StatusFilter, number> = {
      all: inquiries.length,
      pending: 0,
      opened: 0,
      submitted: 0,
      expired: 0,
    }
    for (const inquiry of inquiries) out[inquiry.status] += 1
    return out
  }, [inquiries])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return inquiries.filter((inquiry) => {
      if (status !== 'all' && inquiry.status !== status) return false
      if (needle && !inquiry.customer_name.toLowerCase().includes(needle)) return false
      return true
    })
  }, [inquiries, status, q])

  const open = (inquiry: OpsInquiry) => navigate(`${ROUTES.opsInquiries}/${inquiry.id}`)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Inquiries</h1>
          <p className="text-base-content/70 text-sm" aria-live="polite">
            {loading
              ? 'Share a game list and let customers choose.'
              : `${inquiries.length} ${inquiries.length === 1 ? 'inquiry' : 'inquiries'}`}
          </p>
        </div>
        <Link to={ROUTES.opsInquiryNew} className="btn btn-primary h-11 gap-2">
          <Icon name="plus" size="sm" />
          New Inquiry
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Status"
          className="join max-w-full overflow-x-auto"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={status === option.value}
              className={cn(
                'btn join-item h-11 shrink-0 gap-1.5',
                status === option.value ? 'btn-primary' : 'btn-outline border-base-300',
              )}
              onClick={() => setParam('status', option.value)}
            >
              {option.label}
              <span className="text-xs opacity-70">{counts[option.value]}</span>
            </button>
          ))}
        </div>
        <label className="input h-11 w-full lg:max-w-xs">
          <Icon name="search" size="sm" className="text-base-content/50" />
          <input
            type="search"
            placeholder="Search customer name"
            aria-label="Search inquiries"
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-3"
          role="status"
          aria-label="Loading inquiries"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-20 rounded-box" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="alert alert-error">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            className="btn btn-sm h-10"
            onClick={() => {
              setLoading(true)
              void loadInquiries().then(apply)
            }}
          >
            Try Again
          </button>
        </div>
      ) : inquiries.length === 0 ? (
        <Empty
          title="No inquiries yet"
          body="Create one, pick the games you can offer, and share the link."
          action={
            <Link to={ROUTES.opsInquiryNew} className="btn btn-primary h-11 gap-2">
              <Icon name="plus" size="sm" />
              New Inquiry
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <Empty
          title="No inquiries match"
          body="Try a different status or search."
          action={
            <button
              type="button"
              className="btn h-11"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="card card-border bg-base-100 hidden overflow-x-auto xl:block">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Event Type</th>
                  <th>Age Group</th>
                  <th>Games Chosen</th>
                  <th>Status</th>
                  <th>Timing</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-base-200/60 cursor-pointer"
                    onClick={() => open(inquiry)}
                  >
                    <td className="font-semibold">
                      <Link
                        to={`${ROUTES.opsInquiries}/${inquiry.id}`}
                        className="link link-hover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inquiry.customer_name}
                      </Link>
                    </td>
                    <td>{gameEventTypeLabel(inquiry.event_type)}</td>
                    <td>{inquiry.age_groups.map(gameAgeGroupLabel).join(', ')}</td>
                    <td className="whitespace-nowrap">
                      {inquiry.status === 'submitted'
                        ? `${inquiry.selected_count} of ${inquiry.game_count}`
                        : `— of ${inquiry.game_count}`}
                    </td>
                    <td>
                      <InquiryStatusBadge status={inquiry.status} />
                    </td>
                    <td className="whitespace-nowrap">
                      <ExpiresCell inquiry={inquiry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="card card-border bg-base-100 divide-base-200 divide-y xl:hidden">
            {visible.map((inquiry) => (
              <li key={inquiry.id}>
                <Link
                  to={`${ROUTES.opsInquiries}/${inquiry.id}`}
                  className="hover:bg-base-200/60 flex min-h-16 flex-col gap-1 px-4 py-3"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-primary font-semibold">
                      {inquiry.customer_name}
                    </span>
                    <InquiryStatusBadge status={inquiry.status} />
                  </span>
                  <span className="text-base-content/70 text-sm">
                    {gameEventTypeLabel(inquiry.event_type)} ·{' '}
                    {inquiry.age_groups.map(gameAgeGroupLabel).join(', ')}
                  </span>
                  <span className="text-base-content/60 text-xs">
                    {inquiry.status === 'submitted'
                      ? `${inquiry.selected_count} of ${inquiry.game_count} games chosen`
                      : `${inquiry.game_count} games offered`}
                    {' · '}
                    <ExpiresCell inquiry={inquiry} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function ExpiresCell({ inquiry }: { inquiry: OpsInquiry }) {
  if (inquiry.status === 'submitted')
    return <>Submitted {formatDateTime(inquiry.submitted_at)}</>
  if (inquiry.status === 'expired')
    return <>Expired {formatDateTime(inquiry.expires_at)}</>
  return (
    <Countdown
      expiresAt={inquiry.expires_at}
      serverTime={inquiry.server_time}
      prefix="Closes in "
    />
  )
}

function Empty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body items-center gap-2 py-12 text-center">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-base-content/70 max-w-sm text-sm">{body}</p>
        <div className="mt-2">{action}</div>
      </div>
    </div>
  )
}
