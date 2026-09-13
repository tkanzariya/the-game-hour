import { useState } from 'react'
import { Seo } from '@/components/Seo'
import { Container } from '@/components/Container'
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
  const path = category === 'corporate' ? ROUTES.bookCorporate : ROUTES.book
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
      return
    }
    setScreenshotError(undefined)
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      const result = await submitBooking(details, screenshot)
      if (!result.ok) {
        setSubmitError(result.error)
        if (result.fields?.payment_screenshot) {
          setScreenshotError(result.fields.payment_screenshot)
        }
        return
      }
      setBookingId(result.bookingId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo {...seo} />
      <div className="min-h-[70vh] bg-gradient-to-b from-primary via-primary to-dark pb-16 pt-8 sm:pt-12">
        <Container className="mx-auto max-w-xl">
          <div className="surface-clay overflow-hidden rounded-3xl px-5 py-8 shadow-card sm:px-8 sm:py-10">
            {bookingId !== null ? (
              <BookingSuccess bookingId={bookingId} category={category} />
            ) : (
              <>
                <h1 className="mb-2 text-center font-heading text-2xl font-bold text-primary sm:text-3xl">
                  {title}
                </h1>
                <p className="mb-6 text-center font-body text-sm text-accent-muted-grey">
                  {category === 'corporate'
                    ? 'Corporate booking'
                    : 'Social / celebration booking'}{' '}
                  · Step {step} of 2
                </p>
                <StepIndicator step={step} />
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
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
