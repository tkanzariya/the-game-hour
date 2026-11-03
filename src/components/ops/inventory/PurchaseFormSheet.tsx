import { useMemo, useState } from 'react'
import {
  DatePickerField,
  FileDropzone,
  TextAreaField,
  TextField,
} from '@/components/booking'
import { inventoryInvoiceUrl, saveInventoryPurchase } from '@/lib/ops/api'
import { parsePrice, parseQuantity, todayYmd } from '@/lib/ops/inventory'
import { useOpsToast } from '@/lib/ops/toast'
import type {
  InventoryFieldErrors,
  InventoryItemDetail,
  InventoryPurchase,
  InventoryPurchaseInput,
} from '@/lib/ops/types'
import { FormSheet } from './FormSheet'
import { PriceField } from './PriceField'

type PurchaseFormSheetProps = {
  open: boolean
  item: { id: number; name: string } | null
  /** null = record a new purchase. */
  purchase: InventoryPurchase | null
  csrf: string
  onClose: () => void
  onSaved: (item: InventoryItemDetail) => void
}

const MAX_INVOICE_BYTES = 10 * 1024 * 1024

export function PurchaseFormSheet({
  open,
  item,
  purchase,
  csrf,
  onClose,
  onSaved,
}: PurchaseFormSheetProps) {
  const { notify } = useOpsToast()
  const isNew = purchase === null

  const initial = useMemo<InventoryPurchaseInput>(
    () => ({
      purchased_on: purchase?.purchased_on ?? todayYmd(),
      quantity: purchase ? String(purchase.quantity) : '',
      // The total is what was really paid, so an existing purchase opens in "Total paid".
      price_mode: purchase ? 'total' : 'each',
      price: purchase ? String(purchase.total) : '',
      vendor: purchase?.vendor ?? '',
      notes: purchase?.notes ?? '',
      invoice: null,
      remove_invoice: false,
    }),
    [purchase],
  )
  const [form, setForm] = useState<InventoryPurchaseInput>(initial)
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<InventoryFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const dirty =
    JSON.stringify({ ...form, invoice: form.invoice?.name }) !==
    JSON.stringify({ ...initial, invoice: undefined })

  const clientErrors = useMemo(() => {
    const errors: InventoryFieldErrors = {}
    if (!form.purchased_on) errors.purchased_on = 'Choose the date you bought it.'
    if (parseQuantity(form.quantity) === null) {
      errors.quantity = 'Enter a whole number of 1 or more.'
    }
    if (parsePrice(form.price) === null) {
      errors.price =
        form.price_mode === 'total'
          ? 'Enter the total you paid, like 2550.'
          : 'Enter the price of one, like 45 or 45.50.'
    }
    if (form.invoice && form.invoice.size > MAX_INVOICE_BYTES) {
      errors.invoice = 'That file is too large. The limit is 10 MB.'
    }
    return errors
  }, [form])

  const errors: InventoryFieldErrors = attempted
    ? { ...clientErrors, ...serverErrors }
    : serverErrors

  const patch = <K extends keyof InventoryPurchaseInput>(
    key: K,
    value: InventoryPurchaseInput[K],
  ) => {
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
    const result = await saveInventoryPurchase(
      item.id,
      purchase?.id ?? null,
      form,
      csrf,
    )
    setSaving(false)
    if (!result.ok) {
      setServerErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    notify(isNew ? 'Purchase added' : 'Purchase updated')
    onSaved(result.item)
  }

  const hasSavedInvoice =
    Boolean(purchase?.has_invoice) && !form.remove_invoice && !form.invoice

  return (
    <FormSheet
      open={open}
      title={isNew ? 'New Purchase' : 'Edit Purchase'}
      submitLabel={isNew ? 'Add Purchase' : 'Save'}
      saving={saving}
      dirty={dirty}
      error={formError}
      onClose={onClose}
      onSubmit={submit}
    >
      {item ? (
        <p className="text-base-content/70 -mt-1 text-sm">
          For <span className="text-base-content font-semibold">{item.name}</span>
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <DatePickerField
          id="pur-date"
          label="Bought On"
          required
          minDate={null}
          value={form.purchased_on}
          error={errors.purchased_on}
          onChange={(ymd) => patch('purchased_on', ymd)}
        />
        <TextField
          id="pur-qty"
          label="How Many"
          required
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="50"
          value={form.quantity}
          error={errors.quantity}
          onChange={(e) => patch('quantity', e.target.value)}
        />
      </div>

      <PriceField
        id="pur-price"
        quantity={form.quantity}
        mode={form.price_mode}
        price={form.price}
        error={errors.price}
        onChange={(price_mode, price) => setForm((c) => ({ ...c, price_mode, price }))}
      />

      <TextField
        id="pur-vendor"
        label="Bought From"
        autoComplete="off"
        maxLength={120}
        placeholder="Shop or seller"
        value={form.vendor}
        error={errors.vendor}
        onChange={(e) => patch('vendor', e.target.value)}
      />

      {hasSavedInvoice && purchase ? (
        <div className="border-base-300 rounded-box flex flex-wrap items-center justify-between gap-3 border p-3">
          <div className="min-w-0">
            <p className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
              Invoice
            </p>
            <p className="truncate font-medium">{purchase.invoice_name ?? 'Invoice'}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={inventoryInvoiceUrl(purchase.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm h-10"
            >
              Open
            </a>
            <button
              type="button"
              className="btn btn-sm btn-ghost text-error h-10"
              onClick={() => patch('remove_invoice', true)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <FileDropzone
          id="pur-invoice"
          label="Invoice (optional)"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          hint="PDF, JPG, PNG or WEBP, up to 10 MB. Tap Choose file or drop it here."
          file={form.invoice}
          error={errors.invoice}
          onChange={(file) => patch('invoice', file)}
        />
      )}
      {purchase?.has_invoice && form.remove_invoice && !form.invoice ? (
        <p className="text-base-content/70 -mt-3 text-sm">
          The saved invoice will be removed when you save.{' '}
          <button
            type="button"
            className="link link-primary"
            onClick={() => patch('remove_invoice', false)}
          >
            Undo
          </button>
        </p>
      ) : null}

      <TextAreaField
        id="pur-notes"
        label="Notes"
        rows={2}
        maxLength={500}
        value={form.notes}
        error={errors.notes}
        onChange={(e) => patch('notes', e.target.value)}
      />
    </FormSheet>
  )
}
