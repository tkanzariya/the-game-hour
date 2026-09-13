import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FieldShell } from '@/components/booking'
import { cn } from '@/utils/cn'

export type SearchMultiSelectOption = {
  id: number
  label: string
  hint?: string
}

type SearchMultiSelectProps = {
  id?: string
  label: string
  options: SearchMultiSelectOption[]
  value: number[]
  onChange: (ids: number[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function SearchMultiSelect({
  id: idProp,
  label,
  options,
  value,
  onChange,
  placeholder = 'Search and select',
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing to choose yet.',
}: SearchMultiSelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const searchId = `${id}-search`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(() => {
    const byId = new Map(options.map((opt) => [opt.id, opt]))
    return value.flatMap((itemId) => {
      const opt = byId.get(itemId)
      return opt ? [opt] : []
    })
  }, [options, value])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((opt) => {
      const hay = `${opt.label} ${opt.hint ?? ''}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    searchRef.current?.focus()
  }, [open])

  const toggle = (itemId: number) => {
    onChange(value.includes(itemId) ? value.filter((id) => id !== itemId) : [...value, itemId])
  }

  const countLabel =
    selected.length === 0
      ? placeholder
      : `${selected.length} selected`

  return (
    <FieldShell id={id} label={label}>
      {selected.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((opt) => (
            <span key={opt.id} className="badge badge-outline gap-1 pr-1">
              {opt.label}
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                aria-label={`Remove ${opt.label}`}
                onClick={() => toggle(opt.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {options.length === 0 ? (
        <p className="label">{emptyMessage}</p>
      ) : (
        <div ref={rootRef} className="relative">
          <button
            type="button"
            id={id}
            className={cn(
              'input w-full cursor-pointer justify-between text-left',
              selected.length === 0 && 'text-base-content/50',
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            onClick={() => setOpen((current) => !current)}
          >
            <span>{countLabel}</span>
            <span aria-hidden className="text-primary/50">
              ▾
            </span>
          </button>

          {open ? (
            <div
              className="card card-border bg-base-100 absolute z-30 mt-2 w-full p-2 shadow-lg"
              role="dialog"
              aria-label={label}
            >
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                className="input input-sm w-full"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
              />
              <ul
                id={`${id}-list`}
                className="menu menu-sm mt-2 max-h-60 overflow-y-auto"
                role="listbox"
                aria-multiselectable="true"
              >
                {filtered.length === 0 ? (
                  <li className="menu-disabled">
                    <span>No matches</span>
                  </li>
                ) : (
                  filtered.map((opt) => {
                    const checked = value.includes(opt.id)
                    return (
                      <li key={opt.id} className={cn(checked && 'menu-active')}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={checked}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggle(opt.id)}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={checked}
                            readOnly
                            tabIndex={-1}
                          />
                          <span className="flex min-w-0 flex-col items-start">
                            <span>{opt.label}</span>
                            {opt.hint ? (
                              <span className="text-xs font-normal opacity-60">{opt.hint}</span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </FieldShell>
  )
}
