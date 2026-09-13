import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import bookingForm from '@/data/content/booking-form.json'
import { fetchEvent, fetchGames, fetchTeam, updateEvent } from '@/lib/ops/api'
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
  const { csrf } = useOpsAuth()
  const [event, setEvent] = useState<OpsEventDetail | null>(null)
  const [games, setGames] = useState<OpsGame[]>([])
  const [team, setTeam] = useState<OpsTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

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
        <Link to={ROUTES.opsEvents} className="link">
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
          <Link to={ROUTES.opsEvents} className="link">
            Back to events
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{event.display_name}</h1>
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
        <button
          type="button"
          className="btn"
          onClick={() => setEditing((value) => !value)}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

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
          {event.screenshot_url ? (
            <figure className="mt-2 max-w-sm">
              <img
                src={event.screenshot_url}
                alt="Payment screenshot"
                className="rounded-box"
              />
            </figure>
          ) : (
            <p>No payment screenshot on file.</p>
          )}
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
    <div>
      <dt className="text-sm text-base-content/60">{label}</dt>
      <dd>{value || '—'}</dd>
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
  const [status, setStatus] = useState(event.event_status)
  const [venueName, setVenueName] = useState(event.venue_name ?? '')
  const [eventDate, setEventDate] = useState(event.event_date)
  const [eventTime, setEventTime] = useState(timeInputValue(event.event_time))
  const [venueType, setVenueType] = useState(event.venue_type ?? 'indoor')
  const [participants, setParticipants] = useState(String(event.participant_count))
  const [eventType, setEventType] = useState(event.event_type ?? '')
  const [ageGroup, setAgeGroup] = useState(event.age_group ?? '')
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
      venue_type: venueType,
      participant_count: Number(participants) || 1,
      event_type: eventType || null,
      age_group: ageGroup || null,
      price: parseMoney(price),
      event_expenses: parseMoney(expenses),
      advance_amount: parseMoney(advanceAmount),
      advance_payment_date: advanceDate || null,
      advance_payment_completed: advanceDone,
      full_payment_amount: parseMoney(finalAmount),
      full_payment_date: finalDate || null,
      full_payment_completed: finalDone,
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
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body grid gap-4 sm:grid-cols-2">
          <h2 className="card-title sm:col-span-2">Event details</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Status</legend>
            <select
              className="select w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as OpsEventDetail['event_status'])}
            >
              <option value="pending">Pending</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </fieldset>
          <label className="label cursor-pointer justify-start gap-3 sm:col-span-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={onCalendar}
              onChange={(e) => setOnCalendar(e.target.checked)}
            />
            <span>Added to calendar</span>
          </label>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Venue</legend>
            <input
              className="input w-full"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Venue type</legend>
            <select
              className="select w-full"
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as 'indoor' | 'outdoor')}
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Date</legend>
            <input
              className="input w-full"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Time</legend>
            <input
              className="input w-full"
              type="time"
              step={900}
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Participants</legend>
            <input
              className="input w-full"
              type="number"
              min={1}
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Instagram</legend>
            <input
              className="input w-full"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </fieldset>
          {event.event_category === 'social' ? (
            <>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Event type</legend>
                <select
                  className="select w-full"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="">Choose type</option>
                  {bookingForm.eventTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Age group</legend>
                <select
                  className="select w-full"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                >
                  <option value="">Choose age group</option>
                  {bookingForm.ageGroups.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </fieldset>
            </>
          ) : null}
          <fieldset className="fieldset sm:col-span-2">
            <legend className="fieldset-legend">Special requirements</legend>
            <textarea
              className="textarea w-full"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body grid gap-4 sm:grid-cols-2">
          <h2 className="card-title sm:col-span-2">Payment</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Event price</legend>
            <input
              className="input w-full"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Expenses</legend>
            <input
              className="input w-full"
              inputMode="decimal"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
          </fieldset>
          <label className="label cursor-pointer justify-start gap-3 sm:col-span-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={advanceDone}
              onChange={(e) => setAdvanceDone(e.target.checked)}
            />
            <span>Advance payment received</span>
          </label>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Advance amount</legend>
            <input
              className="input w-full"
              inputMode="decimal"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Advance date</legend>
            <input
              className="input w-full"
              type="date"
              value={advanceDate}
              onChange={(e) => setAdvanceDate(e.target.value)}
            />
          </fieldset>
          <label className="label cursor-pointer justify-start gap-3 sm:col-span-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={finalDone}
              onChange={(e) => setFinalDone(e.target.checked)}
            />
            <span>Final payment received</span>
          </label>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Final amount</legend>
            <input
              className="input w-full"
              inputMode="decimal"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Final date</legend>
            <input
              className="input w-full"
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset className="card bg-base-100 shadow">
          <div className="card-body">
            <legend className="fieldset-legend">Games played</legend>
            {games.length === 0 ? (
              <p>No games in the catalogue yet. Import will fill this list.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {games.map((game) => (
                  <label key={game.id} className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={gameIds.includes(game.id)}
                      onChange={() =>
                        setGameIds((current) => toggleId(current, game.id))
                      }
                    />
                    <span>{game.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </fieldset>
        <fieldset className="card bg-base-100 shadow">
          <div className="card-body">
            <legend className="fieldset-legend">Team sent</legend>
            {team.length === 0 ? (
              <p>No team members yet. Import will fill this list.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {team.map((member) => (
                  <label key={member.id} className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={teamIds.includes(member.id)}
                      onChange={() =>
                        setTeamIds((current) => toggleId(current, member.id))
                      }
                    />
                    <span>
                      {member.name}
                      {member.position ? ` · ${member.position}` : ''}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </fieldset>
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

function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}
