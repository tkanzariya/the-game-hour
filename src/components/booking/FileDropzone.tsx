import { useId, useRef, useState } from 'react'
import { FieldShell } from './FormFields'
import { cn } from '@/utils/cn'

type FileDropzoneProps = {
  id?: string
  label?: string
  required?: boolean
  error?: string
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
}

export function FileDropzone({
  id: idProp,
  label = 'Payment screenshot',
  required,
  error,
  file,
  onChange,
  accept = 'image/jpeg,image/png,image/webp',
}: FileDropzoneProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pick = (list: FileList | null) => {
    const next = list?.[0] ?? null
    onChange(next)
  }

  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-brand',
          dragging
            ? 'border-secondary bg-accent-soft'
            : 'border-primary/25 bg-surface-muted/60',
          error && 'border-error/60',
          file && !error && 'border-success/40 bg-white',
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => pick(e.target.files)}
        />
        {file ? (
          <>
            <p className="font-heading text-sm font-semibold text-primary">
              {file.name}
            </p>
            <p className="mt-1 font-body text-xs text-accent-muted-grey">
              {(file.size / 1024).toFixed(0)} KB · Click to replace
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-sm font-semibold text-accent-muted-grey">
              Attach Payment Screenshot
            </p>
            <p className="mt-1 font-body text-xs text-accent-muted-grey">
              JPG, PNG, or WEBP · drag & drop or click
            </p>
          </>
        )}
      </div>
      {file ? (
        <button
          type="button"
          className="mt-2 self-start font-body text-sm font-semibold text-error underline-offset-2 hover:underline"
          onClick={() => {
            onChange(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          Remove file
        </button>
      ) : null}
    </FieldShell>
  )
}
