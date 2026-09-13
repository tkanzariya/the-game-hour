import { useEffect, useId, useRef, useState } from 'react'
import { FieldShell } from './FormFields'
import { bookingControlClass } from './fieldStyles'
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
            bookingControlClass,
            'flex cursor-pointer items-center justify-between text-left',
            !value && 'text-accent-muted-grey/70',
            error && 'border-error/60',
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
            className="absolute z-30 mt-2 w-full rounded-2xl border border-primary/10 bg-white p-3 shadow-card"
          >
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="mb-1 font-heading text-xs font-semibold text-accent-muted-grey">
                  Hour
                </p>
                <div className="max-h-40 overflow-y-auto rounded-xl bg-surface-muted p-1">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={cn(
                        'block w-full rounded-lg px-2 py-1.5 text-left font-body text-sm',
                        draft.hour12 === h
                          ? 'bg-primary text-on-primary'
                          : 'text-primary hover:bg-white',
                      )}
                      onClick={() => commit({ ...draft, hour12: h })}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 font-heading text-xs font-semibold text-accent-muted-grey">
                  Min
                </p>
                <div className="max-h-40 overflow-y-auto rounded-xl bg-surface-muted p-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={cn(
                        'block w-full rounded-lg px-2 py-1.5 text-left font-body text-sm',
                        draft.minute === m
                          ? 'bg-primary text-on-primary'
                          : 'text-primary hover:bg-white',
                      )}
                      onClick={() => commit({ ...draft, minute: m })}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 font-heading text-xs font-semibold text-accent-muted-grey">
                  AM/PM
                </p>
                <div className="flex flex-col gap-1 rounded-xl bg-surface-muted p-1">
                  {(['AM', 'PM'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={cn(
                        'rounded-lg px-2 py-2 font-body text-sm font-semibold',
                        draft.period === p
                          ? 'bg-primary text-on-primary'
                          : 'text-primary hover:bg-white',
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
              className="mt-3 w-full rounded-xl bg-primary px-3 py-2 font-heading text-sm font-semibold text-on-primary"
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
