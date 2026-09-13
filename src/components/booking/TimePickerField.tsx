import { useEffect, useId, useRef, useState } from 'react'
import { FieldShell } from './FormFields'
import { formatTimeLabel, parse24Hour, to24Hour } from '@/lib/booking/validation'
import { cn } from '@/utils/cn'

type TimePickerFieldProps = {
  id?: string
  label: string
  required?: boolean
  error?: string
  value: string
  onChange: (hhmm: string) => void
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = [0, 15, 30, 45] as const

type Draft = {
  hour12: number
  minute: (typeof MINUTES)[number]
  period: 'AM' | 'PM'
}

function draftFromValue(value: string): Draft {
  const parsed = parse24Hour(value)
  const minute =
    parsed && MINUTES.includes(parsed.minute as (typeof MINUTES)[number])
      ? (parsed.minute as (typeof MINUTES)[number])
      : 0
  return {
    hour12: parsed?.hour12 ?? 12,
    minute,
    period: parsed?.period ?? 'AM',
  }
}

export function TimePickerField({
  id: idProp,
  label,
  required,
  error,
  value,
  onChange,
}: TimePickerFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => draftFromValue(value))
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const openPicker = () => {
    setDraft(draftFromValue(value))
    setOpen(true)
  }

  const commit = (next: Draft) => {
    setDraft(next)
    onChange(to24Hour(next.hour12, next.minute, next.period))
  }

  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          className={cn(
            'input w-full cursor-pointer justify-between text-left',
            !value && 'text-base-content/50',
            error && 'input-error',
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openPicker())}
        >
          <span>{value ? formatTimeLabel(value) : 'Select time'}</span>
          <span aria-hidden className="text-primary/50">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label="Choose time"
            className="card card-border bg-base-100 absolute z-30 mt-2 w-full p-3 shadow-lg"
          >
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="mb-1 text-xs font-semibold opacity-60">Hour</p>
                <div className="bg-base-200 max-h-40 overflow-y-auto rounded-box p-1">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={cn(
                        'btn btn-ghost btn-sm btn-block justify-start',
                        draft.hour12 === h && 'btn-active',
                      )}
                      onClick={() => commit({ ...draft, hour12: h })}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold opacity-60">Min</p>
                <div className="bg-base-200 max-h-40 overflow-y-auto rounded-box p-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={cn(
                        'btn btn-ghost btn-sm btn-block justify-start',
                        draft.minute === m && 'btn-active',
                      )}
                      onClick={() => commit({ ...draft, minute: m })}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold opacity-60">AM/PM</p>
                <div className="bg-base-200 flex flex-col gap-1 rounded-box p-1">
                  {(['AM', 'PM'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={cn(
                        'btn btn-ghost btn-sm',
                        draft.period === p && 'btn-active',
                      )}
                      onClick={() => commit({ ...draft, period: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm mt-3 btn-block"
              onClick={() => {
                commit(draft)
                setOpen(false)
              }}
            >
              Done
            </button>
          </div>
        ) : null}
      </div>
    </FieldShell>
  )
}
