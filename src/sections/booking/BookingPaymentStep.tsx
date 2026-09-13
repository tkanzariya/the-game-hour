import { Button } from '@/components/Button'
import { FileDropzone } from '@/components/booking'
import { getBookingFormContent } from '@/lib/booking/api'

type BookingPaymentStepProps = {
  screenshot: File | null
  error?: string
  submitting?: boolean
  submitError?: string
  onScreenshotChange: (file: File | null) => void
  onPrevious: () => void
  onSubmit: () => void
}

export function BookingPaymentStep({
  screenshot,
  error,
  submitting,
  submitError,
  onScreenshotChange,
  onPrevious,
  onSubmit,
}: BookingPaymentStepProps) {
  const { payment } = getBookingFormContent()
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${payment.upiId}&pn=${encodeURIComponent(payment.upiPayeeName)}`,
  )}`

  const canSubmit = Boolean(screenshot) && !submitting

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
          {payment.title}
        </h2>
        <p className="mt-2 font-body text-sm text-accent-muted-grey">{payment.intro}</p>
      </div>

      <div
        className="rounded-2xl border-2 border-warning/40 bg-warning/15 px-4 py-3 font-body text-sm text-primary"
        role="status"
      >
        <strong className="font-heading">Important:</strong>{' '}
        {payment.screenshotRequired}
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary text-on-primary shadow-card">
        <div className="flex flex-col items-center gap-4 p-5 sm:p-6">
          <p className="font-heading text-lg font-bold tracking-wide">
            SCAN ME FOR PAYMENT
          </p>
          <img
            src={upiQrUrl}
            alt={`UPI QR code for ${payment.upiId}`}
            width={220}
            height={220}
            className="rounded-xl bg-white p-2"
          />
          <p className="font-body text-sm">
            UPI ID:{' '}
            <span className="font-heading font-semibold select-all">
              {payment.upiId}
            </span>
          </p>
          <div className="w-full border-t border-white/20 pt-4 text-center">
            <p className="font-heading text-xs font-semibold tracking-wider uppercase opacity-80">
              Or payment information
            </p>
            <dl className="mt-3 space-y-1 font-body text-sm">
              <div>
                <dt className="inline opacity-70">Bank: </dt>
                <dd className="inline font-semibold">{payment.bank.name}</dd>
              </div>
              <div>
                <dt className="inline opacity-70">Name: </dt>
                <dd className="inline font-semibold">{payment.bank.accountName}</dd>
              </div>
              <div>
                <dt className="inline opacity-70">Account: </dt>
                <dd className="inline font-semibold select-all">
                  {payment.bank.accountNumber}
                </dd>
              </div>
              <div>
                <dt className="inline opacity-70">IFSC: </dt>
                <dd className="inline font-semibold select-all">{payment.bank.ifsc}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <p className="font-body text-sm text-accent-muted-grey">
        {payment.help.split('+91')[0]}
        <a
          href={`tel:${payment.helpPhone}`}
          className="font-semibold text-primary hover:underline"
        >
          +91 99240 07700
        </a>
      </p>

      <ol className="space-y-2 rounded-2xl bg-surface-muted/80 p-4 font-body text-sm text-primary">
        {payment.steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="font-heading font-bold">{i + 1}.</span>
            <span>
              <strong className="font-heading">{step.title}:</strong> {step.body}
            </span>
          </li>
        ))}
      </ol>

      <FileDropzone
        id="payment_screenshot"
        label="Payment screenshot"
        required
        file={screenshot}
        error={error}
        onChange={onScreenshotChange}
      />

      {submitError ? (
        <p
          className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      {!screenshot ? (
        <p className="text-center font-body text-xs font-semibold text-error">
          Submit stays disabled until a payment screenshot is attached — your booking is
          not saved yet.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onPrevious}
          disabled={submitting}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="flex-1 !bg-success !border-success hover:!bg-success/90"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </div>
  )
}
