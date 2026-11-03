import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

type FormSheetProps = {
  open: boolean
  title: string
  submitLabel: string
  saving: boolean
  /** True when the person has typed something that would be lost. */
  dirty: boolean
  /** A problem that is not tied to one field. */
  error: string | null
  onClose: () => void
  onSubmit: () => void | Promise<void>
  children: ReactNode
}

/**
 * Bottom sheet on phones, centred dialog on larger screens: Cancel on the left, the main
 * action on the right, and a prompt before unsaved input is thrown away.
 * Mount a fresh one (change its `key`) each time it opens so the form starts clean.
 */
export function FormSheet({
  open,
  title,
  submitLabel,
  saving,
  dirty,
  error,
  onClose,
  onSubmit,
  children,
}: FormSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  const requestClose = () => {
    if (saving) return
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    onClose()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    void onSubmit()
    // Bring the first problem into view if the submit found one.
    window.requestAnimationFrame(() => {
      bodyRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
    >
      <form
        noValidate
        onSubmit={submit}
        className="modal-box flex max-h-[92dvh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[88dvh]"
      >
        <div
          aria-hidden
          className="bg-base-300 mx-auto mt-2 h-1 w-9 rounded-full sm:hidden"
        />
        <header className="border-base-300 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-2 sm:px-4">
          <button
            type="button"
            className="btn btn-ghost h-11 justify-self-start"
            disabled={saving}
            onClick={requestClose}
          >
            Cancel
          </button>
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <button
            type="submit"
            className="btn btn-primary h-11 justify-self-end"
            disabled={saving}
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : null}
            {submitLabel}
          </button>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            {confirmDiscard ? (
              <div
                role="alert"
                className="alert alert-warning items-start sm:items-center"
              >
                <span className="flex-1">Discard what you’ve entered?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm h-10"
                    onClick={() => setConfirmDiscard(false)}
                  >
                    Keep Editing
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-error h-10"
                    onClick={onClose}
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : null}
            {error ? (
              <div role="alert" className="alert alert-error">
                <span>{error}</span>
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </form>
      <div className="modal-backdrop">
        <button type="button" tabIndex={-1} aria-label="Close" onClick={requestClose}>
          close
        </button>
      </div>
    </dialog>
  )
}
