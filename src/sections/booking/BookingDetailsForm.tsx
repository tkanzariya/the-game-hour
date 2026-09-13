import { useMemo } from 'react'
import { Button } from '@/components/Button'
import {
  DatePickerField,
  SelectField,
  TextAreaField,
  TextField,
  TimePickerField,
} from '@/components/booking'
import { getBookingFormContent } from '@/lib/booking/api'
import type {
  BookingDetails,
  BookingFieldErrors,
  EventCategory,
} from '@/lib/booking/types'
import {
  isDetailsValid,
  validateEmail,
  validateParticipants,
  validatePhone,
} from '@/lib/booking/validation'

type BookingDetailsFormProps = {
  category: EventCategory
  details: BookingDetails
  errors: BookingFieldErrors
  onChange: (next: BookingDetails) => void
  onErrorsChange: (next: BookingFieldErrors) => void
  onNext: () => void
}

export function BookingDetailsForm({
  category,
  details,
  errors,
  onChange,
  onErrorsChange,
  onNext,
}: BookingDetailsFormProps) {
  const content = getBookingFormContent()
  const canNext = useMemo(() => isDetailsValid(details, category), [details, category])

  const set =
    <K extends keyof BookingDetails>(key: K) =>
    (value: BookingDetails[K]) => {
      onChange({ ...details, [key]: value })
    }

  const clearError = (key: keyof BookingFieldErrors) => {
    if (!errors[key]) return
    const next = { ...errors }
    delete next[key]
    onErrorsChange(next)
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
      noValidate
    >
      <TextField
        id="email"
        label="Email ID"
        required
        type="email"
        autoComplete="email"
        placeholder={content.placeholders.email}
        value={details.email}
        error={errors.email}
        onChange={(e) => {
          set('email')(e.target.value)
          const err = validateEmail(e.target.value)
          onErrorsChange({ ...errors, email: err })
        }}
        onBlur={(e) => {
          const err = validateEmail(e.target.value)
          onErrorsChange({ ...errors, email: err })
        }}
      />

      {category === 'social' ? (
        <TextField
          id="birthday_person_name"
          label="Birthday Boy/Girl Name"
          placeholder={content.placeholders.birthdayPersonName}
          value={details.birthday_person_name}
          onChange={(e) => set('birthday_person_name')(e.target.value)}
          hint={
            details.event_type === 'birthday'
              ? 'Recommended for birthday bookings'
              : undefined
          }
        />
      ) : (
        <TextField
          id="company_name"
          label="Company Name"
          required
          placeholder={content.placeholders.companyName}
          value={details.company_name}
          error={errors.company_name}
          onChange={(e) => {
            set('company_name')(e.target.value)
            clearError('company_name')
          }}
        />
      )}

      <TextField
        id="contact_name"
        label="Your Name"
        required
        autoComplete="name"
        placeholder={
          category === 'corporate'
            ? content.placeholders.contactNameCorporate
            : content.placeholders.contactNameSocial
        }
        value={details.contact_name}
        error={errors.contact_name}
        onChange={(e) => {
          set('contact_name')(e.target.value)
          clearError('contact_name')
        }}
      />

      <TextAreaField
        id="address"
        label="Address"
        required
        placeholder={
          category === 'corporate'
            ? content.placeholders.addressCorporate
            : content.placeholders.addressSocial
        }
        value={details.address}
        error={errors.address}
        onChange={(e) => {
          set('address')(e.target.value)
          clearError('address')
        }}
      />

      <TextField
        id="phone"
        label="Contact No"
        required
        inputMode="numeric"
        autoComplete="tel"
        maxLength={10}
        placeholder={content.placeholders.phone}
        value={details.phone}
        error={errors.phone}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
          set('phone')(digits)
          const err = digits.length === 0 ? undefined : validatePhone(digits)
          onErrorsChange({ ...errors, phone: err })
        }}
      />

      {category === 'social' ? (
        <SelectField
          id="event_type"
          label="Type of Event"
          required
          placeholder="Choose Event Type"
          options={content.eventTypes}
          value={details.event_type}
          error={errors.event_type}
          onChange={(e) => {
            set('event_type')(e.target.value)
            clearError('event_type')
          }}
        />
      ) : null}

      <TextField
        id="participant_count"
        label="No. of Participants"
        required
        inputMode="numeric"
        placeholder={content.placeholders.participants}
        value={details.participant_count}
        error={errors.participant_count}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          set('participant_count')(digits)
          const err = digits === '' ? undefined : validateParticipants(digits)
          onErrorsChange({ ...errors, participant_count: err })
        }}
      />

      {category === 'social' ? (
        <SelectField
          id="age_group"
          label="Age Group"
          required
          placeholder="Choose age group"
          options={content.ageGroups}
          value={details.age_group}
          error={errors.age_group}
          onChange={(e) => {
            set('age_group')(e.target.value)
            clearError('age_group')
          }}
        />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <DatePickerField
          id="event_date"
          label="Date of Event"
          required
          value={details.event_date}
          error={errors.event_date}
          onChange={(ymd) => {
            set('event_date')(ymd)
            clearError('event_date')
          }}
        />
        <TimePickerField
          id="event_time"
          label="Time of Event"
          required
          value={details.event_time}
          error={errors.event_time}
          onChange={(hhmm) => {
            set('event_time')(hhmm)
            clearError('event_time')
          }}
        />
      </div>

      <TextField
        id="venue_name"
        label="Venue of Event"
        placeholder={content.placeholders.venue}
        value={details.venue_name}
        onChange={(e) => set('venue_name')(e.target.value)}
      />

      <SelectField
        id="venue_type"
        label="Venue Type"
        required
        placeholder="Choose Type of Venue"
        options={content.venueTypes}
        value={details.venue_type}
        error={errors.venue_type}
        onChange={(e) => {
          set('venue_type')(e.target.value as BookingDetails['venue_type'])
          clearError('venue_type')
        }}
      />

      <SelectField
        id="payment_mode"
        label="Mode of Payment"
        required
        placeholder="Choose Mode of Payment"
        options={content.paymentModes}
        value={details.payment_mode}
        error={errors.payment_mode}
        onChange={(e) => {
          set('payment_mode')(e.target.value as BookingDetails['payment_mode'])
          clearError('payment_mode')
        }}
      />

      <TextField
        id="referral_source"
        label="How did you hear about us?"
        placeholder={content.placeholders.referral}
        value={details.referral_source}
        onChange={(e) => set('referral_source')(e.target.value)}
      />

      <TextAreaField
        id="special_requirements"
        label="Special Requirements"
        placeholder={content.placeholders.specialRequirements}
        value={details.special_requirements}
        onChange={(e) => set('special_requirements')(e.target.value)}
      />

      <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
        <p className="font-heading text-sm font-bold text-primary">
          Terms & conditions
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-sm text-text">
          {content.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      <label className="flex items-start gap-3 font-body text-sm text-primary">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-primary/30 text-primary focus:ring-secondary"
          checked={details.terms_accepted}
          onChange={(e) => {
            set('terms_accepted')(e.target.checked)
            clearError('terms_accepted')
          }}
        />
        <span>
          I agree to all the terms and conditions mentioned above
          <span className="text-error">*</span>
          {errors.terms_accepted ? (
            <span className="mt-1 block text-error" role="alert">
              {errors.terms_accepted}
            </span>
          ) : null}
        </span>
      </label>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!canNext}
        >
          Next
        </Button>
        {!canNext ? (
          <p className="mt-2 text-center font-body text-xs text-accent-muted-grey">
            Fill all required fields, fix errors, and accept the terms to continue.
          </p>
        ) : null}
      </div>
    </form>
  )
}
