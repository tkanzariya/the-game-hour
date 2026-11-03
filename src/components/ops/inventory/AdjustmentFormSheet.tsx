import { useMemo, useState } from 'react'
import {
  DatePickerField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/booking'
import { saveInventoryAdjustment } from '@/lib/ops/api'
import { ADJUSTMENT_REASONS, formatQuantity, todayYmd } from '@/lib/ops/inventory'
import { useOpsToast } from '@/lib/ops/toast'
import type {
  InventoryAdjustmentInput,
  InventoryFieldErrors,
  InventoryItemDetail,
} from '@/lib/ops/types'
import { FormSheet } from './FormSheet'

type AdjustmentFormSheetProps = {
  open: boolean
  item: InventoryItemDetail | null
  csrf: string
  onClose: () => void
  onSaved: (item: InventoryItemDetail) => void
}

export function AdjustmentFormSheet({
  open,
  item,
  csrf,
  onClose,
  onSaved,
}: AdjustmentFormSheetProps) {
  const { notify } = useOpsToast()
  const initial = useMemo<InventoryAdjustmentInput>(
    () => ({ adjusted_on: todayYmd(), reason: '', quantity: '', notes: '' }),
    [],
  )
  const [form, setForm] = useState<InventoryAdjustmentInput>(initial)
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<InventoryFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sign = ADJUSTMENT_REASONS.find((r) => r.value === form.reason)?.sign ?? 0
  const qty = Number(form.quantity)
  const validQty = form.quantity.trim() !== '' && Number.isInteger(qty) && qty >= 1
  const stockAfter = item && sign !== 0 && validQty ? item.stock + sign * qty : null

  const clientErrors = useMemo(() => {
    const errors: InventoryFieldErrors = {}
    if (!form.adjusted_on) errors.adjusted_on = 'Choose a date.'
    if (!form.reason) errors.reason = 'Choose a reason.'
    if (!validQty) errors.quantity = 'Enter a whole number of 1 or more.'
    else if (item && sign < 0 && qty > item.stock) {
      errors.quantity = `Only ${formatQuantity(item.stock)} in stock, so you can’t remove ${qty}.`
    }
    return errors
  }, [form, validQty, qty, sign, item])

  const errors: InventoryFieldErrors = attempted
    ? { ...clientErrors, ...serverErrors }
    : serverErrors

  const patch = (key: keyof InventoryAdjustmentInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setServerErrors((current) => {
      if (!current[key]) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  const submit = async () => {
    if (!item) return
    setAttempted(true)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return
    setSaving(true)
    const result = await saveInventoryAdjustment(item.id, form, csrf)
    setSaving(false)
    if (!result.ok) {
      setServerErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    notify('Stock updated')
    onSaved(result.item)
  }

  return (
    <FormSheet
      open={open}
      title="Change Stock"
      submitLabel="Save"
      saving={saving}
      dirty={JSON.stringify(form) !== JSON.stringify(initial)}
      error={formError}
      onClose={onClose}
      onSubmit={submit}
    >
      {item ? (
        <p className="text-base-content/70 -mt-1 text-sm">
          <span className="text-base-content font-semibold">{item.name}</span> ·{' '}
          {formatQuantity(item.stock)} in stock
        </p>
      ) : null}

      <SelectField
        id="adj-reason"
        label="What Happened"
        required
        placeholder="Choose a reason"
        options={ADJUSTMENT_REASONS.map((r) => ({ value: r.value, label: r.label }))}
        value={form.reason}
        error={errors.reason}
        onChange={(e) => patch('reason', e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="adj-qty"
          label="How Many"
          required
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={form.quantity}
          error={errors.quantity}
          onChange={(e) => patch('quantity', e.target.value)}
        />
        <DatePickerField
          id="adj-date"
          label="Date"
          required
          minDate={null}
          value={form.adjusted_on}
          error={errors.adjusted_on}
          onChange={(ymd) => patch('adjusted_on', ymd)}
        />
      </div>

      {stockAfter !== null && item ? (
        <p className="bg-base-200 rounded-box px-4 py-3 text-sm" aria-live="polite">
          Stock after this: <strong>{formatQuantity(stockAfter)}</strong>
        </p>
      ) : null}

      <TextAreaField
        id="adj-notes"
        label="Notes"
        rows={2}
        maxLength={500}
        placeholder="What happened, which event…"
        value={form.notes}
        error={errors.notes}
        onChange={(e) => patch('notes', e.target.value)}
      />
    </FormSheet>
  )
}
