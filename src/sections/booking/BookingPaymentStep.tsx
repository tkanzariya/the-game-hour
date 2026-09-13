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
    <div className="flex flex-col gap-6">
      <div role="alert" className="alert alert-warning alert-soft">
        <span>
          <strong>Your booking is not saved yet.</strong> {payment.screenshotRequired}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="card bg-primary text-primary-content shadow-lg">
          <div className="card-body items-center text-center">
            <h2 className="card-title font-heading">{payment.title}</h2>
            <p className="text-sm opacity-90">{payment.intro}</p>
            <img
              src={upiQrUrl}
              alt={`UPI QR code for ${payment.upiId}`}
              width={220}
              height={220}
              className="rounded-box bg-base-100 p-2"
            />
            <p className="text-sm">
              UPI ID:{' '}
              <span className="font-heading font-semibold select-all">
                {payment.upiId}
              </span>
            </p>
            <div className="divider text-xs uppercase">Or bank transfer</div>
            <dl className="w-full space-y-1 text-left text-sm">
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">Bank</dt>
                <dd className="font-semibold">{payment.bank.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">Name</dt>
                <dd className="font-semibold">{payment.bank.accountName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">Account</dt>
                <dd className="font-semibold select-all">
                  {payment.bank.accountNumber}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="opacity-70">IFSC</dt>
                <dd className="font-semibold select-all">{payment.bank.ifsc}</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="card card-border bg-base-100">
            <div className="card-body">
              <h3 className="card-title font-heading text-lg">How to pay</h3>
              <ul className="steps steps-vertical">
                {payment.steps.map((item, i) => (
                  <li
                    key={item.title}
                    className="step step-primary"
                    data-content={String(i + 1)}
                  >
                    <span className="text-left">
                      <strong>{item.title}:</strong> {item.body}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm opacity-70">
                {payment.help.split('+91')[0]}
                <a
                  href={`tel:${payment.helpPhone}`}
                  className="link link-hover font-semibold"
                >
                  +91 99240 07700
                </a>
              </p>
            </div>
          </section>

          <section className="card card-border bg-base-100">
            <div className="card-body">
              <FileDropzone
                id="payment_screenshot"
                label="Payment screenshot"
                required
                file={screenshot}
                error={error}
                onChange={onScreenshotChange}
              />
            </div>
          </section>
        </div>
      </div>

      {submitError ? (
        <div role="alert" className="alert alert-error alert-soft">
          <span>{submitError}</span>
        </div>
      ) : null}

      {!screenshot ? (
        <p className="text-center text-sm font-semibold text-error">
          Submit stays disabled until a payment screenshot is attached.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="sm:min-w-40"
          onClick={onPrevious}
          disabled={submitting}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="sm:min-w-40"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit booking'}
        </Button>
      </div>
    </div>
  )
}
