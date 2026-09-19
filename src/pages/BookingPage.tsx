import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { StepIndicator } from '@/components/booking'
import {
  BookingCategoryStep,
  BookingDetailsForm,
  BookingPaymentStep,
  BookingSuccess,
} from '@/sections/booking'
import { getBookingTitle, submitBooking } from '@/lib/booking/api'
import {
  emptyBookingDetails,
  parseEventCategory,
  type BookingDetails,
  type BookingFieldErrors,
  type EventCategory,
} from '@/lib/booking/types'
import { validateDetails } from '@/lib/booking/validation'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'
import { ROUTES, bookingSearch } from '@/constants/routes'

const STEP_LABELS = ['Event type', 'Event details', 'Advance payment']

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const categoryFromUrl = parseEventCategory(
    new URLSearchParams(location.search).get('category'),
  )
  const [category, setCategory] = useState<EventCategory | null>(categoryFromUrl)
  const [step, setStep] = useState<1 | 2>(1)
  const [details, setDetails] = useState<BookingDetails>(() =>
    emptyBookingDetails(categoryFromUrl ?? 'social'),
  )
  const [errors, setErrors] = useState<BookingFieldErrors>({})
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotError, setScreenshotError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [bookingId, setBookingId] = useState<string | number | null>(null)

  useEffect(() => {
    setCategory(categoryFromUrl)
  }, [categoryFromUrl])

  useEffect(() => {
    if (!category) {
      setStep(1)
      return
    }
    setDetails((prev) =>
      prev.event_category === category ? prev : emptyBookingDetails(category),
    )
  }, [category])

  const title = getBookingTitle(category)
  const seoPath = category ? `${ROUTES.book}?category=${category}` : ROUTES.book
  const seo = buildSeo({
    title: category === 'corporate' ? 'Corporate Booking' : 'Book your Event',
    description:
      category === 'corporate'
        ? 'Book facilitator-led corporate games with The Game Hour. Complete event details and advance payment online.'
        : 'Book your Game Hour event — social or corporate. Choose your event type, then complete details and advance payment online.',
    canonical: `${SITE.url}${seoPath}`,
  })

  const selectCategory = (next: EventCategory) => {
    setCategory(next)
    navigate({ pathname: ROUTES.book, search: bookingSearch(next) })
    setDetails((prev) =>
      prev.event_category === next ? prev : emptyBookingDetails(next),
    )
    setErrors({})
    setStep(1)
    setBookingId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearCategory = () => {
    setCategory(null)
    navigate(ROUTES.book)
    setStep(1)
    setErrors({})
    setScreenshot(null)
    setScreenshotError(undefined)
    setSubmitError(undefined)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goNext = () => {
    if (!category) return
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
    if (!category) return
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
      const result = await submitBooking(
        { ...details, event_category: category },
        screenshot,
      )
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

  const indicatorStep = bookingId !== null ? 3 : !category ? 1 : step === 1 ? 2 : 3
  const heroSubtitle =
    bookingId !== null
      ? 'We have your details and payment screenshot. Our team will confirm after verifying the advance payment.'
      : !category
        ? 'Start by choosing a social celebration or a corporate event. Then complete details and advance payment — we only save the booking after that.'
        : category === 'corporate'
          ? 'Share your company event details. Next you’ll complete the advance payment with a screenshot — we only save the booking after that.'
          : 'Tell us about your celebration. Next you’ll complete the advance payment with a screenshot — we only save the booking after that.'

  return (
    <>
      <Seo {...seo} />
      <PageHero
        title={bookingId !== null ? 'Booking submitted' : title}
        subtitle={heroSubtitle}
        badge={
          category === 'corporate'
            ? 'Corporate booking'
            : category === 'social'
              ? 'Social booking'
              : 'Book your event'
        }
        containerWidth="wide"
      />

      <Section tone="default" padding="sm" profile="marketing">
        <div className="mx-auto w-full min-w-0 max-w-3xl pb-8">
          {bookingId !== null && category ? (
            <BookingSuccess bookingId={bookingId} category={category} />
          ) : (
            <>
              <StepIndicator current={indicatorStep} labels={STEP_LABELS} />
              <div className="mt-8">
                {!category ? (
                  <BookingCategoryStep onSelect={selectCategory} />
                ) : step === 1 ? (
                  <BookingDetailsForm
                    category={category}
                    details={details}
                    errors={errors}
                    onChange={setDetails}
                    onErrorsChange={setErrors}
                    onNext={goNext}
                    onChangeCategory={clearCategory}
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
