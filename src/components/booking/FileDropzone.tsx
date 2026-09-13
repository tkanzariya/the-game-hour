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
    onChange(list?.[0] ?? null)
  }

  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div
        className={cn(
          'rounded-box min-w-0 overflow-hidden border-2 border-dashed p-4',
          dragging ? 'border-secondary bg-base-200' : 'border-base-300 bg-base-200/50',
          error && 'border-error',
          file && !error && 'border-success',
        )}
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
        <button
          type="button"
          className="btn btn-block"
          onClick={() => inputRef.current?.click()}
        >
          {file ? 'Replace file' : 'Choose file'}
        </button>
        <p className="mt-2 text-sm leading-snug break-words text-base-content/70">
          {file
            ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
            : 'JPG, PNG, or WEBP. Tap Choose file or drop an image here.'}
        </p>
      </div>
      {file ? (
        <button
          type="button"
          className="btn btn-ghost btn-xs mt-2 self-start text-error"
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
