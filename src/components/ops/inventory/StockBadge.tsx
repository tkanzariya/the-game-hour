import { stockState } from '@/lib/ops/inventory'
import type { InventoryItem } from '@/lib/ops/types'

/** Says it in words as well as colour. Shows nothing when stock is fine. */
export function StockBadge({ item }: { item: InventoryItem }) {
  const state = stockState(item)
  if (state === 'ok')
    return <span className="text-base-content/50 text-sm">In stock</span>
  return state === 'out' ? (
    <span className="badge badge-soft badge-error whitespace-nowrap">Out of stock</span>
  ) : (
    <span className="badge badge-soft badge-warning whitespace-nowrap">Low stock</span>
  )
}
