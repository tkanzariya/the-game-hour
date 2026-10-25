import { useEffect, useRef } from 'react'
import Icon from '@/components/Icon/Icon'
import type { PublicInquiryGame } from '@/lib/ops/types'

type ReviewDialogProps = {
  open: boolean
  games: PublicInquiryGame[]
  sending: boolean
  error: string | null
  onRemove: (id: number) => void
  onClose: () => void
  onSend: () => void
}

/** Final check before the one and only submission. */
export function ReviewDialog({
  open,
  games,
  sending,
  error,
  onRemove,
  onClose,
  onSend,
}: ReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="review-title"
      onCancel={(e) => {
        if (sending) e.preventDefault()
      }}
      onClose={onClose}
    >
      <div className="modal-box flex max-h-[90dvh] flex-col p-0">
        <div className="border-base-300 border-b px-5 py-4">
          <h2 id="review-title" className="font-heading text-xl font-semibold">
            Send your {games.length} {games.length === 1 ? 'game' : 'games'}?
          </h2>
          <p className="text-base-content/70 mt-1 text-sm">
            You can send your choice once. After that the list is locked, so take a last
            look.
          </p>
        </div>

        <ul className="divide-base-200 flex-1 divide-y overflow-y-auto px-5">
          {games.map((game) => (
            <li
              key={game.id}
              className="flex min-h-14 items-center justify-between gap-3 py-2"
            >
              <span className="font-medium">{game.name}</span>
              <button
                type="button"
                className="btn btn-ghost btn-square size-11 min-h-0"
                aria-label={`Remove ${game.name}`}
                disabled={sending}
                onClick={() => onRemove(game.id)}
              >
                <Icon name="x" size="sm" />
              </button>
            </li>
          ))}
        </ul>

        {error ? (
          <div role="alert" className="alert alert-error mx-5 mt-3">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="border-base-300 flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn h-12"
            disabled={sending}
            onClick={onClose}
          >
            Keep Choosing
          </button>
          <button
            type="button"
            className="btn btn-primary h-12 min-w-40"
            disabled={sending || games.length === 0}
            onClick={onSend}
          >
            {sending ? <span className="loading loading-spinner" /> : null}
            Send My Games
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" disabled={sending}>
          close
        </button>
      </form>
    </dialog>
  )
}
