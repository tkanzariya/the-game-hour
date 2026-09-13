import { useState } from 'react'
import { Button } from '@/components/Button'
import { ROUTES } from '@/constants/routes'
import { getContactInfo } from '@/lib/content/company'

type BookingSuccessProps = {
  bookingId: string | number
  category: 'social' | 'corporate'
}

export function BookingSuccess({ bookingId, category }: BookingSuccessProps) {
  const contact = getContactInfo()
  const [shareNote, setShareNote] = useState<string | null>(null)
  const message = `Hey, my reference ID is #${bookingId}. I've filled The Game Hour booking form. Please confirm my booking.`
  const whatsappHref = `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`

  const shareDetails = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'The Game Hour booking',
          text: message,
        })
        setShareNote('Shared.')
        return
      }
      await navigator.clipboard.writeText(message)
      setShareNote('Reference message copied.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareNote('Could not share. Copy your reference ID and message instead.')
    }
  }

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
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="btn" onClick={() => void shareDetails()}>
            Share details
          </button>
          <a
            className="btn btn-success"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </a>
        </div>
        {shareNote ? <p className="text-sm text-base-content/70">{shareNote}</p> : null}
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
