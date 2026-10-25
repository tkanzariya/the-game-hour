import { useEffect, useRef, useState } from 'react'
import { deleteInquiry, inquiryAction } from '@/lib/ops/api'
import { INQUIRY_EXPIRY_OPTIONS } from '@/lib/ops/inquiry'
import { useOpsToast } from '@/lib/ops/toast'
import type { OpsInquiry } from '@/lib/ops/types'

export type InquiryDialogMode = 'extend' | 'reopen' | 'expire' | 'delete'

type InquiryActionDialogProps = {
  mode: InquiryDialogMode | null
  inquiry: OpsInquiry | null
  csrf: string
  onClose: () => void
  onUpdated: (inquiry: OpsInquiry) => void
  onDeleted: (inquiry: OpsInquiry) => void
}

const COPY: Record<
  InquiryDialogMode,
  {
    title: (name: string) => string
    body: string
    confirm: string
    done: string
    danger: boolean
  }
> = {
  extend: {
    title: () => 'Extend the link',
    body: 'Adds time to the current expiry. If the link already expired, the time starts from now.',
    confirm: 'Extend Link',
    done: 'Link extended',
    danger: false,
  },
  reopen: {
    title: (name) => `Let ${name} change their games?`,
    body: 'Reopens the link so they can choose again and send a new selection. Their current picks stay selected.',
    confirm: 'Reopen Link',
    done: 'Link reopened',
    danger: false,
  },
  expire: {
    title: () => 'Expire this link now?',
    body: 'The customer will no longer be able to open it or send games. You can extend it again later.',
    confirm: 'Expire Now',
    done: 'Link expired',
    danger: true,
  },
  delete: {
    title: () => 'Delete this inquiry?',
    body: 'This removes the inquiry, the link and the customer’s selection. You can’t undo this.',
    confirm: 'Delete Inquiry',
    done: 'Inquiry deleted',
    danger: true,
  },
}

export function InquiryActionDialog({
  mode,
  inquiry,
  csrf,
  onClose,
  onUpdated,
  onDeleted,
}: InquiryActionDialogProps) {
  const { notify } = useOpsToast()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [minutes, setMinutes] = useState(1440)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = mode !== null && inquiry !== null

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const copy = mode ? COPY[mode] : null
  const asksDuration = mode === 'extend' || mode === 'reopen'

  const onConfirm = async () => {
    if (!mode || !inquiry || busy) return
    setBusy(true)
    setError(null)
    if (mode === 'delete') {
      const result = await deleteInquiry(inquiry.id, csrf)
      setBusy(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      notify(COPY.delete.done)
      onDeleted(inquiry)
      return
    }
    const result = await inquiryAction(
      inquiry.id,
      mode,
      csrf,
      asksDuration ? minutes : undefined,
    )
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify(COPY[mode].done)
    onUpdated(result.inquiry)
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="inquiry-dialog-title"
      onClose={onClose}
    >
      <div className="modal-box">
        <h3 id="inquiry-dialog-title" className="font-heading text-lg font-bold">
          {copy && inquiry ? copy.title(inquiry.customer_name) : ''}
        </h3>
        <p className="text-base-content/70 mt-2 text-sm">{copy?.body}</p>

        {asksDuration ? (
          <fieldset className="fieldset mt-4 p-0">
            <legend className="fieldset-legend font-heading text-sm font-semibold">
              <label htmlFor="inquiry-dialog-minutes">
                {mode === 'extend' ? 'Add' : 'Keep it open for'}
              </label>
            </legend>
            <select
              id="inquiry-dialog-minutes"
              className="select h-11 w-full"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {INQUIRY_EXPIRY_OPTIONS.map((option) => (
                <option key={option.minutes} value={option.minutes}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>
        ) : null}

        {error ? (
          <div role="alert" className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn h-11" disabled={busy}>
              Cancel
            </button>
          </form>
          <button
            type="button"
            className={`btn h-11 ${copy?.danger ? 'btn-error' : 'btn-primary'}`}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? <span className="loading loading-spinner" /> : null}
            {copy?.confirm}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" disabled={busy}>
          close
        </button>
      </form>
    </dialog>
  )
}
