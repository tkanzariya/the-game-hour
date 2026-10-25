import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { ChooseGameCard } from '@/components/choose-games/ChooseGameCard'
import { GameDetailDialog } from '@/components/choose-games/GameDetailDialog'
import { ReviewDialog } from '@/components/choose-games/ReviewDialog'
import Icon from '@/components/Icon/Icon'
import { Seo } from '@/components/Seo'
import { getLogoUrl } from '@/lib/assets'
import { getContactInfo } from '@/lib/content/company'
import { fetchPublicInquiry, submitPublicInquiry } from '@/lib/ops/api'
import { gameAgeGroupLabel, gameEventTypeLabel } from '@/lib/ops/gameOptions'
import { formatCountdown } from '@/lib/ops/inquiry'
import { useMsLeft } from '@/lib/ops/useMsLeft'
import type { PublicInquiry } from '@/lib/ops/types'
import { buildSeo } from '@/utils/seo'
import { cn } from '@/utils/cn'

type Load =
  | { kind: 'loading' }
  | { kind: 'error'; message: string; code?: string }
  | { kind: 'ready'; inquiry: PublicInquiry }

export default function ChooseGamesPage() {
  const { token = '' } = useParams()
  const [state, setState] = useState<Load>({ kind: 'loading' })

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchPublicInquiry>>) => {
      setState(
        result.ok
          ? { kind: 'ready', inquiry: result.inquiry }
          : { kind: 'error', message: result.error, code: result.code },
      )
    },
    [],
  )

  const load = useCallback(async () => {
    apply(await fetchPublicInquiry(token))
  }, [apply, token])

  useEffect(() => {
    void fetchPublicInquiry(token).then(apply)
  }, [apply, token])

  const seo = buildSeo({
    title: 'Choose your games',
    description: 'Pick the games you would like at your event.',
    noIndex: true,
  })

  return (
    <div className="bg-base-200 flex min-h-svh flex-col">
      <Seo {...seo} />
      <header className="bg-primary text-primary-content">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <img src={getLogoUrl('dark')} alt="The Game Hour" className="h-10 w-auto" />
          {state.kind === 'ready' && state.inquiry.status !== 'submitted' ? (
            <ClosesPill inquiry={state.inquiry} />
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {state.kind === 'loading' ? (
          <div
            className="flex flex-col gap-4"
            role="status"
            aria-label="Loading your games"
          >
            <div className="skeleton h-10 w-2/3 rounded-lg" />
            <div className="skeleton h-5 w-1/2 rounded-lg" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : state.kind === 'error' ? (
          <Message
            icon="flag"
            title={
              state.code === 'not_found'
                ? 'This link isn’t valid'
                : 'We couldn’t load your games'
            }
            body={
              state.code === 'not_found'
                ? 'Please check that you copied the whole link, or ask us to send it again.'
                : state.message
            }
            action={
              state.code === 'not_found' ? null : (
                <button
                  type="button"
                  className="btn btn-primary h-12"
                  onClick={() => void load()}
                >
                  Try Again
                </button>
              )
            }
          />
        ) : (
          <Ready inquiry={state.inquiry} token={token} onRefresh={load} />
        )}
      </main>
    </div>
  )
}

function Ready({
  inquiry,
  token,
  onRefresh,
}: {
  inquiry: PublicInquiry
  token: string
  onRefresh: () => Promise<void>
}) {
  const contact = getContactInfo()
  const first = inquiry.customer_name.trim().split(/\s+/)[0] || 'there'
  const left = useMsLeft(inquiry.expires_at, inquiry.server_time)

  const [chosen, setChosen] = useState<number[]>(inquiry.selected_ids)
  const [query, setQuery] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const games = inquiry.games
  const max = inquiry.max_games ?? null
  const atMax = max !== null && chosen.length >= max

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return games
    return games.filter((game) =>
      `${game.name} ${game.formation ?? ''} ${game.traits.join(' ')}`
        .toLowerCase()
        .includes(needle),
    )
  }, [games, query])

  const chosenGames = games.filter((game) => chosen.includes(game.id))

  const toggle = (id: number) => {
    setChosen((current) =>
      current.includes(id)
        ? current.filter((v) => v !== id)
        : atMax
          ? current
          : [...current, id],
    )
  }

  const send = async () => {
    setSending(true)
    setSendError(null)
    const result = await submitPublicInquiry(token, chosen)
    setSending(false)
    if (result.ok) {
      setReviewing(false)
      await onRefresh()
      window.scrollTo({ top: 0 })
      return
    }
    if (result.code === 'expired' || result.code === 'submitted') {
      setReviewing(false)
      await onRefresh()
      return
    }
    setSendError(result.error)
  }

  const contactActions = (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary h-12 gap-2"
    >
      <Icon name="comments" size="sm" />
      Message us on WhatsApp
    </a>
  )

  if (inquiry.status === 'submitted') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span
          aria-hidden
          className="bg-success text-success-content flex size-16 items-center justify-center rounded-full"
        >
          <Icon name="check" size="lg" />
        </span>
        <div>
          <h1 className="font-heading text-primary text-3xl font-bold">
            Thank you, {first}!
          </h1>
          <p className="text-base-content/70 mt-2">
            We’ve received your games. Our team will be in touch soon to plan your
            event.
          </p>
        </div>
        <section
          className="card card-border bg-base-100 w-full text-left"
          aria-labelledby="your-games"
        >
          <div className="card-body gap-2 p-5">
            <h2 id="your-games" className="font-heading text-lg font-semibold">
              Your games
            </h2>
            <ul className="divide-base-200 divide-y">
              {games
                .filter((game) => inquiry.selected_ids.includes(game.id))
                .map((game) => (
                  <li key={game.id} className="flex min-h-12 items-center gap-3 py-2">
                    <Icon name="check" size="sm" className="text-success" />
                    <span className="font-medium">{game.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
        <p className="text-base-content/60 text-sm">
          Need to change something? Message us and we’ll help.
        </p>
        {contactActions}
      </div>
    )
  }

  if (inquiry.status === 'expired' || left <= 0) {
    return (
      <Message
        icon="clock"
        title="This link has expired"
        body={`Hi ${first}, the time to choose games on this link has passed. Message us and we’ll send you a fresh one.`}
        action={contactActions}
      />
    )
  }

  const details = [
    inquiry.event_type ? gameEventTypeLabel(inquiry.event_type).toLowerCase() : null,
    (inquiry.age_groups ?? []).length > 0
      ? `ages ${(inquiry.age_groups ?? []).map(gameAgeGroupLabel).join(', ')}`
      : null,
    inquiry.participants ? `${inquiry.participants} guests` : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="max-w-2xl">
        <h1 className="font-heading text-primary text-3xl leading-tight font-bold sm:text-4xl">
          Hi {first}, choose your games
        </h1>
        <p className="text-base-content/70 mt-2 text-lg">
          {details.length > 0
            ? `We picked these for your ${details.join(' · ')}. `
            : ''}
          Tap the ones you’d love to play.
          {max ? ` You can choose up to ${max}.` : ''}
        </p>
      </div>

      {games.length > 8 ? (
        <label className="input bg-base-100 h-12 w-full sm:max-w-sm">
          <Icon name="search" size="sm" className="text-base-content/50" />
          <input
            type="search"
            placeholder="Search games"
            aria-label="Search games"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-base-content/70" role="status">
          No games match that search.
        </p>
      ) : (
        <ul className="grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((game) => (
            <li key={game.id}>
              <ChooseGameCard
                game={game}
                selected={chosen.includes(game.id)}
                blocked={atMax}
                onToggle={toggle}
                onOpenDetails={setDetailId}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="bg-base-100/95 border-base-300 fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <p className="text-sm" aria-live="polite">
            <span className="text-primary text-lg font-bold">{chosen.length}</span>{' '}
            {chosen.length === 1 ? 'game' : 'games'} chosen
            {max ? <span className="text-base-content/60"> · up to {max}</span> : null}
            {atMax ? (
              <span className="text-base-content/60 block text-xs">
                That’s the most you can choose. Remove one to swap.
              </span>
            ) : null}
          </p>
          <button
            type="button"
            className="btn btn-primary h-12 min-w-40 text-base"
            disabled={chosen.length === 0}
            onClick={() => {
              setSendError(null)
              setReviewing(true)
            }}
          >
            Review &amp; Send
          </button>
        </div>
      </div>

      <GameDetailDialog
        key={detailId ?? 'none'}
        game={games.find((game) => game.id === detailId) ?? null}
        selected={detailId !== null && chosen.includes(detailId)}
        blocked={atMax}
        onToggle={toggle}
        onClose={() => setDetailId(null)}
      />

      <ReviewDialog
        open={reviewing}
        games={chosenGames}
        sending={sending}
        error={sendError}
        onRemove={(id) => setChosen((current) => current.filter((v) => v !== id))}
        onClose={() => setReviewing(false)}
        onSend={() => void send()}
      />
    </div>
  )
}

function ClosesPill({ inquiry }: { inquiry: PublicInquiry }) {
  const left = useMsLeft(inquiry.expires_at, inquiry.server_time)
  if (left <= 0) return null
  const urgent = left < 15 * 60000
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold',
        urgent ? 'bg-warning text-warning-content' : 'bg-white/15 text-white',
      )}
    >
      <Icon name="clock" size="sm" />
      Open for {formatCountdown(left)}
    </span>
  )
}

function Message({
  icon,
  title,
  body,
  action,
}: {
  icon: string
  title: string
  body: string
  action: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
      <span
        aria-hidden
        className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full"
      >
        <Icon name={icon} size="lg" />
      </span>
      <h1 className="font-heading text-primary text-2xl font-bold">{title}</h1>
      <p className="text-base-content/70">{body}</p>
      {action}
    </div>
  )
}
