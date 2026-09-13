import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'

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
    <fieldset className={cn('fieldset w-full p-0', className)}>
      <legend className="fieldset-legend pt-0 font-heading text-sm font-semibold">
        <label htmlFor={id}>
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
      </legend>
      {children}
      {error ? (
        <p id={`${id}-error`} className="label text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="label">{hint}</p>
      ) : null}
    </fieldset>
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <input
        id={id}
        className={cn('input w-full', error && 'input-error')}
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <textarea
        id={id}
        rows={3}
        className={cn('textarea min-h-24 w-full', error && 'textarea-error')}
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
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <select
        id={id}
        className={cn('select w-full', error && 'select-error')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
