import { useMemo, useState } from 'react'
import { DatePickerField, TextAreaField, TextField } from '@/components/booking'
import { saveInventoryItem, saveInventoryPurchase } from '@/lib/ops/api'
import {
  parsePrice,
  parseQuantity,
  todayYmd,
  type PriceMode,
} from '@/lib/ops/inventory'
import { useOpsToast } from '@/lib/ops/toast'
import type {
  InventoryFieldErrors,
  InventoryItem,
  InventoryItemDetail,
  InventoryItemInput,
} from '@/lib/ops/types'
import { CategoryField } from './CategoryField'
import { FormSheet } from './FormSheet'
import { PriceField } from './PriceField'

type ItemFormSheetProps = {
  open: boolean
  /** null = add a new item. */
  item: InventoryItem | null
  /** Categories already in use, offered in the list. */
  categories: string[]
  csrf: string
  onClose: () => void
  onSaved: (item: InventoryItemDetail, isNew: boolean) => void
}

type FirstStock = {
  quantity: string
  price_mode: PriceMode
  price: string
  purchased_on: string
}

export function ItemFormSheet({
  open,
  item,
  categories,
  csrf,
  onClose,
  onSaved,
}: ItemFormSheetProps) {
  const { notify } = useOpsToast()
  const isNew = item === null

  const initial = useMemo<InventoryItemInput>(
    () => ({
      name: item?.name ?? '',
      category: item?.category ?? '',
      min_stock: item ? String(item.min_stock) : '',
      notes: item?.notes ?? '',
    }),
    [item],
  )
  const firstInitial: FirstStock = useMemo(
    () => ({ quantity: '', price_mode: 'each', price: '', purchased_on: todayYmd() }),
    [],
  )
  const [form, setForm] = useState<InventoryItemInput>(initial)
  const [first, setFirst] = useState<FirstStock>(firstInitial)
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<InventoryFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const dirty =
    JSON.stringify(form) !== JSON.stringify(initial) ||
    first.quantity !== '' ||
    first.price !== ''

  const clientErrors = useMemo(() => {
    const errors: InventoryFieldErrors = {}
    if (!form.name.trim()) errors.name = 'Enter the item name.'
    if (form.min_stock.trim()) {
      const n = Number(form.min_stock)
      if (!Number.isInteger(n) || n < 0) {
        errors.min_stock = 'Enter a whole number, or leave it empty.'
      }
    }
    if (isNew && (first.quantity.trim() || first.price.trim())) {
      if (parseQuantity(first.quantity) === null) {
        errors.first_quantity = 'Enter how many you have.'
      }
      if (parsePrice(first.price) === null) {
        errors.first_price =
          first.price_mode === 'total'
            ? 'Enter the total you paid, like 2550.'
            : 'Enter what one cost, like 45 or 45.50.'
      }
    }
    return errors
  }, [form, first, isNew])

  const errors: InventoryFieldErrors = attempted
    ? { ...clientErrors, ...serverErrors }
    : serverErrors

  const patch = (key: keyof InventoryItemInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setServerErrors((current) => {
      if (!current[key]) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  const submit = async () => {
    setAttempted(true)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return
    setSaving(true)
    // Reuse the spelling of an existing category so "balls" and "Balls" don't become two.
    const typed = form.category.trim()
    const category =
      categories.find((c) => c.toLowerCase() === typed.toLowerCase()) ?? typed
    const result = await saveInventoryItem(
      item?.id ?? null,
      { ...form, category },
      csrf,
    )
    if (!result.ok) {
      setSaving(false)
      setServerErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    let saved = result.item
    if (isNew && first.quantity.trim()) {
      const purchase = await saveInventoryPurchase(
        saved.id,
        null,
        {
          purchased_on: first.purchased_on,
          quantity: first.quantity,
          price_mode: first.price_mode,
          price: first.price,
          vendor: '',
          notes: '',
          invoice: null,
          remove_invoice: false,
        },
        csrf,
      )
      if (purchase.ok) saved = purchase.item
      else {
        notify(
          'The item was added, but its first purchase was not saved. Add it from the item page.',
          'error',
        )
      }
    }
    setSaving(false)
    notify(isNew ? 'Item added' : 'Item updated')
    onSaved(saved, isNew)
  }

  return (
    <FormSheet
      open={open}
      title={isNew ? 'New Item' : 'Edit Item'}
      submitLabel={isNew ? 'Add Item' : 'Save'}
      saving={saving}
      dirty={dirty}
      error={formError}
      onClose={onClose}
      onSubmit={submit}
    >
      <TextField
        id="inv-name"
        label="Item Name"
        required
        autoComplete="off"
        maxLength={120}
        placeholder="Rubber ball"
        value={form.name}
        error={errors.name}
        onChange={(e) => patch('name', e.target.value)}
      />

      <CategoryField
        id="inv-category"
        value={form.category}
        categories={categories}
        error={errors.category}
        onChange={(value) => patch('category', value)}
      />

      <TextField
        id="inv-min"
        label="Warn Me When Stock Is This Low"
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        placeholder="0"
        hint="You’ll see a Low stock flag at or below this number. Leave it empty to turn the warning off."
        value={form.min_stock}
        error={errors.min_stock}
        className="sm:max-w-xs"
        onChange={(e) => patch('min_stock', e.target.value)}
      />

      <TextAreaField
        id="inv-notes"
        label="Notes"
        rows={2}
        maxLength={500}
        placeholder="Where it’s kept, size, colour…"
        value={form.notes}
        error={errors.notes}
        onChange={(e) => patch('notes', e.target.value)}
      />

      {isNew ? (
        <fieldset className="border-base-300 rounded-box flex flex-col gap-5 border p-4">
          <legend className="font-heading px-2 text-sm font-semibold">
            Stock you have now (optional)
          </legend>
          <p className="text-base-content/70 -mt-2 text-sm">
            Add what you already own, or skip this and record each purchase later.
          </p>
          <TextField
            id="inv-first-qty"
            label="How Many"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="50"
            value={first.quantity}
            error={errors.first_quantity}
            className="sm:max-w-xs"
            onChange={(e) => setFirst((c) => ({ ...c, quantity: e.target.value }))}
          />
          <PriceField
            id="inv-first-price"
            quantity={first.quantity}
            mode={first.price_mode}
            price={first.price}
            error={errors.first_price}
            onChange={(price_mode, price) =>
              setFirst((c) => ({ ...c, price_mode, price }))
            }
          />
          <DatePickerField
            id="inv-first-date"
            label="Bought On"
            minDate={null}
            value={first.purchased_on}
            onChange={(ymd) => setFirst((c) => ({ ...c, purchased_on: ymd }))}
          />
        </fieldset>
      ) : null}
    </FormSheet>
  )
}
