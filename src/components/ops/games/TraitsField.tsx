import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FieldShell } from '@/components/booking'
import Icon from '@/components/Icon/Icon'
import { MAX_GAME_TRAITS } from '@/lib/ops/gameOptions'
import { cn } from '@/utils/cn'

type TraitsFieldProps = {
  id?: string
  label?: string
  /** Built-in traits plus any custom ones already used on other games. */
  suggestions: string[]
  value: string[]
  onChange: (value: string[]) => void
}

const norm = (text: string) => text.trim().replace(/\s+/g, ' ')
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** Multi-select traits with search and the option to add a custom value. */
export function TraitsField({
  id: idProp,
  label = 'Traits',
  suggestions,
  value,
  onChange,
}: TraitsFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const listId = `${id}-list`
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atLimit = value.length >= MAX_GAME_TRAITS
  const typed = norm(query)

  const rows = useMemo(() => {
    const available = suggestions.filter((s) => !value.some((v) => same(v, s)))
    const matches = typed
      ? available.filter((s) => s.toLowerCase().includes(typed.toLowerCase()))
      : available
    const canCreate =
      typed.length > 0 &&
      !suggestions.some((s) => same(s, typed)) &&
      !value.some((v) => same(v, typed))
    return [
      ...matches.map((text) => ({ key: `s-${text}`, text, create: false })),
      ...(canCreate ? [{ key: 'create', text: typed, create: true }] : []),
    ]
  }, [suggestions, value, typed])

  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (open) listRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open, rows.length])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const add = (trait: string) => {
    const clean = norm(trait)
    if (!clean || atLimit || value.some((v) => same(v, clean))) return
    const existing = suggestions.find((s) => same(s, clean))
    onChange([...value, existing ?? clean])
    setQuery('')
    inputRef.current?.focus()
  }

  const current = Math.min(active, Math.max(rows.length - 1, 0))

  const remove = (trait: string) => onChange(value.filter((v) => v !== trait))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && rows[current]) add(rows[current].text)
      else if (typed) add(typed)
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation()
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'Backspace' && !query && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <FieldShell
      id={id}
      label={label}
      hint={
        atLimit
          ? `You can add up to ${MAX_GAME_TRAITS} traits.`
          : 'Pick from the list, or type your own and press Return.'
      }
    >
      <div ref={rootRef} className="relative">
        <div
          className={cn(
            'input h-auto min-h-11 w-full flex-wrap items-center gap-2 py-2',
            open && 'input-primary',
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((trait) => (
            <span
              key={trait}
              className="badge badge-primary badge-soft h-8 gap-1 pr-1 text-sm"
            >
              {trait}
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle size-6 min-h-0"
                aria-label={`Remove ${trait}`}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(trait)
                }}
              >
                <Icon name="x" size="sm" className="size-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open && rows.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && rows[current] ? `${id}-opt-${current}` : undefined
            }
            className="min-w-32 flex-1 bg-transparent outline-none"
            placeholder={
              value.length === 0 ? 'Choose or add traits' : atLimit ? '' : 'Add another'
            }
            value={query}
            disabled={atLimit}
            autoComplete="off"
            maxLength={40}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setActive(0)
            }}
            onFocus={() => {
              setOpen(true)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        {open && rows.length > 0 ? (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={`${label} suggestions`}
            className="menu menu-sm bg-base-100 border-base-300 rounded-box mt-1 max-h-56 w-full flex-nowrap overflow-y-auto border p-1 shadow-lg"
          >
            {rows.map((row, index) => (
              <li key={row.key} role="presentation">
                <button
                  type="button"
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={false}
                  className={cn(
                    'min-h-10',
                    index === current && 'bg-primary/10 text-primary',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => add(row.text)}
                >
                  {row.create ? (
                    <>
                      <Icon name="plus" size="sm" />
                      <span>
                        Add “<strong>{row.text}</strong>”
                      </span>
                    </>
                  ) : (
                    row.text
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </FieldShell>
  )
}
