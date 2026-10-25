import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SelectField, TextField } from '@/components/booking'
import Icon from '@/components/Icon/Icon'
import { ChoiceChips } from '@/components/ops/games/ChoiceChips'
import { GamePicker } from '@/components/ops/inquiries/GamePicker'
import { ROUTES } from '@/constants/routes'
import { loadGames, loadInquiry, saveInquiry } from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import { GAME_AGE_GROUPS, GAME_EVENT_TYPES } from '@/lib/ops/gameOptions'
import { DEFAULT_EXPIRY_MINUTES, INQUIRY_EXPIRY_OPTIONS } from '@/lib/ops/inquiry'
import { useOpsToast } from '@/lib/ops/toast'
import type { OpsGame, OpsInquiryFieldErrors, OpsInquiryInput } from '@/lib/ops/types'

const EMPTY: OpsInquiryInput = {
  customer_name: '',
  customer_phone: '',
  event_type: '',
  age_groups: [],
  participants: '',
  max_games: '',
  game_ids: [],
  expiry_minutes: DEFAULT_EXPIRY_MINUTES,
}

function validate(form: OpsInquiryInput): OpsInquiryFieldErrors {
  const errors: OpsInquiryFieldErrors = {}
  if (!form.customer_name.trim()) errors.customer_name = 'Enter the customer name.'
  const digits = form.customer_phone.replace(/\D+/g, '')
  if (form.customer_phone.trim() && (digits.length < 8 || digits.length > 15)) {
    errors.customer_phone = 'Enter a valid phone number.'
  }
  if (!form.event_type) errors.event_type = 'Choose an event type.'
  if (form.age_groups.length === 0) errors.age_groups = 'Choose at least one age group.'
  const wholeBetween = (value: string, min: number, max: number) => {
    const n = Number(value)
    return Number.isInteger(n) && n >= min && n <= max
  }
  if (form.participants.trim() && !wholeBetween(form.participants, 1, 5000)) {
    errors.participants = 'Enter a whole number between 1 and 5000.'
  }
  if (form.max_games.trim() && !wholeBetween(form.max_games, 1, 100)) {
    errors.max_games = 'Enter a whole number between 1 and 100.'
  } else if (form.max_games.trim() && form.game_ids.length > 0) {
    if (Number(form.max_games) > form.game_ids.length) {
      errors.max_games = 'The limit is higher than the number of games you added.'
    }
  }
  if (form.game_ids.length === 0) {
    errors.game_ids = 'Add at least one game for the customer to choose from.'
  }
  return errors
}

