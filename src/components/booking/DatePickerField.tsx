import { useEffect, useId, useRef, useState } from 'react'
import { FieldShell } from './FormFields'
import { bookingControlClass } from './fieldStyles'
import { formatDisplayDate } from '@/lib/booking/validation'
import { cn } from '@/utils/cn'

type DatePickerFieldProps = {
  id?: string
  label: string
  required?: boolean
  error?: string
  value: string
  onChange: (ymd: string) => void
  minDate?: string
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
}: DatePickerFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const min = minDate ?? todayYmd()
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
            bookingControlClass,
            'flex cursor-pointer items-center justify-between text-left',
            !value && 'text-accent-muted-grey/70',
            error && 'border-error/60',
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{value ? formatDisplayDate(value) : formatDisplayDate(min)}</span>
          <span aria-hidden className="text-primary/50">
            ▾
          </span>
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label="Choose date"
            className="absolute z-30 mt-2 w-full min-w-[17rem] rounded-2xl border border-primary/10 bg-white p-3 shadow-card"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-lg px-2 py-1 font-heading text-sm font-semibold text-primary hover:bg-surface-muted"
                onClick={() => setView(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                ‹
              </button>
              <p className="font-heading text-sm font-bold text-primary">
                {monthLabel}
              </p>
              <button
                type="button"
                className="rounded-lg px-2 py-1 font-heading text-sm font-semibold text-primary hover:bg-surface-muted"
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
                const disabled = ymd < min
                const selectedDay = value === ymd
                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      'rounded-lg py-1.5 font-body text-sm transition-brand',
                      disabled && 'cursor-not-allowed text-on-disabled opacity-40',
                      !disabled && 'hover:bg-accent-soft text-primary',
                      selectedDay && 'bg-primary text-on-primary hover:bg-primary-700',
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
