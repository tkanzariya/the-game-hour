import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  DatePickerField,
  SelectField,
  TextAreaField,
  TextField,
  TimePickerField,
} from '@/components/booking'
import Icon from '@/components/Icon/Icon'
import { SearchMultiSelect } from '@/components/ops/SearchMultiSelect'
import { getBookingFormContent } from '@/lib/booking/api'
import { deleteEvent, fetchEvent, fetchGames, fetchTeam, updateEvent } from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import {
  ageGroupLabel,
  categoryLabel,
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
  formatMoney,
  statusLabel,
  timeInputValue,
} from '@/lib/ops/format'
import type {
  OpsEventDetail,
  OpsEventPatch,
  OpsGame,
  OpsTeamMember,
} from '@/lib/ops/types'
import { ROUTES } from '@/constants/routes'

export default function OpsEventDetailPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { csrf } = useOpsAuth()
  const [event, setEvent] = useState<OpsEventDetail | null>(null)
  const [games, setGames] = useState<OpsGame[]>([])
  const [team, setTeam] = useState<OpsTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(searchParams.get('edit') === '1')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    Promise.all([fetchEvent(id), fetchGames(), fetchTeam()])
      .then(([result, gameRows, teamRows]) => {
        if (!result.ok) {
          setError(result.error)
          setEvent(null)
          return
        }
        setError(null)
        setEvent(result.event)
        setGames(gameRows)
        setTeam(teamRows)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id changes
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" aria-label="Loading event" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link to={ROUTES.opsEvents} className="btn btn-ghost btn-sm gap-2">
          <Icon name="arrow-left" size="sm" />
          Back to events
        </Link>
        <div role="alert" className="alert alert-error">
          <span>{error ?? 'Event not found.'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={ROUTES.opsEvents} className="btn btn-ghost btn-sm gap-2">
            <Icon name="arrow-left" size="sm" />
            Back to events
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{event.display_name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`badge ${
                event.event_status === 'pending'
                  ? 'badge-warning'
                  : event.event_status === 'upcoming'
                    ? 'badge-info'
                    : 'badge-success'
              }`}
            >
              {statusLabel(event.event_status)}
            </span>
            <span className="badge badge-outline">
              {categoryLabel(event.event_category)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {!editing ? (
            <button
              type="button"
              className="btn btn-error btn-outline gap-2"
              onClick={() => setDeleteOpen(true)}
            >
              <Icon name="trash" size="sm" />
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <DeleteEventDialog
        event={event}
        csrf={csrf}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

      {editing ? (
        <EventEditForm
          event={event}
          games={games}
          team={team}
          csrf={csrf}
          onSaved={(next) => {
            setEvent(next)
            setEditing(false)
          }}
        />
      ) : (
        <EventReadView event={event} />
      )}
    </div>
  )
}

function DeleteEventDialog({
  event,
  csrf,
  open,
  onClose,
}: {
  event: OpsEventDetail
  csrf: string
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canDelete = confirmText.trim().toUpperCase() === 'DELETE'

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      setConfirmText('')
      setError(null)
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const onConfirm = async () => {
    if (!canDelete || deleting) return
    setDeleting(true)
    setError(null)
    const result = await deleteEvent(String(event.id), csrf)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onClose()
    navigate(ROUTES.opsEvents)
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      aria-labelledby="delete-event-title"
    >
      <div className="modal-box">
        <h3 id="delete-event-title" className="font-heading text-lg font-bold">
          Delete this event?
        </h3>
        <div role="alert" className="alert alert-warning mt-4">
          <span>
            This permanently removes {event.display_name} ({formatEventDate(event.event_date)}).
            Game and coach assignments and the payment screenshot are removed. This cannot be
            undone.
          </span>
        </div>
        <fieldset className="fieldset mt-4 p-0">
          <legend className="fieldset-legend">Type DELETE to confirm</legend>
          <input
            className="input w-full"
            value={confirmText}
            autoComplete="off"
            spellCheck={false}
            placeholder="DELETE"
            disabled={deleting}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void onConfirm()
              }
            }}
          />
        </fieldset>
        {error ? (
          <div role="alert" className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn" disabled={deleting}>
              Cancel
            </button>
          </form>
          <button
            type="button"
            className="btn btn-error"
            disabled={!canDelete || deleting}
            onClick={() => void onConfirm()}
          >
            {deleting ? <span className="loading loading-spinner" /> : <Icon name="trash" size="sm" />}
            Delete event
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" disabled={deleting}>
          close
        </button>
      </form>
    </dialog>
  )
}

function EventReadView({ event }: { event: OpsEventDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Customer</h2>
          <Definition label="Name" value={event.contact_name} />
          <Definition label="Email" value={event.email} />
          <Definition label="Phone" value={event.phone} />
          {event.company_name ? (
            <Definition label="Company" value={event.company_name} />
          ) : null}
          {event.birthday_person_name ? (
            <Definition label="Birthday person" value={event.birthday_person_name} />
          ) : null}
          {event.instagram_handle ? (
            <Definition label="Instagram" value={event.instagram_handle} />
          ) : null}
          <Definition label="Address" value={event.address} />
        </div>
      </article>

      <article className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Event</h2>
          <Definition label="Date" value={formatEventDate(event.event_date)} />
          <Definition label="Time" value={formatEventTime(event.event_time)} />
          <Definition label="Type" value={eventTypeLabel(event.event_type)} />
          <Definition label="Participants" value={String(event.participant_count)} />
          <Definition label="Age group" value={ageGroupLabel(event.age_group)} />
          <Definition label="Venue" value={event.venue_name || '—'} />
          <Definition
            label="Venue type"
            value={event.venue_type === 'outdoor' ? 'Outdoor' : event.venue_type === 'indoor' ? 'Indoor' : '—'}
          />
          <Definition
            label="On calendar"
            value={event.added_to_calendar ? 'Yes' : 'No'}
          />
          {event.special_requirements ? (
            <Definition label="Notes" value={event.special_requirements} />
          ) : null}
        </div>
      </article>

      <article className="card bg-base-100 shadow lg:col-span-2">
        <div className="card-body">
          <h2 className="card-title">Payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Definition label="Event price" value={formatMoney(event.price)} />
            <Definition label="Expenses" value={formatMoney(event.event_expenses)} />
            <Definition
              label="Advance"
              value={`${formatMoney(event.advance_amount)} · ${event.advance_payment_completed ? 'received' : 'not received'}${event.advance_payment_date ? ` · ${formatEventDate(event.advance_payment_date)}` : ''}`}
            />
            <Definition
              label="Final payment"
              value={`${formatMoney(event.full_payment_amount)} · ${event.full_payment_completed ? 'received' : 'not received'}${event.full_payment_date ? ` · ${formatEventDate(event.full_payment_date)}` : ''}`}
            />
          </div>
          <PaymentScreenshot url={event.screenshot_url} />
        </div>
      </article>

      <article className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Games played</h2>
          {event.games.length === 0 ? (
            <p>None assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {event.games.map((game) => (
                <span key={game.id} className="badge badge-outline">
                  {game.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <article className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Team sent</h2>
          {event.team.length === 0 ? (
            <p>None assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {event.team.map((member) => (
                <span key={member.id} className="badge badge-outline">
                  {member.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-base-200 border-b py-2.5 last:border-b-0">
      <dt className="text-xs font-semibold tracking-wide text-base-content/50 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-base font-medium text-base-content">{value || '—'}</dd>
    </div>
  )
}

function PaymentScreenshot({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false)
  const missing = !url || failed

  if (missing) {
    return (
      <div role="alert" className="alert alert-warning mt-4">
        <span>No payment screenshot on file.</span>
      </div>
    )
  }

  const downloadUrl = url.includes('?') ? `${url}&download=1` : `${url}?download=1`

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold tracking-wide text-base-content/50 uppercase">
        Payment screenshot
      </p>
      <figure className="bg-base-200 h-48 w-32 overflow-hidden rounded-box border-base-300 border">
        <img
          src={url}
          alt="Payment screenshot preview"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      </figure>
      <p className="text-sm text-base-content/60">
        Open or download to view the full image.
      </p>
      <div className="join">
        <a
          className="btn join-item btn-sm gap-2"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="external-link" size="sm" />
          Open
        </a>
        <a className="btn join-item btn-sm gap-2" href={downloadUrl} download>
          <Icon name="download" size="sm" />
          Download
        </a>
      </div>
    </div>
  )
}

function EventEditForm({
  event,
  games,
  team,
  csrf,
  onSaved,
}: {
  event: OpsEventDetail
  games: OpsGame[]
  team: OpsTeamMember[]
  csrf: string
  onSaved: (event: OpsEventDetail) => void
}) {
  const content = getBookingFormContent()
  const [status, setStatus] = useState(event.event_status)
  const [venueName, setVenueName] = useState(event.venue_name ?? '')
  const [eventDate, setEventDate] = useState(event.event_date)
  const [eventTime, setEventTime] = useState(timeInputValue(event.event_time))
  const [venueType, setVenueType] = useState(event.venue_type ?? '')
  const [participants, setParticipants] = useState(String(event.participant_count))
  const [eventType, setEventType] = useState(event.event_type ?? '')
  const [ageGroup, setAgeGroup] = useState(event.age_group ?? '')
  const [paymentMode, setPaymentMode] = useState(event.payment_mode ?? '')
  const [referralSource, setReferralSource] = useState(event.referral_source ?? '')
  const [price, setPrice] = useState(moneyInput(event.price))
  const [expenses, setExpenses] = useState(moneyInput(event.event_expenses))
  const [advanceAmount, setAdvanceAmount] = useState(moneyInput(event.advance_amount))
  const [advanceDate, setAdvanceDate] = useState(event.advance_payment_date ?? '')
  const [advanceDone, setAdvanceDone] = useState(event.advance_payment_completed)
  const [finalAmount, setFinalAmount] = useState(moneyInput(event.full_payment_amount))
  const [finalDate, setFinalDate] = useState(event.full_payment_date ?? '')
  const [finalDone, setFinalDone] = useState(event.full_payment_completed)
  const [onCalendar, setOnCalendar] = useState(event.added_to_calendar)
  const [instagram, setInstagram] = useState(event.instagram_handle ?? '')
  const [notes, setNotes] = useState(event.special_requirements ?? '')
  const [gameIds, setGameIds] = useState<number[]>(event.games.map((item) => item.id))
  const [teamIds, setTeamIds] = useState<number[]>(event.team.map((item) => item.id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (formEvent: FormEvent) => {
    formEvent.preventDefault()
    setSaving(true)
    setError(null)
    const patch: OpsEventPatch = {
      event_status: status,
      venue_name: venueName,
      event_date: eventDate,
      event_time: eventTime,
      venue_type: venueType === 'outdoor' || venueType === 'indoor' ? venueType : undefined,
      participant_count: Number(participants) || 1,
      event_type: eventType || null,
      age_group: ageGroup || null,
      payment_mode: paymentMode || null,
      referral_source: referralSource || null,
      price: parseMoney(price),
      event_expenses: parseMoney(expenses),
      advance_amount: parseMoney(advanceAmount),
      advance_payment_date: advanceDate || null,
      advance_payment_completed: advanceDone,
      full_payment_amount: parseMoney(finalAmount),
      full_payment_date: finalDate || null,
      full_payment_completed: advanceDone && finalDone,
      added_to_calendar: onCalendar,
      instagram_handle: instagram,
      special_requirements: notes,
      game_ids: gameIds,
      team_ids: teamIds,
    }
    const result = await updateEvent(String(event.id), patch, csrf)
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved(result.event)
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      <section className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <h2 className="card-title font-heading text-lg">Event</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="event_status"
              label="Status"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as OpsEventDetail['event_status'])}
            />
            <label className="flex cursor-pointer items-center gap-3 self-end pb-2 text-sm">
              <input
                type="checkbox"
                className="checkbox"
                checked={onCalendar}
                onChange={(e) => setOnCalendar(e.target.checked)}
              />
              <span>Added to calendar</span>
            </label>

            {event.event_category === 'social' ? (
              <SelectField
                id="event_type"
                label="Type of Event"
                placeholder="Choose Event Type"
                options={extraSelectOption(content.eventTypes, eventType)}
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              />
            ) : null}

            <TextField
              id="participant_count"
              label="No. of Participants"
              inputMode="numeric"
              placeholder={content.placeholders.participants}
              value={participants}
              onChange={(e) =>
                setParticipants(e.target.value.replace(/\D/g, ''))
              }
            />

            {event.event_category === 'social' ? (
              <SelectField
                id="age_group"
                label="Age Group"
                placeholder="Choose age group"
                options={extraSelectOption(content.ageGroups, ageGroup)}
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              />
            ) : null}

            <DatePickerField
              id="event_date"
              label="Date of Event"
              required
              minDate={null}
              placeholder="Select date"
              value={eventDate}
              onChange={setEventDate}
            />
            <TimePickerField
              id="event_time"
              label="Time of Event"
              required
              value={eventTime}
              onChange={setEventTime}
            />
          </div>
        </div>
      </section>

      <section className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <h2 className="card-title font-heading text-lg">Venue & extras</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                id="venue_name"
                label="Venue of Event"
                placeholder={content.placeholders.venue}
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
            <SelectField
              id="venue_type"
              label="Venue Type"
              placeholder="Choose Type of Venue"
              options={content.venueTypes}
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
            />
            <TextField
              id="instagram_handle"
              label="Instagram"
              placeholder="@handle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <SelectField
              id="payment_mode"
              label="Mode of Payment"
              placeholder="Choose Mode of Payment"
              options={extraSelectOption(content.paymentModes, paymentMode)}
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            />
            <div className="sm:col-span-2">
              <SelectField
                id="referral_source"
                label="How did you hear about us?"
                placeholder={content.placeholders.referral}
                options={extraSelectOption(content.referralSources, referralSource)}
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <TextAreaField
                id="special_requirements"
                label="Special Requirements"
                placeholder={content.placeholders.specialRequirements}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <h2 className="card-title font-heading text-lg">Payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="price"
              label="Event price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              id="event_expenses"
              label="Expenses"
              inputMode="decimal"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
            <label className="flex cursor-pointer items-start gap-3 text-sm sm:col-span-2">
              <input
                type="checkbox"
                className="checkbox mt-0.5"
                checked={advanceDone}
                onChange={(e) => {
                  const checked = e.target.checked
                  setAdvanceDone(checked)
                  if (!checked) setFinalDone(false)
                }}
              />
              <span>Advance payment received</span>
            </label>
            {advanceDone ? (
              <>
                <TextField
                  id="advance_amount"
                  label="Advance amount"
                  inputMode="decimal"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                />
                <DatePickerField
                  id="advance_payment_date"
                  label="Advance date"
                  minDate={null}
                  placeholder="Select date"
                  value={advanceDate}
                  onChange={setAdvanceDate}
                />
                <label className="flex cursor-pointer items-start gap-3 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    className="checkbox mt-0.5"
                    checked={finalDone}
                    onChange={(e) => setFinalDone(e.target.checked)}
                  />
                  <span>Full payment received</span>
                </label>
                {finalDone ? (
                  <>
                    <TextField
                      id="full_payment_amount"
                      label="Full payment amount"
                      inputMode="decimal"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                    />
                    <DatePickerField
                      id="full_payment_date"
                      label="Full payment date"
                      minDate={null}
                      placeholder="Select date"
                      value={finalDate}
                      onChange={setFinalDate}
                    />
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card card-border bg-base-100 overflow-visible">
          <div className="card-body overflow-visible">
            <SearchMultiSelect
              id="game_ids"
              label="Games played"
              placeholder="Search and select games"
              searchPlaceholder="Search games"
              emptyMessage="No games in the catalogue yet."
              options={games.map((game) => ({ id: game.id, label: game.name }))}
              value={gameIds}
              onChange={setGameIds}
            />
          </div>
        </section>
        <section className="card card-border bg-base-100 overflow-visible">
          <div className="card-body overflow-visible">
            <SearchMultiSelect
              id="team_ids"
              label="Team sent"
              placeholder="Search and select coaches"
              searchPlaceholder="Search coaches"
              emptyMessage="No team members yet."
              options={team.map((member) => ({
                id: member.id,
                label: member.name,
                hint: member.position,
              }))}
              value={teamIds}
              onChange={setTeamIds}
            />
          </div>
        </section>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <span className="loading loading-spinner" /> : null}
        Save changes
      </button>
    </form>
  )
}

function moneyInput(value: number | null): string {
  return value == null ? '' : String(value)
}

function parseMoney(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function extraSelectOption(
  options: { value: string; label: string }[],
  current: string,
): { value: string; label: string }[] {
  if (!current || options.some((item) => item.value === current)) {
    return options
  }
  return [...options, { value: current, label: current }]
}
