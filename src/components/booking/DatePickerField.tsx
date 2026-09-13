import { useEffect, useId, useRef, useState } from 'react'
import { FieldShell } from './FormFields'
import { formatDisplayDate } from '@/lib/booking/validation'
import { cn } from '@/utils/cn'

type DatePickerFieldProps = {
  id?: string
  label: string
  required?: boolean
  error?: string
  value: string
  onChange: (ymd: string) => void
  /** Earliest selectable date. Defaults to today. Pass `null` to allow any past date. */
  minDate?: string | null
  placeholder?: string
}

function todayYmd(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePickerField({
  id: idProp,
  label,
  required,
  error,
  value,
  onChange,
  minDate,
  placeholder,
}: DatePickerFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const min = minDate === null ? null : (minDate ?? todayYmd())
  const [open, setOpen] = useState(false)
  const selected = parseYmd(value) ?? new Date()
  const [view, setView] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  )
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = view.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

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
          onClick={() => setOpen((v) => !v)}
        >
          <span>
            {value
              ? formatDisplayDate(value)
              : (placeholder ?? (min ? formatDisplayDate(min) : 'Select date'))}
          </span>
          <span aria-hidden className="text-primary/50">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label="Choose date"
            className="card card-border bg-base-100 absolute z-30 mt-2 w-full min-w-0 p-3 shadow-lg sm:min-w-[17rem]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setView(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                ‹
              </button>
              <p className="font-heading text-sm font-bold">{monthLabel}</p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setView(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((d) => (
                <span
                  key={d}
                  className="py-1 font-body text-xs font-semibold text-accent-muted-grey"
                >
                  {d}
                </span>
              ))}
              {cells.map((day, idx) => {
                if (day === null) return <span key={`e-${idx}`} />
                const ymd = toYmd(new Date(year, month, day))
                const disabled = min !== null && ymd < min
                const selectedDay = value === ymd
                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      'btn btn-ghost btn-sm',
                      disabled && 'btn-disabled',
                      selectedDay && 'btn-active',
                    )}
                    onClick={() => {
                      onChange(ymd)
                      setOpen(false)
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  )
}
