import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { SelectField, TextAreaField, TextField } from '@/components/booking'
import { saveGame } from '@/lib/ops/api'
import {
  GAME_AGE_GROUPS,
  GAME_DEFAULT_TRAITS,
  GAME_EVENT_TYPES,
  GAME_FORMATIONS,
  GAME_GROUP_SIZES,
  GAME_VENUE_TYPES,
} from '@/lib/ops/gameOptions'
import { useOpsToast } from '@/lib/ops/toast'
import type { OpsGame, OpsGameFieldErrors, OpsGameInput } from '@/lib/ops/types'
import { ChoiceChips } from './ChoiceChips'
import { TraitsField } from './TraitsField'

type GameFormSheetProps = {
  open: boolean
  /** null = add a new game. */
  game: OpsGame | null
  /** Traits already used across the catalog, offered as suggestions. */
  knownTraits: string[]
  csrf: string
  onClose: () => void
  onSaved: (game: OpsGame, isNew: boolean) => void
}

const EMPTY: OpsGameInput = {
  name: '',
  formation: '',
  event_types: [],
  age_groups: [],
  venue_indoor: false,
  venue_outdoor: false,
  video_url: '',
  avg_duration_minutes: '',
  description: '',
  group_size: '',
  traits: [],
}

function toInput(game: OpsGame | null): OpsGameInput {
  if (!game) return EMPTY
  return {
    name: game.name,
    formation: game.formation ?? '',
    event_types: game.event_types ?? [],
    age_groups: game.age_groups ?? [],
    venue_indoor: Boolean(game.venue_indoor),
    venue_outdoor: Boolean(game.venue_outdoor),
    video_url: game.video_url ?? '',
    avg_duration_minutes:
      game.avg_duration_minutes != null ? String(game.avg_duration_minutes) : '',
    description: game.description ?? '',
    group_size: game.group_size ?? '',
    traits: game.traits ?? [],
  }
}

function validate(form: OpsGameInput): OpsGameFieldErrors {
  const errors: OpsGameFieldErrors = {}
  if (!form.name.trim()) errors.name = 'Enter a game name.'
  if (!form.formation) errors.formation = 'Choose a formation.'
  if (form.event_types.length === 0)
    errors.event_types = 'Choose at least one event type.'
  if (form.age_groups.length === 0) errors.age_groups = 'Choose at least one age group.'
  if (!form.venue_indoor && !form.venue_outdoor)
    errors.venue_indoor = 'Choose indoor, outdoor, or both.'
  const minutes = form.avg_duration_minutes.trim()
  if (minutes) {
    const n = Number(minutes)
    if (!Number.isInteger(n) || n < 1 || n > 600) {
      errors.avg_duration_minutes = 'Enter whole minutes between 1 and 600.'
    }
  }
  const link = form.video_url.trim()
  if (link && !/^https?:\/\/\S+$/i.test(link)) {
    errors.video_url = 'Enter a full link starting with https://.'
  }
  return errors
}

