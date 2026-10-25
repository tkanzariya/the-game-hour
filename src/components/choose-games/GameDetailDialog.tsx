import { useEffect, useRef } from 'react'
import Icon from '@/components/Icon/Icon'
import { groupSizeShort } from '@/lib/ops/gameOptions'
import type { PublicInquiryGame } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type GameDetailDialogProps = {
  game: PublicInquiryGame | null
  selected: boolean
  blocked: boolean
  onToggle: (id: number) => void
  onClose: () => void
}

/** Everything about one game: full description, all highlights, the video, and the choice. */
export function GameDetailDialog({
  game,
  selected,
  blocked,
  onToggle,
  onClose,
}: GameDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = game !== null

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const venue = game
    ? [game.venue_indoor ? 'Indoor' : null, game.venue_outdoor ? 'Outdoor' : null]
        .filter(Boolean)
        .join(' & ')
    : ''

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="game-detail-title"
      onClose={onClose}
    >
      <div className="modal-box flex max-h-[90dvh] flex-col p-0 sm:max-w-xl">
        {game ? (
          <>
            <div className="border-base-300 flex items-start justify-between gap-3 border-b px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl"
                >
                  <Icon name="puzzle-piece" />
                </span>
                <div className="min-w-0">
                  <h2
                    id="game-detail-title"
                    className="font-heading text-primary text-xl leading-snug font-semibold"
                  >
                    {game.name}
                  </h2>
                  {game.formation ? (
                    <p className="text-base-content/60 text-sm">{game.formation}</p>
                  ) : null}
                </div>
              </div>
              <form method="dialog">
                <button
                  type="submit"
                  className="btn btn-ghost btn-square size-11 min-h-0"
                  aria-label="Close"
                >
                  <Icon name="x" size="sm" />
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="text-base-content/70 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {game.avg_duration_minutes ? (
                  <li className="flex items-center gap-1.5">
                    <Icon name="clock" size="sm" />
                    {game.avg_duration_minutes} mins
                  </li>
                ) : null}
                {game.group_size ? (
                  <li className="flex items-center gap-1.5">
                    <Icon name="users" size="sm" />
                    {groupSizeShort(game.group_size)}
                  </li>
                ) : null}
                {venue ? (
                  <li className="flex items-center gap-1.5">
                    <Icon
                      name={game.venue_indoor && !game.venue_outdoor ? 'home' : 'sun'}
                      size="sm"
                    />
                    {venue}
                  </li>
                ) : null}
              </ul>

              {game.description ? (
                <p className="text-base-content/90 mt-4 leading-relaxed whitespace-pre-line">
                  {game.description}
                </p>
              ) : null}

              {game.traits.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Highlights">
                  {game.traits.map((trait) => (
                    <li key={trait} className="badge badge-primary badge-soft">
                      {trait}
                    </li>
                  ))}
                </ul>
              ) : null}

              {game.video_url ? (
                <a
                  href={game.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline border-primary text-primary mt-5 h-12 w-full gap-2"
                >
                  <Icon name="play-circle" size="sm" />
                  Watch how it’s played
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </div>

            <div className="border-base-300 border-t p-4">
              <button
                type="button"
                aria-pressed={selected}
                disabled={blocked && !selected}
                onClick={() => {
                  onToggle(game.id)
                  onClose()
                }}
                className={cn(
                  'btn h-12 w-full gap-2 rounded-xl text-base',
                  selected ? 'btn-outline btn-error' : 'btn-primary',
                )}
              >
                {selected ? (
                  'Remove from my games'
                ) : blocked ? (
                  'You’ve reached the limit'
                ) : (
                  <>
                    <Icon name="plus" size="sm" />
                    Choose this game
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}
