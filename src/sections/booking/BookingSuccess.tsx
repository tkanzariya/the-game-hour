import { Button } from '@/components/Button'
import { ROUTES } from '@/constants/routes'

type BookingSuccessProps = {
  bookingId: string | number
  category: 'social' | 'corporate'
}

export function BookingSuccess({ bookingId, category }: BookingSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
        ✓
      </div>
      <h2 className="font-heading text-2xl font-bold text-primary">
        Booking submitted
      </h2>
      <p className="max-w-md font-body text-sm leading-relaxed text-accent-muted-grey">
        Thanks — we received your {category === 'corporate' ? 'corporate' : 'event'}{' '}
        booking and payment screenshot. Our team will confirm after verifying the
        advance payment.
      </p>
      <p className="rounded-xl bg-surface-muted px-4 py-2 font-heading text-sm font-semibold text-primary">
        Reference: #{bookingId}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button href={ROUTES.home} variant="primary">
          Back to home
        </Button>
        <Button href={ROUTES.contact} variant="secondary">
          Contact us
        </Button>
      </div>
    </div>
  )
}