export function GameFormSheet({
  open,
  game,
  knownTraits,
  csrf,
  onClose,
  onSaved,
}: GameFormSheetProps) {
  const { notify } = useOpsToast()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<OpsGameInput>(() => toInput(game))
  const [initial] = useState<OpsGameInput>(() => toInput(game))
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<OpsGameFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const isNew = game === null
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const clientErrors = useMemo(() => validate(form), [form])
  const errors: OpsGameFieldErrors = attempted
    ? { ...clientErrors, ...serverErrors }
    : serverErrors

  const suggestions = useMemo(() => {
    const seen = new Set(GAME_DEFAULT_TRAITS.map((t) => t.toLowerCase()))
    const custom = knownTraits.filter((t) => {
      const key = t.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return [...GAME_DEFAULT_TRAITS, ...custom.sort((a, b) => a.localeCompare(b))]
  }, [knownTraits])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const patch = <K extends keyof OpsGameInput>(key: K, value: OpsGameInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setServerErrors((current) => {
      if (!current[key]) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  const requestClose = () => {
    if (saving) return
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    onClose()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    setAttempted(true)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      window.requestAnimationFrame(() => {
        bodyRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    setSaving(true)
    const result = await saveGame(game?.id ?? null, form, csrf)
    setSaving(false)
    if (!result.ok) {
      setServerErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    notify(isNew ? 'Game added' : 'Game updated')
    onSaved(result.game, isNew)
  }

  const title = isNew ? 'New Game' : 'Edit Game'
  const venueValue = [
    ...(form.venue_indoor ? ['indoor'] : []),
    ...(form.venue_outdoor ? ['outdoor'] : []),
  ]

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="game-form-title"
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
    >
      <form
        noValidate
        onSubmit={(e) => void onSubmit(e)}
        className="modal-box flex max-h-[92dvh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[88dvh]"
      >
        <div
          aria-hidden
          className="bg-base-300 mx-auto mt-2 h-1 w-9 rounded-full sm:hidden"
        />

        <header className="border-base-300 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-2 sm:px-4">
          <button
            type="button"
            className="btn btn-ghost h-11 justify-self-start"
            onClick={requestClose}
            disabled={saving}
          >
            Cancel
          </button>
          <h2 id="game-form-title" className="font-heading text-base font-semibold">
            {title}
          </h2>
          <button
            type="submit"
            className="btn btn-primary h-11 justify-self-end"
            disabled={saving}
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : null}
            {isNew ? 'Add Game' : 'Save'}
          </button>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            {confirmDiscard ? (
              <div
                role="alert"
                className="alert alert-warning items-start sm:items-center"
              >
                <span className="flex-1">Discard your changes?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm h-10"
                    onClick={() => setConfirmDiscard(false)}
                  >
                    Keep Editing
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-error h-10"
                    onClick={onClose}
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : null}

            {formError ? (
              <div role="alert" className="alert alert-error">
                <span>{formError}</span>
              </div>
            ) : null}

            <TextField
              id="game-name"
              label="Game Name"
              required
              value={form.name}
              maxLength={120}
              placeholder="Enter game name"
              autoComplete="off"
              error={errors.name}
              onChange={(e) => patch('name', e.target.value)}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                id="game-formation"
                label="Formation Type"
                required
                placeholder="Choose formation"
                options={GAME_FORMATIONS.map((value) => ({ value, label: value }))}
                value={form.formation}
                error={errors.formation}
                onChange={(e) => patch('formation', e.target.value)}
              />
              <SelectField
                id="game-group-size"
                label="Group Size"
                placeholder="Choose group size"
                options={GAME_GROUP_SIZES.map((value) => ({ value, label: value }))}
                value={form.group_size}
                error={errors.group_size}
                onChange={(e) => patch('group_size', e.target.value)}
              />
            </div>

            <ChoiceChips
              id="game-event-types"
              label="Type of Event"
              required
              options={GAME_EVENT_TYPES}
              value={form.event_types}
              error={errors.event_types}
              onChange={(value) => patch('event_types', value)}
            />

            <ChoiceChips
              id="game-age-groups"
              label="Age Group"
              required
              options={GAME_AGE_GROUPS}
              value={form.age_groups}
              error={errors.age_groups}
              onChange={(value) => patch('age_groups', value)}
            />

            <ChoiceChips
              id="game-venue"
              label="Venue Type"
              required
              options={GAME_VENUE_TYPES}
              value={venueValue}
              error={errors.venue_indoor}
              onChange={(value) => {
                setForm((current) => ({
                  ...current,
                  venue_indoor: value.includes('indoor'),
                  venue_outdoor: value.includes('outdoor'),
                }))
              }}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="game-duration"
                label="Duration (mins)"
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                step={1}
                placeholder="5"
                value={form.avg_duration_minutes}
                error={errors.avg_duration_minutes}
                onChange={(e) => patch('avg_duration_minutes', e.target.value)}
              />
              <TextField
                id="game-video"
                label="Video Link"
                type="url"
                inputMode="url"
                placeholder="https://"
                autoComplete="off"
                value={form.video_url}
                error={errors.video_url}
                onChange={(e) => patch('video_url', e.target.value)}
              />
            </div>

            <TextAreaField
              id="game-description"
              label="Game Description"
              rows={5}
              maxLength={2000}
              placeholder="How the game is played, in a few sentences"
              value={form.description}
              error={errors.description}
              onChange={(e) => patch('description', e.target.value)}
            />

            <TraitsField
              id="game-traits"
              suggestions={suggestions}
              value={form.traits}
              onChange={(value) => patch('traits', value)}
            />
          </div>
        </div>
      </form>
      <div className="modal-backdrop">
        <button type="button" tabIndex={-1} aria-label="Close" onClick={requestClose}>
          close
        </button>
      </div>
    </dialog>
  )
}
