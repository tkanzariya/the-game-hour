import { getBookingFormContent } from '@/lib/booking/api'
import type { EventCategory } from '@/lib/booking/types'

type BookingCategoryStepProps = {
  onSelect: (category: EventCategory) => void
}

export function BookingCategoryStep({ onSelect }: BookingCategoryStepProps) {
  const { categoryChooser } = getBookingFormContent()

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-base-content/70">{categoryChooser.body}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="card card-border bg-base-100">
          <div className="card-body">
            <h2 className="card-title font-heading">{categoryChooser.socialTitle}</h2>
            <p className="text-sm text-base-content/70">{categoryChooser.socialBody}</p>
            <div className="card-actions mt-2">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => onSelect('social')}
              >
                {categoryChooser.socialCta}
              </button>
            </div>
          </div>
        </article>
        <article className="card card-border bg-base-100">
          <div className="card-body">
            <h2 className="card-title font-heading">{categoryChooser.corporateTitle}</h2>
            <p className="text-sm text-base-content/70">{categoryChooser.corporateBody}</p>
            <div className="card-actions mt-2">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => onSelect('corporate')}
              >
                {categoryChooser.corporateCta}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
