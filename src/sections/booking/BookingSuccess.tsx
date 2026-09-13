import { Button } from '@/components/Button'
import { ROUTES } from '@/constants/routes'

type BookingSuccessProps = {
  bookingId: string | number
  category: 'social' | 'corporate'
}

export function BookingSuccess({ bookingId, category }: BookingSuccessProps) {
  return (
    <div className="card card-border bg-base-100 mx-auto max-w-lg text-center">
      <div className="card-body items-center gap-4 py-10">
        <div className="badge badge-success badge-lg">Confirmed</div>
        <h2 className="card-title font-heading justify-center text-2xl">
          We received your {category === 'corporate' ? 'corporate' : 'event'} booking
        </h2>
        <p className="text-sm opacity-70">
          Our team will confirm after verifying the advance payment screenshot.
        </p>
        <p className="badge badge-outline badge-lg font-heading">
          Reference #{bookingId}
        </p>
        <div className="card-actions mt-2 justify-center">
          <Button href={ROUTES.home} variant="primary">
            Back to home
          </Button>
          <Button href={ROUTES.contact} variant="secondary">
            Contact us
          </Button>
        </div>
      </div>
    </div>
  )
}
