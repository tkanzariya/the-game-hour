import { FieldShell } from '@/components/booking'
import Icon from '@/components/Icon/Icon'
import { cn } from '@/utils/cn'

type ChoiceChipsProps = {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  required?: boolean
  error?: string
  hint?: string
}

/** Multi-choice toggles for short fixed lists (event type, age group, venue). */
export function ChoiceChips({
  id,
  label,
  options,
  value,
  onChange,
  required,
  error,
  hint,
}: ChoiceChipsProps) {
  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint}>
      <div id={id} role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = value.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option.value)}
              className={cn(
                'btn btn-sm h-10 gap-1.5 rounded-full px-4 font-medium',
                on ? 'btn-primary' : 'btn-outline border-base-300 text-base-content',
              )}
            >
              {on ? <Icon name="check" size="sm" /> : null}
              {option.label}
            </button>
          )
        })}
      </div>
    </FieldShell>
  )
}
