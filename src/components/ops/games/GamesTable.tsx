import Icon from '@/components/Icon/Icon'
import {
  gameAgeGroupLabel,
  gameEventTypeLabel,
  gameVenueLabels,
  groupSizeShort,
} from '@/lib/ops/gameOptions'
import type { OpsGame } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

export type GameSortKey = 'name' | 'formation' | 'duration'
export type GameSort = { key: GameSortKey; dir: 'asc' | 'desc' }

type GamesTableProps = {
  games: OpsGame[]
  sort: GameSort
  onSort: (key: GameSortKey) => void
  onEdit: (game: OpsGame) => void
  onDelete: (game: OpsGame) => void
}

const join = (items: string[]) => (items.length > 0 ? items.join(', ') : '—')

export function GamesTable({ games, sort, onSort, onEdit, onDelete }: GamesTableProps) {
  return (
    <>
      {/* Wide screens (xl, beside the sidebar): multicolumn table with sortable headings. */}
      <div className="card card-border bg-base-100 hidden overflow-x-auto xl:block">
        <table className="table">
          <thead>
            <tr>
              <SortHead label="Game Name" k="name" sort={sort} onSort={onSort} />
              <SortHead label="Formation" k="formation" sort={sort} onSort={onSort} />
              <th>Age Group</th>
              <th>Event Type</th>
              <th>Venue Type</th>
              <SortHead label="Duration" k="duration" sort={sort} onSort={onSort} />
              <th>Group Size</th>
              <th className="w-32">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-base-200/60">
                <td className="min-w-48 font-medium">
                  <button
                    type="button"
                    className="link link-hover text-left font-semibold"
                    onClick={() => onEdit(game)}
                  >
                    {game.name}
                  </button>
                </td>
                <td>{game.formation ?? '—'}</td>
                <td className="min-w-32">
                  {join((game.age_groups ?? []).map(gameAgeGroupLabel))}
                </td>
                <td className="min-w-40">
                  {join((game.event_types ?? []).map(gameEventTypeLabel))}
                </td>
                <td>{join(gameVenueLabels(game))}</td>
                <td className="whitespace-nowrap">
                  {game.avg_duration_minutes
                    ? `${game.avg_duration_minutes} mins`
                    : '—'}
                </td>
                <td className="whitespace-nowrap">
                  {groupSizeShort(game.group_size) || '—'}
                </td>
                <td>
                  <div className="flex justify-end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones and tablets: inset list rows, whole row opens the editor. */}
      <ul className="card card-border bg-base-100 divide-base-200 divide-y xl:hidden">
        {games.map((game) => {
          const meta = [
            game.formation,
            game.avg_duration_minutes ? `${game.avg_duration_minutes} mins` : null,
            groupSizeShort(game.group_size) || null,
          ].filter(Boolean)
          const detail = [
            ...(game.age_groups ?? []).map(gameAgeGroupLabel),
            ...gameVenueLabels(game),
          ]
          return (
            <li key={game.id} className="flex items-stretch">
              <button
                type="button"
                className="hover:bg-base-200/60 flex min-h-16 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 px-4 py-3 text-left"
                aria-label={`Edit ${game.name}`}
                onClick={() => onEdit(game)}
              >
                <span className="text-primary font-semibold">{game.name}</span>
                {meta.length > 0 ? (
                  <span className="text-base-content/70 text-sm">
                    {meta.join(' · ')}
                  </span>
                ) : null}
                {detail.length > 0 ? (
                  <span className="text-base-content/60 text-xs">
                    {detail.join(' · ')}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-square text-error m-1 size-11 min-h-0 self-center"
                aria-label={`Delete ${game.name}`}
                onClick={() => onDelete(game)}
              >
                <Icon name="trash" />
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function SortHead({
  label,
  k,
  sort,
  onSort,
}: {
  label: string
  k: GameSortKey
  sort: GameSort
  onSort: (key: GameSortKey) => void
}) {
  const active = sort.key === k
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={cn(
          'inline-flex min-h-8 items-center gap-1 font-semibold',
          active && 'text-primary',
        )}
        onClick={() => onSort(k)}
      >
        {label}
        <span aria-hidden className={cn('text-xs', !active && 'opacity-30')}>
          {active && sort.dir === 'desc' ? '▼' : '▲'}
        </span>
      </button>
    </th>
  )
}
