import { useState } from 'react'
import { Seo } from '@/components/Seo'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { StepIndicator } from '@/components/booking'
import {
  BookingDetailsForm,
  BookingPaymentStep,
  BookingSuccess,
} from '@/sections/booking'
import { submitBooking } from '@/lib/booking/api'
import { getBookingTitle } from '@/lib/booking/api'
import {
  emptyBookingDetails,
  type BookingDetails,
  type BookingFieldErrors,
  type EventCategory,
} from '@/lib/booking/types'
import { validateDetails } from '@/lib/booking/validation'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'
import { ROUTES } from '@/constants/routes'

type BookingPageProps = {
  category: EventCategory
}

export default function BookingPage({ category }: BookingPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [details, setDetails] = useState<BookingDetails>(() =>
    emptyBookingDetails(category),
  )
  const [errors, setErrors] = useState<BookingFieldErrors>({})
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotError, setScreenshotError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [bookingId, setBookingId] = useState<string | number | null>(null)

  const title = getBookingTitle(category)
  const path = category === 'corporate' ? ROUTES.bookCorporate : ROUTES.bookSocial
  const seo = buildSeo({
    title: category === 'corporate' ? 'Corporate Booking' : 'Book your Event',
    description:
      category === 'corporate'
        ? 'Book facilitator-led corporate games with The Game Hour. Complete event details and advance payment online.'
        : 'Book your Game Hour event — birthdays, gatherings, festivals, and more. Complete details and advance payment online.',
    canonical: `${SITE.url}${path}`,
  })

  const goNext = () => {
    const nextErrors = validateDetails(details, category)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0]
      document.getElementById(firstKey)?.focus()
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!screenshot) {
      setScreenshotError(
        'Attach a payment screenshot to submit. Your booking is not saved yet.',
      )
      setSubmitError(
        'Attach a payment screenshot to submit. Your booking is not saved yet.',
      )
      return
    }
    setScreenshotError(undefined)
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      const result = await submitBooking(details, screenshot)
      if (!result.ok) {
        const fieldHint =
          result.fields && Object.keys(result.fields).length > 0
            ? ` (${Object.keys(result.fields).join(', ')})`
            : ''
        setSubmitError(`${result.error}${fieldHint}`)
        if (result.fields?.payment_screenshot) {
          setScreenshotError(result.fields.payment_screenshot)
        }
        return
      }
      setBookingId(result.bookingId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not submit the booking. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo {...seo} />
      <PageHero
        title={bookingId !== null ? 'Booking submitted' : title}
        subtitle={
          bookingId !== null
            ? 'We have your details and payment screenshot. Our team will confirm after verifying the advance payment.'
            : category === 'corporate'
              ? 'Share your company event details. Next you’ll complete the advance payment with a screenshot — we only save the booking after that.'
              : 'Tell us about your celebration. Next you’ll complete the advance payment with a screenshot — we only save the booking after that.'
        }
        badge={category === 'corporate' ? 'Corporate booking' : 'Book your event'}
        containerWidth="wide"
      />

      <Section tone="default" padding="sm" profile="marketing">
        <div className="mx-auto w-full min-w-0 max-w-3xl pb-8">
          {bookingId !== null ? (
            <BookingSuccess bookingId={bookingId} category={category} />
          ) : (
            <>
              <StepIndicator step={step} />
              <div className="mt-8">
                {step === 1 ? (
                  <BookingDetailsForm
                    category={category}
                    details={details}
                    errors={errors}
                    onChange={setDetails}
                    onErrorsChange={setErrors}
                    onNext={goNext}
                  />
                ) : (
                  <BookingPaymentStep
                    screenshot={screenshot}
                    error={screenshotError}
                    submitting={submitting}
                    submitError={submitError}
                    onScreenshotChange={(file) => {
                      setScreenshot(file)
                      setScreenshotError(undefined)
                    }}
                    onPrevious={() => {
                      setStep(1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    onSubmit={() => void handleSubmit()}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
