import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import {
  DeleteGameDialog,
  GameCard,
  GameFormSheet,
  GamesTable,
  type GameSort,
  type GameSortKey,
} from '@/components/ops/games'
import { loadGames } from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import {
  GAME_AGE_GROUPS,
  GAME_EVENT_TYPES,
  GAME_FORMATIONS,
  GAME_VENUE_TYPES,
} from '@/lib/ops/gameOptions'
import type { OpsGame } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type View = 'cards' | 'list'
const VIEW_KEY = 'tgh-ops-games-view'

function initialView(param: string | null): View {
  if (param === 'cards' || param === 'list') return param
  try {
    const stored = window.localStorage.getItem(VIEW_KEY)
    if (stored === 'cards' || stored === 'list') return stored
  } catch {
    /* storage unavailable */
  }
  return 'cards'
}

const FILTER_KEYS = ['event', 'formation', 'age', 'venue'] as const

function sortGames(games: OpsGame[], sort: GameSort): OpsGame[] {
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...games].sort((a, b) => {
    if (sort.key === 'duration') {
      const av = a.avg_duration_minutes ?? Number.POSITIVE_INFINITY
      const bv = b.avg_duration_minutes ?? Number.POSITIVE_INFINITY
      if (av !== bv) return (av < bv ? -1 : 1) * dir
    } else if (sort.key === 'formation') {
      const c = (a.formation ?? '').localeCompare(b.formation ?? '')
      if (c !== 0) return c * dir
    }
    return a.name.localeCompare(b.name) * (sort.key === 'name' ? dir : 1)
  })
}