export default function OpsInquiryFormPage() {
  const { id } = useParams()
  const isNew = id === undefined
  const navigate = useNavigate()
  const { csrf } = useOpsAuth()
  const { notify } = useOpsToast()

  const [games, setGames] = useState<OpsGame[]>([])
  const [form, setForm] = useState<OpsInquiryInput>(EMPTY)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<OpsInquiryFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const gamesResult = await loadGames()
      if (cancelled) return
      if (!gamesResult.ok) {
        setLoadError(gamesResult.error)
        return
      }
      setGames(gamesResult.games)
      if (!isNew && id) {
        const result = await loadInquiry(id)
        if (cancelled) return
        if (!result.ok) {
          setLoadError(result.error)
          return
        }
        const q = result.inquiry
        setForm({
          customer_name: q.customer_name,
          customer_phone: q.customer_phone ?? '',
          event_type: q.event_type,
          age_groups: q.age_groups,
          participants: q.participants != null ? String(q.participants) : '',
          max_games: q.max_games != null ? String(q.max_games) : '',
          game_ids: q.game_ids ?? [],
          expiry_minutes: DEFAULT_EXPIRY_MINUTES,
        })
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  const clientErrors = useMemo(() => validate(form), [form])
  const errors: OpsInquiryFieldErrors = attempted
    ? { ...clientErrors, ...serverErrors }
    : serverErrors

  const patch = <K extends keyof OpsInquiryInput>(
    key: K,
    value: OpsInquiryInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setServerErrors((current) => {
      if (!current[key]) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    setAttempted(true)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    setSaving(true)
    const result = await saveInquiry(isNew ? null : Number(id), form, csrf)
    setSaving(false)
    if (!result.ok) {
      setServerErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    notify(isNew ? 'Inquiry created' : 'Inquiry updated')
    navigate(`${ROUTES.opsInquiries}/${result.inquiry.id}`, {
      state: { justCreated: isNew },
    })
  }

  const backTo = isNew ? ROUTES.opsInquiries : `${ROUTES.opsInquiries}/${id}`

  if (loadError) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink to={ROUTES.opsInquiries} label="Inquiries" />
        <div role="alert" className="alert alert-error">
          <span>{loadError}</span>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-16" role="status">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto flex max-w-3xl flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <BackLink to={backTo} label={isNew ? 'Inquiries' : 'Inquiry'} />
        <h1 className="font-heading text-2xl font-semibold">
          {isNew ? 'New Inquiry' : 'Edit Inquiry'}
        </h1>
        <p className="text-base-content/70 text-sm">
          {isNew
            ? 'Add what the customer asked for, pick the games to offer, then share the link.'
            : 'Changes apply to the same link. To change the expiry, use Extend on the inquiry.'}
        </p>
      </div>

      {formError ? (
        <div role="alert" className="alert alert-error">
          <span>{formError}</span>
        </div>
      ) : null}

      <section className="card card-border bg-base-100">
        <div className="card-body gap-5 p-4 sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Customer</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="inq-name"
              label="Customer Name"
              required
              autoComplete="off"
              maxLength={120}
              value={form.customer_name}
              error={errors.customer_name}
              onChange={(e) => patch('customer_name', e.target.value)}
            />
            <TextField
              id="inq-phone"
              label="WhatsApp Number"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="99240 07700"
              hint="Optional. Opens the chat with this number when you share."
              value={form.customer_phone}
              error={errors.customer_phone}
              onChange={(e) => patch('customer_phone', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card card-border bg-base-100">
        <div className="card-body gap-5 p-4 sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Event</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="inq-event-type"
              label="Event Type"
              required
              placeholder="Choose event type"
              options={GAME_EVENT_TYPES}
              value={form.event_type}
              error={errors.event_type}
              onChange={(e) => patch('event_type', e.target.value)}
            />
            <TextField
              id="inq-participants"
              label="Number of Participants"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="20"
              value={form.participants}
              error={errors.participants}
              onChange={(e) => patch('participants', e.target.value)}
            />
          </div>
          <ChoiceChips
            id="inq-age-groups"
            label="Age Group"
            required
            options={GAME_AGE_GROUPS}
            value={form.age_groups}
            error={errors.age_groups}
            onChange={(value) => patch('age_groups', value)}
          />
        </div>
      </section>

      <section className="card card-border bg-base-100">
        <div className="card-body gap-5 p-4 sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Games</h2>
          <GamePicker
            id="inq-games"
            games={games}
            eventType={form.event_type}
            ageGroups={form.age_groups}
            value={form.game_ids}
            error={errors.game_ids}
            onChange={(ids) => patch('game_ids', ids)}
          />
          <TextField
            id="inq-max"
            label="Most Games the Customer Can Choose"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="No limit"
            hint="Optional. Leave empty to let them choose any number."
            value={form.max_games}
            error={errors.max_games}
            onChange={(e) => patch('max_games', e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
      </section>

      {isNew ? (
        <section className="card card-border bg-base-100">
          <div className="card-body gap-4 p-4 sm:p-6">
            <div>
              <h2 className="font-heading text-lg font-semibold">Link</h2>
              <p className="text-base-content/70 text-sm">
                The time is counted from the moment you create the inquiry.
              </p>
            </div>
            <SelectField
              id="inq-expiry"
              label="Link Stays Open For"
              required
              placeholder="Choose duration"
              options={INQUIRY_EXPIRY_OPTIONS.map((o) => ({
                value: String(o.minutes),
                label: o.label,
              }))}
              value={String(form.expiry_minutes)}
              error={errors.expiry_minutes}
              onChange={(e) => patch('expiry_minutes', Number(e.target.value))}
              className="sm:max-w-xs"
            />
          </div>
        </section>
      ) : null}

      <div className="bg-base-200/90 sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-base-300 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-box sm:border">
        <Link to={backTo} className="btn h-11">
          Cancel
        </Link>
        <button
          type="submit"
          className="btn btn-primary h-11 min-w-36"
          disabled={saving}
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : null}
          {isNew ? 'Create Inquiry' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="btn btn-ghost -ml-3 h-11 w-fit gap-2">
      <Icon name="arrow-left" size="sm" />
      {label}
    </Link>
  )
}
