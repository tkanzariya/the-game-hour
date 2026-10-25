import { useMemo, useState } from 'react'
import { FieldShell } from '@/components/booking'
import Icon from '@/components/Icon/Icon'
import { gameAgeGroupLabel, gameEventTypeLabel } from '@/lib/ops/gameOptions'
import { matchesFilters } from '@/lib/ops/inquiry'
import type { OpsGame } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type GamePickerProps = {
  id: string
  games: OpsGame[]
  eventType: string
  ageGroups: string[]
  value: number[]
  onChange: (ids: number[]) => void
  error?: string
}

export function GamePicker({
  id,
  games,
  eventType,
  ageGroups,
  value,
  onChange,
  error,
}: GamePickerProps) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const hasFilters = Boolean(eventType) || ageGroups.length > 0
  const filterText = [
    eventType ? gameEventTypeLabel(eventType) : '',
    ageGroups.map(gameAgeGroupLabel).join(', '),
  ]
    .filter(Boolean)
    .join(' · ')

  const byId = useMemo(() => new Map(games.map((game) => [game.id, game])), [games])
  const matching = useMemo(
    () => games.filter((game) => matchesFilters(game, eventType, ageGroups)),
    [games, eventType, ageGroups],
  )
  const matchIds = useMemo(() => new Set(matching.map((game) => game.id)), [matching])

  const needle = query.trim().toLowerCase()
  const searching = needle !== ''
  const visible = useMemo(() => {
    const pool = searching || showAll || !hasFilters ? games : matching
    const found = searching
      ? pool.filter((game) =>
          `${game.name} ${game.formation ?? ''} ${(game.traits ?? []).join(' ')}`
            .toLowerCase()
            .includes(needle),
        )
      : pool
    // Matches first, then the rest, each alphabetical.
    return [...found].sort((a, b) => {
      const am = matchIds.has(a.id) ? 0 : 1
      const bm = matchIds.has(b.id) ? 0 : 1
      return am - bm || a.name.localeCompare(b.name)
    })
  }, [games, matching, matchIds, needle, searching, showAll, hasFilters])

  const selected = value.flatMap((gameId) => {
    const game = byId.get(gameId)
    return game ? [game] : []
  })
  const missingMatches = matching.filter((game) => !value.includes(game.id))

  const toggle = (gameId: number) => {
    onChange(
      value.includes(gameId) ? value.filter((v) => v !== gameId) : [...value, gameId],
    )
  }

  return (
    <FieldShell id={id} label="Games to offer" required error={error}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base-content/70 text-sm" aria-live="polite">
            {hasFilters
              ? `${matching.length} ${matching.length === 1 ? 'game matches' : 'games match'} ${filterText}`
              : 'Choose an event type and age group to narrow the list.'}
          </p>
          {hasFilters && missingMatches.length > 0 ? (
            <button
              type="button"
              className="btn btn-sm btn-outline h-10"
              onClick={() =>
                onChange([...value, ...missingMatches.map((game) => game.id)])
              }
            >
              <Icon name="plus" size="sm" />
              Add {missingMatches.length === matching.length ? 'all' : 'remaining'}{' '}
              {missingMatches.length}{' '}
              {missingMatches.length === 1 ? 'match' : 'matches'}
            </button>
          ) : null}
        </div>

        {selected.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Selected games">
            {selected.map((game) => {
              const outside = hasFilters && !matchIds.has(game.id)
              return (
                <li
                  key={game.id}
                  className={cn(
                    'badge badge-lg h-9 gap-1 pr-1',
                    outside ? 'badge-warning badge-soft' : 'badge-primary badge-soft',
                  )}
                  title={
                    outside ? 'Outside the event type or age group filters' : undefined
                  }
                >
                  {game.name}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle size-7 min-h-0"
                    aria-label={`Remove ${game.name}`}
                    onClick={() => toggle(game.id)}
                  >
                    <Icon name="x" size="sm" className="size-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}

        <div className="border-base-300 rounded-box border">
          <label className="input border-base-300 h-11 w-full rounded-b-none border-0 border-b">
            <Icon name="search" size="sm" className="text-base-content/50" />
            <input
              id={id}
              type="search"
              placeholder="Search all games to add more"
              aria-label="Search games"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault()
              }}
            />
          </label>

          {visible.length === 0 ? (
            <p className="text-base-content/70 p-4 text-sm" role="status">
              {searching
                ? 'No games match that search.'
                : 'No games match these filters yet. Search above to add any game.'}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto" aria-label="Games">
              {visible.map((game) => {
                const checked = value.includes(game.id)
                const outside = hasFilters && !matchIds.has(game.id)
                return (
                  <li
                    key={game.id}
                    className="border-base-200 border-b last:border-b-0"
                  >
                    <label
                      className={cn(
                        'hover:bg-base-200/60 flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2',
                        checked && 'bg-primary/5',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={checked}
                        onChange={() => toggle(game.id)}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium">{game.name}</span>
                        <span className="text-base-content/60 truncate text-xs">
                          {[
                            game.formation,
                            (game.age_groups ?? []).map(gameAgeGroupLabel).join(', '),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      {outside ? (
                        <span className="badge badge-warning badge-soft shrink-0">
                          Outside filters
                        </span>
                      ) : null}
                    </label>
                  </li>
                )
              })}
            </ul>
          )}

          {hasFilters && !searching ? (
            <div className="border-base-200 border-t p-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm h-10"
                aria-pressed={showAll}
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll
                  ? 'Show only matching games'
                  : `Show all ${games.length} games`}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </FieldShell>
  )
}
