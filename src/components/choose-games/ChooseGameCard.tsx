import Icon from '@/components/Icon/Icon'
import { groupSizeShort } from '@/lib/ops/gameOptions'
import type { PublicInquiryGame } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type ChooseGameCardProps = {
  game: PublicInquiryGame
  selected: boolean
  /** True when the limit is reached and this game is not one of the chosen. */
  blocked: boolean
  onToggle: (id: number) => void
  onOpenDetails: (id: number) => void
}

const SHOWN_TRAITS = 3

export function ChooseGameCard({
  game,
  selected,
  blocked,
  onToggle,
  onOpenDetails,
}: ChooseGameCardProps) {
  const venue = [
    game.venue_indoor ? 'Indoor' : null,
    game.venue_outdoor ? 'Outdoor' : null,
  ]
    .filter(Boolean)
    .join(' & ')

  const toggle = () => {
    if (!blocked || selected) onToggle(game.id)
  }

  return (
    <article
      className={cn(
        'relative flex h-full flex-col gap-3 rounded-2xl border-2 bg-base-100 p-4 transition-all sm:p-5',
        selected
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-base-300 hover:border-primary/40',
        blocked && !selected && 'opacity-60',
      )}
      onClick={(e) => {
        // The whole card is a big tap target; links and buttons keep their own action.
        if ((e.target as HTMLElement).closest('a,button')) return
        toggle()
      }}
    >
      {selected ? (
        <span
          aria-hidden
          className="bg-primary text-primary-content absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full shadow-md"
        >
          <Icon name="check" size="sm" />
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl"
        >
          <Icon name="puzzle-piece" />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-primary text-lg leading-snug font-semibold">
            {game.name}
          </h3>
          {game.formation ? (
            <p className="text-base-content/60 text-sm">{game.formation}</p>
          ) : null}
        </div>
      </div>

      {game.description ? (
        <p className="text-base-content/80 line-clamp-3 text-[0.95rem] leading-relaxed">
          {game.description}
        </p>
      ) : null}

      <ul className="text-base-content/70 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
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

      {game.traits.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Highlights">
          {game.traits.slice(0, SHOWN_TRAITS).map((trait) => (
            <li key={trait} className="badge badge-primary badge-soft">
              {trait}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-col gap-1 pt-1">
        <div className="flex flex-wrap items-center gap-x-5">
          <button
            type="button"
            className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline"
            onClick={() => onOpenDetails(game.id)}
          >
            View details
            <span className="sr-only"> for {game.name}</span>
          </button>
          {game.video_url ? (
            <a
              href={game.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              <Icon name="play-circle" size="sm" />
              Watch video
              <span className="sr-only"> for {game.name} (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
        <button
          type="button"
          aria-pressed={selected}
          disabled={blocked && !selected}
          onClick={toggle}
          className={cn(
            'btn h-12 w-full gap-2 rounded-xl text-base',
            selected ? 'btn-primary' : 'btn-outline border-primary text-primary',
          )}
        >
          {selected ? <Icon name="check" size="sm" /> : <Icon name="plus" size="sm" />}
          {selected ? 'Chosen' : 'Choose this game'}
          <span className="sr-only">: {game.name}</span>
        </button>
      </div>
    </article>
  )
}
