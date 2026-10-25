import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { Countdown } from '@/components/ops/inquiries/Countdown'
import {
  InquiryActionDialog,
  type InquiryDialogMode,
} from '@/components/ops/inquiries/InquiryActionDialog'
import { InquiryStatusBadge } from '@/components/ops/inquiries/InquiryStatusBadge'
import { ROUTES } from '@/constants/routes'
import { loadGames, loadInquiry } from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import { gameAgeGroupLabel, gameEventTypeLabel } from '@/lib/ops/gameOptions'
import { formatDateTime, inquiryLink, whatsappShareUrl } from '@/lib/ops/inquiry'
import { useOpsToast } from '@/lib/ops/toast'
import { useMsLeft } from '@/lib/ops/useMsLeft'
import type { OpsGame, OpsInquiry } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

export default function OpsInquiryDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { csrf } = useOpsAuth()
  const { notify } = useOpsToast()
  const justCreated = Boolean(
    (location.state as { justCreated?: boolean } | null)?.justCreated,
  )

  const [inquiry, setInquiry] = useState<OpsInquiry | null>(null)
  const [games, setGames] = useState<OpsGame[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<InquiryDialogMode | null>(null)

  const apply = useCallback((result: Awaited<ReturnType<typeof loadInquiry>>) => {
    if (result.ok) {
      setInquiry(result.inquiry)
      setError(null)
    } else {
      setError(result.error)
    }
  }, [])

  const refresh = useCallback(async () => {
    apply(await loadInquiry(id))
  }, [apply, id])

  useEffect(() => {
    void loadInquiry(id).then(apply)
    void loadGames().then((result) => {
      if (result.ok) setGames(result.games)
    })
    // Pick up "opened" / "submitted" while this page stays open.
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 20000)
    return () => window.clearInterval(timer)
  }, [apply, id, refresh])

  const copyLink = async () => {
    if (!inquiry) return
    const link = inquiryLink(inquiry.token)
    try {
      await navigator.clipboard.writeText(link)
      notify('Link copied')
    } catch {
      window.prompt('Copy this link', link)
    }
  }

  if (error && !inquiry) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div role="alert" className="alert alert-error">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            className="btn btn-sm h-10"
            onClick={() => void refresh()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="flex justify-center py-16" role="status">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    )
  }

  const byId = new Map(games.map((game) => [game.id, game]))
  const offered = (inquiry.game_ids ?? []).map((gameId) => ({
    id: gameId,
    name: byId.get(gameId)?.name ?? `Game ${gameId}`,
    picked: (inquiry.selected_ids ?? []).includes(gameId),
  }))
  const live = inquiry.status === 'pending' || inquiry.status === 'opened'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold">
            {inquiry.customer_name}
          </h1>
          <InquiryStatusBadge status={inquiry.status} />
        </div>
        <p className="text-base-content/70 text-sm">
          {gameEventTypeLabel(inquiry.event_type)} ·{' '}
          {inquiry.age_groups.map(gameAgeGroupLabel).join(', ')}
          {inquiry.participants ? ` · ${inquiry.participants} participants` : ''}
        </p>
      </div>

      {justCreated ? (
        <div role="status" className="alert alert-success">
          <span>
            Inquiry created. Share the link below with {inquiry.customer_name}.
          </span>
        </div>
      ) : null}

      <section className="card card-border bg-base-100" aria-labelledby="share-heading">
        <div className="card-body gap-4 p-4 sm:p-6">
          <h2 id="share-heading" className="font-heading text-lg font-semibold">
            Share the link
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              aria-label="Customer link"
              className="input h-11 w-full font-mono text-sm"
              value={inquiryLink(inquiry.token)}
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              className="btn h-11 shrink-0 gap-2"
              onClick={() => void copyLink()}
            >
              <Icon name="clipboard-list" size="sm" />
              Copy
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={whatsappShareUrl(inquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn h-11 gap-2 border-0 bg-[var(--color-whatsapp)] text-white hover:brightness-95"
            >
              <Icon name="comments" size="sm" />
              Share on WhatsApp
            </a>
            <a
              href={inquiryLink(inquiry.token)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost h-11 gap-2"
            >
              <Icon name="external-link" size="sm" />
              Preview as customer
            </a>
          </div>
          {!inquiry.customer_phone ? (
            <p className="text-base-content/60 text-sm">
              Add a WhatsApp number in Edit to open the chat with the customer directly.
            </p>
          ) : null}
        </div>
      </section>

      <section
        className="card card-border bg-base-100"
        aria-labelledby="expiry-heading"
      >
        <div className="card-body gap-4 p-4 sm:p-6">
          <h2 id="expiry-heading" className="font-heading text-lg font-semibold">
            Link expiry
          </h2>
          <ExpiryLine inquiry={inquiry} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn h-11"
              onClick={() => setDialog('extend')}
            >
              Extend
            </button>
            {live ? (
              <button
                type="button"
                className="btn btn-outline btn-error h-11"
                onClick={() => setDialog('expire')}
              >
                Expire Now
              </button>
            ) : null}
            {inquiry.status === 'submitted' ? (
              <button
                type="button"
                className="btn h-11"
                onClick={() => setDialog('reopen')}
              >
                Let Them Change Games
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card card-border bg-base-100" aria-labelledby="games-heading">
        <div className="card-body gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="games-heading" className="font-heading text-lg font-semibold">
              {inquiry.status === 'submitted' ? 'Chosen games' : 'Games offered'}
            </h2>
            <p className="text-base-content/70 text-sm">
              {inquiry.selected_count} chosen of {inquiry.game_count} offered
              {inquiry.max_games ? ` · up to ${inquiry.max_games}` : ''}
            </p>
          </div>
          {inquiry.status !== 'submitted' && inquiry.selected_count === 0 ? (
            <p className="text-base-content/70 text-sm">
              {inquiry.status === 'expired'
                ? 'The link expired before they chose.'
                : 'Nothing chosen yet. You’ll get an email when they send their games.'}
            </p>
          ) : null}
          <ul className="divide-base-200 divide-y">
            {offered.map((game) => (
              <li
                key={game.id}
                className={cn(
                  'flex min-h-11 items-center gap-3 py-2',
                  !game.picked &&
                    inquiry.status === 'submitted' &&
                    'text-base-content/50',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full',
                    game.picked
                      ? 'bg-success text-success-content'
                      : 'border-base-300 border',
                  )}
                  aria-hidden
                >
                  {game.picked ? (
                    <Icon name="check" size="sm" className="size-4" />
                  ) : null}
                </span>
                <span className={cn(game.picked && 'font-semibold')}>
                  {game.name}
                  <span className="sr-only">
                    {game.picked ? ' (chosen)' : ' (not chosen)'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="card card-border bg-base-100"
        aria-labelledby="activity-heading"
      >
        <div className="card-body gap-3 p-4 sm:p-6">
          <h2 id="activity-heading" className="font-heading text-lg font-semibold">
            Activity
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <Meta label="Created" value={formatDateTime(inquiry.created_at)} />
            <Meta label="Opened" value={formatDateTime(inquiry.opened_at)} />
            <Meta label="Submitted" value={formatDateTime(inquiry.submitted_at)} />
            <Meta label="Expires" value={formatDateTime(inquiry.expires_at)} />
          </dl>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`${ROUTES.opsInquiries}/${inquiry.id}/edit`}
          className="btn h-11 gap-2"
        >
          <Icon name="pencil" size="sm" />
          Edit
        </Link>
        <button
          type="button"
          className="btn btn-ghost text-error h-11 gap-2"
          onClick={() => setDialog('delete')}
        >
          <Icon name="trash" size="sm" />
          Delete
        </button>
      </div>

      <InquiryActionDialog
        key={dialog ?? 'none'}
        mode={dialog}
        inquiry={inquiry}
        csrf={csrf}
        onClose={() => setDialog(null)}
        onUpdated={(updated) => {
          setInquiry(updated)
          setDialog(null)
        }}
        onDeleted={() => {
          setDialog(null)
          navigate(ROUTES.opsInquiries)
        }}
      />
    </div>
  )
}

function ExpiryLine({ inquiry }: { inquiry: OpsInquiry }) {
  const left = useMsLeft(inquiry.expires_at, inquiry.server_time)
  if (inquiry.status === 'submitted') {
    return (
      <p className="text-base-content/70 text-sm">Submitted. The link is now locked.</p>
    )
  }
  return (
    <p className="text-lg font-semibold" aria-live="polite">
      {left <= 0 ? (
        <span className="text-error">Expired</span>
      ) : (
        <Countdown
          expiresAt={inquiry.expires_at}
          serverTime={inquiry.server_time}
          prefix="Closes in "
        />
      )}
      <span className="text-base-content/60 ml-2 text-sm font-normal">
        {left <= 0 ? 'on ' : 'at '}
        {formatDateTime(inquiry.expires_at)}
      </span>
    </p>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </>
  )
}

function BackLink() {
  return (
    <Link to={ROUTES.opsInquiries} className="btn btn-ghost -ml-3 h-11 w-fit gap-2">
      <Icon name="arrow-left" size="sm" />
      Inquiries
    </Link>
  )
}
