import Icon from '@/components/Icon/Icon'
import {
  gameAgeGroupLabel,
  gameEventTypeLabel,
  gameVenueLabels,
  groupSizeShort,
} from '@/lib/ops/gameOptions'
import type { OpsGame } from '@/lib/ops/types'

type GameCardProps = {
  game: OpsGame
  onEdit: (game: OpsGame) => void
  onDelete: (game: OpsGame) => void
}

const MAX_TRAITS_SHOWN = 4

export function GameCard({ game, onEdit, onDelete }: GameCardProps) {
  const traits = game.traits ?? []
  const shown = traits.slice(0, MAX_TRAITS_SHOWN)
  const extra = traits.length - shown.length
  const venues = gameVenueLabels(game)
  const ages = (game.age_groups ?? []).map(gameAgeGroupLabel)
  const events = (game.event_types ?? []).map(gameEventTypeLabel)

  return (
    <article className="card card-border bg-base-100 hover:border-primary/30 h-full transition-shadow hover:shadow-md">
      <div className="card-body gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-heading text-primary text-lg leading-snug font-semibold">
            {game.name}
          </h2>
          <div className="-mt-1 -mr-2 flex shrink-0">
            {game.video_url ? (
              <a
                href={game.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-square size-11 min-h-0"
                aria-label={`Watch video for ${game.name} (opens in a new tab)`}
              >
                <Icon name="play-circle" />
              </a>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost btn-square size-11 min-h-0"
              aria-label={`Edit ${game.name}`}
              onClick={() => onEdit(game)}
            >
              <Icon name="pencil" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-square text-error size-11 min-h-0"
              aria-label={`Delete ${game.name}`}
              onClick={() => onDelete(game)}
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>

        <ul className="text-base-content/70 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {game.formation ? (
            <li className="text-base-content font-medium">{game.formation}</li>
          ) : null}
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
        </ul>

        {game.description ? (
          <p className="text-base-content/80 line-clamp-4 text-sm leading-relaxed">
            {game.description}
          </p>
        ) : null}

        {shown.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Traits">
            {shown.map((trait) => (
              <li key={trait} className="badge badge-primary badge-soft">
                {trait}
              </li>
            ))}
            {extra > 0 ? (
              <li
                className="badge badge-ghost"
                title={traits.slice(MAX_TRAITS_SHOWN).join(', ')}
              >
                +{extra} more
              </li>
            ) : null}
          </ul>
        ) : null}

        <dl className="border-base-200 mt-auto grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t pt-3 text-sm">
          <Row label="Ages" value={ages.join(', ')} />
          <Row label="Events" value={events.join(', ')} />
          <Row label="Venue" value={venues.join(', ')} />
        </dl>
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-base-content/60 pt-0.5 text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="font-medium">{value || '—'}</dd>
    </>
  )
}
