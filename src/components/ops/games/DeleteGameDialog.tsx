import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon/Icon'
import { deleteGame } from '@/lib/ops/api'
import { useOpsToast } from '@/lib/ops/toast'
import type { OpsGame } from '@/lib/ops/types'

type DeleteGameDialogProps = {
  game: OpsGame | null
  csrf: string
  onClose: () => void
  onDeleted: (game: OpsGame) => void
}

export function DeleteGameDialog({
  game,
  csrf,
  onClose,
  onDeleted,
}: DeleteGameDialogProps) {
  const { notify } = useOpsToast()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (game) {
      if (!el.open) el.showModal()
      return
    }
    if (el.open) el.close()
  }, [game])

  const onConfirm = async () => {
    if (!game || deleting) return
    setDeleting(true)
    setError(null)
    const result = await deleteGame(game.id, csrf)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    notify('Game deleted')
    onDeleted(game)
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="delete-game-title"
      onClose={onClose}
    >
      <div className="modal-box">
        <h3 id="delete-game-title" className="font-heading text-lg font-bold">
          Delete “{game?.name}”?
        </h3>
        <p className="text-base-content/70 mt-2 text-sm">
          This removes the game from the catalog and from any event it was added to. You
          can’t undo this.
        </p>
        {error ? (
          <div role="alert" className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn h-11" disabled={deleting}>
              Cancel
            </button>
          </form>
          <button
            type="button"
            className="btn btn-error h-11"
            disabled={deleting}
            onClick={() => void onConfirm()}
          >
            {deleting ? (
              <span className="loading loading-spinner" />
            ) : (
              <Icon name="trash" size="sm" />
            )}
            Delete Game
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" disabled={deleting}>
          close
        </button>
      </form>
    </dialog>
  )
}
