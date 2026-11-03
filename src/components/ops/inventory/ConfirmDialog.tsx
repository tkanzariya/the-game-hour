import { useEffect, useRef, useState } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  /** Do the work. Return a message if it failed, or null when it worked (the caller closes it). */
  onConfirm: () => Promise<string | null>
  onClose: () => void
}

/** A short question with a Cancel and one clear action. Mount fresh (change `key`) per use. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const run = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    const message = await onConfirm()
    setBusy(false)
    if (message) setError(message)
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="confirm-dialog-title"
      onClose={onClose}
    >
      <div className="modal-box">
        <h3 id="confirm-dialog-title" className="font-heading text-lg font-bold">
          {title}
        </h3>
        <p className="text-base-content/70 mt-2 text-sm">{body}</p>
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
            className={`btn h-11 ${danger ? 'btn-error' : 'btn-primary'}`}
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? <span className="loading loading-spinner" /> : null}
            {confirmLabel}
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
