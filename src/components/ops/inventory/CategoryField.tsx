import { useState } from 'react'
import { FieldShell } from '@/components/booking'

type CategoryFieldProps = {
  id: string
  value: string
  /** Categories already used on other items. */
  categories: string[]
  error?: string
  onChange: (value: string) => void
}

const NEW = '__new__'

/** Pick a category you've used before, or add a new one. New ones appear in the list from then on. */
export function CategoryField({
  id,
  value,
  categories,
  error,
  onChange,
}: CategoryFieldProps) {
  const match = categories.find((c) => c.toLowerCase() === value.trim().toLowerCase())
  // Start in "new" mode when nothing exists yet, or when the saved value isn't in the list.
  const [creating, setCreating] = useState(
    categories.length === 0 || (value !== '' && !match),
  )

  const selectValue = creating ? NEW : (match ?? '')

  return (
    <FieldShell id={id} label="Category" error={error}>
      <div className="flex flex-col gap-2">
        {categories.length > 0 ? (
          <select
            id={id}
            className="select h-11 w-full"
            value={selectValue}
            onChange={(e) => {
              if (e.target.value === NEW) {
                setCreating(true)
                onChange('')
                return
              }
              setCreating(false)
              onChange(e.target.value)
            }}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value={NEW}>＋ Add a new category…</option>
          </select>
        ) : null}
        {creating ? (
          <input
            id={categories.length === 0 ? id : `${id}-new`}
            className="input h-11 w-full"
            aria-label="New category name"
            placeholder={categories.length === 0 ? 'Balls' : 'Name the new category'}
            maxLength={60}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : null}
        {categories.length === 0 ? (
          <p className="label whitespace-normal">
            Your first category. It will be in the list next time.
          </p>
        ) : null}
      </div>
    </FieldShell>
  )
}
