import type { InventoryItem } from './types'

/** Why stock changed outside a purchase. The sign is decided by the reason, never typed. */
export const ADJUSTMENT_REASONS: { value: string; label: string; sign: 1 | -1 }[] = [
  { value: 'used', label: 'Used up', sign: -1 },
  { value: 'lost', label: 'Lost', sign: -1 },
  { value: 'damaged', label: 'Damaged', sign: -1 },
  { value: 'found', label: 'Found', sign: 1 },
  { value: 'recount_add', label: 'Recount: add', sign: 1 },
  { value: 'recount_remove', label: 'Recount: remove', sign: -1 },
]

export function reasonLabel(value: string): string {
  return ADJUSTMENT_REASONS.find((r) => r.value === value)?.label ?? value
}

/** Rupees, with paise only when there are some (₹45 or ₹45.50). */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function todayYmd(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export type PriceMode = 'each' | 'total'

const round2 = (n: number) => Math.round(n * 100) / 100

/** A whole number of 1 or more, or null. */
export function parseQuantity(value: string): number | null {
  const n = Number(value)
  return value.trim() !== '' && Number.isInteger(n) && n >= 1 ? n : null
}

/** A price of 0 or more, or null. */
export function parsePrice(value: string): number | null {
  const n = Number(value)
  return value.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null
}

/** What was paid in total, whichever way the price was typed. */
export function totalPaid(
  mode: PriceMode,
  price: string,
  quantity: string,
): number | null {
  const p = parsePrice(price)
  if (p === null) return null
  if (mode === 'total') return round2(p)
  const q = parseQuantity(quantity)
  return q === null ? null : round2(p * q)
}

/** Re-express a typed price in the other mode, so switching keeps the same money. */
export function switchPriceMode(
  from: PriceMode,
  to: PriceMode,
  price: string,
  quantity: string,
): string {
  if (from === to) return price
  const p = parsePrice(price)
  const q = parseQuantity(quantity)
  if (p === null || q === null) return price
  return String(round2(to === 'total' ? p * q : p / q))
}

export type StockFilter = 'all' | 'low' | 'out'

export function stockState(item: InventoryItem): 'out' | 'low' | 'ok' {
  if (item.out_of_stock) return 'out'
  return item.low_stock ? 'low' : 'ok'
}
