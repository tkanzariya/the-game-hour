import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'
import { bookingControlClass } from './fieldStyles'

type FieldShellProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-heading text-sm font-semibold text-primary">
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="font-body text-sm text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="font-body text-xs text-accent-muted-grey">{hint}</p>
      ) : null}
    </div>
  )
}

type TextFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({
  id,
  label,
  required,
  error,
  hint,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint}>
      <input
        id={id}
        className={cn(
          bookingControlClass,
          error && 'border-error/60 focus:border-error focus:ring-error/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldShell>
  )
}

type TextAreaFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaField({
  id,
  label,
  required,
  error,
  className,
  ...rest
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <textarea
        id={id}
        rows={3}
        className={cn(
          bookingControlClass,
          'min-h-[5.5rem] resize-y',
          error && 'border-error/60 focus:border-error focus:ring-error/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldShell>
  )
}

type SelectFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  placeholder?: string
  options: { value: string; label: string }[]
} & SelectHTMLAttributes<HTMLSelectElement>

export function SelectField({
  id,
  label,
  required,
  error,
  placeholder = 'Choose…',
  options,
  className,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <select
        id={id}
        className={cn(
          bookingControlClass,
          'cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10',
          error && 'border-error/60 focus:border-error focus:ring-error/20',
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23032A5D'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