export default function OpsGamesPage() {
  const { csrf } = useOpsAuth()
  const [params, setParams] = useSearchParams()
  const [games, setGames] = useState<OpsGame[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sort, setSort] = useState<GameSort>({ key: 'name', dir: 'asc' })
  const [editing, setEditing] = useState<OpsGame | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formSession, setFormSession] = useState(0)
  const [deleting, setDeleting] = useState<OpsGame | null>(null)

  const view = initialView(params.get('view'))
  const q = params.get('q') ?? ''
  const filters = {
    event: params.get('event') ?? '',
    formation: params.get('formation') ?? '',
    age: params.get('age') ?? '',
    venue: params.get('venue') ?? '',
  }
  const hasFilters = q !== '' || FILTER_KEYS.some((key) => filters[key] !== '')

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const setView = (next: View) => {
    setParam('view', next)
    try {
      window.localStorage.setItem(VIEW_KEY, next)
    } catch {
      /* storage unavailable */
    }
  }

  const clearFilters = () => {
    setParams(
      (current) => {
        const next = new URLSearchParams()
        const v = current.get('view')
        if (v) next.set('view', v)
        return next
      },
      { replace: true },
    )
  }

  const applyResult = useCallback((result: Awaited<ReturnType<typeof loadGames>>) => {
    if (result.ok) {
      setGames(result.games)
      setLoadError(null)
    } else {
      setLoadError(result.error)
    }
    setLoading(false)
  }, [])

  const retry = () => {
    setLoading(true)
    void loadGames().then(applyResult)
  }

  useEffect(() => {
    void loadGames().then(applyResult)
  }, [applyResult])

  const knownTraits = useMemo(
    () => Array.from(new Set(games.flatMap((game) => game.traits ?? []))),
    [games],
  )

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const matched = games.filter((game) => {
      if (needle) {
        const hay = [game.name, game.description ?? '', ...(game.traits ?? [])]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (filters.event && !(game.event_types ?? []).includes(filters.event))
        return false
      if (filters.formation && game.formation !== filters.formation) return false
      if (filters.age && !(game.age_groups ?? []).includes(filters.age)) return false
      if (filters.venue === 'indoor' && !game.venue_indoor) return false
      if (filters.venue === 'outdoor' && !game.venue_outdoor) return false
      return true
    })
    return sortGames(matched, sort)
  }, [games, q, filters.event, filters.formation, filters.age, filters.venue, sort])

  const onSort = (key: GameSortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  const openAdd = () => {
    setEditing(null)
    setFormSession((n) => n + 1)
    setFormOpen(true)
  }
  const openEdit = (game: OpsGame) => {
    setEditing(game)
    setFormSession((n) => n + 1)
    setFormOpen(true)
  }

  const onSaved = (saved: OpsGame, isNew: boolean) => {
    setGames((current) =>
      isNew
        ? [...current, saved]
        : current.map((game) => (game.id === saved.id ? saved : game)),
    )
    setFormOpen(false)
  }

  const onDeleted = (removed: OpsGame) => {
    setGames((current) => current.filter((game) => game.id !== removed.id))
    setDeleting(null)
  }

  const countLabel = loading
    ? ''
    : hasFilters
      ? `${visible.length} of ${games.length} games`
      : `${games.length} ${games.length === 1 ? 'game' : 'games'}`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Games</h1>
          <p className="text-base-content/70 text-sm" aria-live="polite">
            {countLabel || 'The catalog used when planning events.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary h-11 gap-2" onClick={openAdd}>
          <Icon name="plus" size="sm" />
          Add Game
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="input h-11 w-full sm:max-w-md">
            <Icon name="search" size="sm" className="text-base-content/50" />
            <input
              type="search"
              placeholder="Search name, description, or trait"
              aria-label="Search games"
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </label>

          <div role="group" aria-label="View" className="join bg-base-100 sm:ml-auto">
            {(
              [
                ['cards', 'Cards', 'layout-grid'],
                ['list', 'List', 'layout-list'],
              ] as const
            ).map(([value, label, icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                className={cn(
                  'btn join-item h-11 flex-1 gap-2 px-5 sm:flex-none',
                  view === value ? 'btn-primary' : 'btn-outline border-base-300',
                )}
                onClick={() => setView(value)}
              >
                <Icon name={icon} size="sm" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <FilterSelect
            label="Event Type"
            allLabel="All Event Types"
            value={filters.event}
            options={GAME_EVENT_TYPES}
            onChange={(v) => setParam('event', v)}
          />
          <FilterSelect
            label="Formation"
            allLabel="All Formations"
            value={filters.formation}
            options={GAME_FORMATIONS.map((value) => ({ value, label: value }))}
            onChange={(v) => setParam('formation', v)}
          />
          <FilterSelect
            label="Age Group"
            allLabel="All Age Groups"
            value={filters.age}
            options={GAME_AGE_GROUPS}
            onChange={(v) => setParam('age', v)}
          />
          <FilterSelect
            label="Venue Type"
            allLabel="All Venues"
            value={filters.venue}
            options={GAME_VENUE_TYPES}
            onChange={(v) => setParam('venue', v)}
          />
        </div>
      </div>

      {loading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label="Loading games"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-56 rounded-box" />
          ))}
        </div>
      ) : loadError ? (
        <div role="alert" className="alert alert-error">
          <span className="flex-1">{loadError}</span>
          <button type="button" className="btn btn-sm h-10" onClick={retry}>
            Try Again
          </button>
        </div>
      ) : games.length === 0 ? (
        <EmptyState
          title="No games yet"
          body="Add your first game to start building the catalog."
          action={
            <button
              type="button"
              className="btn btn-primary h-11 gap-2"
              onClick={openAdd}
            >
              <Icon name="plus" size="sm" />
              Add Game
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No games match"
          body="Try a different search, or clear the filters to see every game."
          action={
            <button type="button" className="btn h-11" onClick={clearFilters}>
              Clear Filters
            </button>
          }
        />
      ) : view === 'cards' ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((game) => (
            <li key={game.id}>
              <GameCard game={game} onEdit={openEdit} onDelete={setDeleting} />
            </li>
          ))}
        </ul>
      ) : (
        <GamesTable
          games={visible}
          sort={sort}
          onSort={onSort}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      )}

      {hasFilters && !loading && visible.length > 0 ? (
        <div>
          <button type="button" className="btn btn-ghost h-11" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : null}

      <GameFormSheet
        key={formSession}
        open={formOpen}
        game={editing}
        knownTraits={knownTraits}
        csrf={csrf}
        onClose={() => setFormOpen(false)}
        onSaved={onSaved}
      />
      <DeleteGameDialog
        key={deleting?.id ?? 'none'}
        game={deleting}
        csrf={csrf}
        onClose={() => setDeleting(null)}
        onDeleted={onDeleted}
      />
    </div>
  )
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string
  allLabel: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <select
      className={cn('select h-11 w-full', value && 'select-primary')}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function EmptyState({
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
