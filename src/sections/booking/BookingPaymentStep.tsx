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

  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      <div role="alert" className="alert alert-warning">
        <span className="min-w-0 text-sm leading-relaxed sm:text-base">
          <strong>Your booking is not saved yet.</strong> {payment.screenshotRequired}
        </span>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
        <section className="card min-w-0 overflow-hidden bg-primary text-primary-content shadow-lg">
          <div className="card-body min-w-0 items-center gap-3 p-4 text-center sm:p-6">
            <h2 className="card-title font-heading text-lg sm:text-xl">{payment.title}</h2>
            <p className="text-sm leading-relaxed opacity-90">{payment.intro}</p>
            <img
              src={upiQrUrl}
              alt={`UPI QR code for ${payment.upiId}`}
              width={220}
              height={220}
              className="rounded-box h-auto w-full max-w-[220px] bg-base-100 p-2"
            />
            <p className="w-full min-w-0 text-sm break-all">
              UPI ID:{' '}
              <span className="font-heading font-semibold select-all">
                {payment.upiId}
              </span>
            </p>
            <div className="divider my-1 w-full text-xs uppercase">Or bank transfer</div>
            <dl className="w-full min-w-0 space-y-3 text-left text-sm">
              <BankRow label="Bank" value={payment.bank.name} />
              <BankRow label="Name" value={payment.bank.accountName} />
              <BankRow label="Account" value={payment.bank.accountNumber} selectAll />
              <BankRow label="IFSC" value={payment.bank.ifsc} selectAll />
            </dl>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="card card-border min-w-0 overflow-hidden bg-base-100">
            <div className="card-body min-w-0 gap-4 p-4 sm:p-6">
              <h3 className="card-title font-heading text-lg">How to pay</h3>
              <ol className="space-y-3">
                {payment.steps.map((item, i) => (
                  <li key={item.title} className="flex min-w-0 items-start gap-3">
                    <span className="bg-primary text-primary-content mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="min-w-0 text-sm leading-relaxed">
                      <strong>{item.title}:</strong> {item.body}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-sm leading-relaxed">
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

          <section className="card card-border min-w-0 overflow-hidden bg-base-100">
            <div className="card-body min-w-0 p-4 sm:p-6">
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
        <div role="alert" className="alert alert-error">
          <span>{submitError}</span>
        </div>
      ) : null}

      {!screenshot ? (
        <p className="text-error text-center text-sm font-semibold">
          Attach a payment screenshot, then submit. Your booking is not saved yet.
        </p>
      ) : null}

      <form
        className="bg-base-100 sticky bottom-0 z-50 flex flex-col gap-3 py-3 sm:flex-row sm:justify-center"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <button
          type="button"
          className="btn btn-lg sm:min-w-40"
          onClick={onPrevious}
          disabled={submitting}
        >
          Previous
        </button>
        <button type="submit" className="btn btn-primary btn-lg sm:min-w-40" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit booking'}
        </button>
      </form>
    </div>
  )
}

function BankRow({
  label,
  value,
  selectAll,
}: {
  label: string
  value: string
  selectAll?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs tracking-wide uppercase opacity-80">{label}</dt>
      <dd className={`mt-0.5 font-semibold break-words ${selectAll ? 'select-all' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
