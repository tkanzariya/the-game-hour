import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { AdjustmentFormSheet } from '@/components/ops/inventory/AdjustmentFormSheet'
import { ConfirmDialog } from '@/components/ops/inventory/ConfirmDialog'
import { ItemFormSheet } from '@/components/ops/inventory/ItemFormSheet'
import { PurchaseFormSheet } from '@/components/ops/inventory/PurchaseFormSheet'
import { StockBadge } from '@/components/ops/inventory/StockBadge'
import { ROUTES } from '@/constants/routes'
import {
  deleteInventoryAdjustment,
  deleteInventoryItem,
  deleteInventoryPurchase,
  inventoryInvoiceUrl,
  loadInventory,
  loadInventoryItem,
} from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import { formatEventDate } from '@/lib/ops/format'
import { formatPrice, formatQuantity, reasonLabel } from '@/lib/ops/inventory'
import { useOpsToast } from '@/lib/ops/toast'
import type { InventoryItemDetail, InventoryPurchase } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

type Confirm =
  | { kind: 'item' }
  | { kind: 'purchase'; id: number; label: string }
  | { kind: 'adjustment'; id: number; label: string }

export default function OpsInventoryItemPage() {
  const { id: idParam = '' } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const { csrf } = useOpsAuth()
  const { notify } = useOpsToast()

  const [item, setItem] = useState<InventoryItemDetail | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(0)
  const [purchaseSheet, setPurchaseSheet] = useState(0)
  const [editingPurchase, setEditingPurchase] = useState<InventoryPurchase | null>(null)
  const [adjustSheet, setAdjustSheet] = useState(0)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [confirmKey, setConfirmKey] = useState(0)

  const apply = useCallback((result: Awaited<ReturnType<typeof loadInventoryItem>>) => {
    if (result.ok) {
      setItem(result.item)
      setError(null)
    } else {
      setError(result.error)
    }
  }, [])

  useEffect(() => {
    void loadInventoryItem(id).then(apply)
    void loadInventory().then((result) => {
      if (result.ok) {
        setCategories(
          Array.from(
            new Set(
              result.items
                .map((i) => i.category)
                .filter((c): c is string => Boolean(c)),
            ),
          ),
        )
      }
    })
  }, [id, apply])

  if (error && !item) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <div role="alert" className="alert alert-error">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            className="btn btn-sm h-10"
            onClick={() => void loadInventoryItem(id).then(apply)}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex justify-center py-16" role="status">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    )
  }

  const ask = (next: Confirm) => {
    setConfirm(next)
    setConfirmKey((n) => n + 1)
  }

  const runConfirm = async (): Promise<string | null> => {
    if (!confirm) return null
    if (confirm.kind === 'item') {
      const result = await deleteInventoryItem(item.id, csrf)
      if (!result.ok) return result.error
      notify('Item deleted')
      navigate(ROUTES.opsInventory)
      return null
    }
    const result =
      confirm.kind === 'purchase'
        ? await deleteInventoryPurchase(confirm.id, csrf)
        : await deleteInventoryAdjustment(confirm.id, csrf)
    if (!result.ok) return result.error
    setItem(result.item)
    setConfirm(null)
    notify(confirm.kind === 'purchase' ? 'Purchase deleted' : 'Entry deleted')
    return null
  }

  const confirmCopy =
    confirm?.kind === 'item'
      ? {
          title: `Delete “${item.name}”?`,
          body: 'This removes the item with all its purchases, invoices and stock changes. You can’t undo this.',
          label: 'Delete Item',
        }
      : confirm?.kind === 'purchase'
        ? {
            title: 'Delete this purchase?',
            body: `${confirm.label}. Stock goes down by that amount and the invoice file is removed. You can’t undo this.`,
            label: 'Delete Purchase',
          }
        : {
            title: 'Delete this entry?',
            body: `${confirm?.kind === 'adjustment' ? confirm.label : ''}. Stock goes back to what it was before. You can’t undo this.`,
            label: 'Delete Entry',
          }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <BackLink />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold">{item.name}</h1>
            <StockBadge item={item} />
          </div>
          <p className="text-base-content/70 text-sm">
            {[
              item.category,
              item.min_stock > 0 ? `Warn at ${item.min_stock} or fewer` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {item.notes ? (
            <p className="text-base-content/70 max-w-xl text-sm">{item.notes}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary h-11 gap-2"
            onClick={() => {
              setEditingPurchase(null)
              setPurchaseSheet((n) => n + 1)
            }}
          >
            <Icon name="plus" size="sm" />
            Add Purchase
          </button>
          <button
            type="button"
            className="btn h-11"
            onClick={() => setAdjustSheet((n) => n + 1)}
          >
            Change Stock
          </button>
          <button
            type="button"
            className="btn h-11 gap-2"
            onClick={() => setEditOpen((n) => n + 1)}
          >
            <Icon name="pencil" size="sm" />
            Edit
          </button>
          <button
            type="button"
            className="btn btn-error btn-outline h-11 gap-2"
            onClick={() => ask({ kind: 'item' })}
          >
            <Icon name="trash" size="sm" />
            Delete
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="In stock"
          value={formatQuantity(item.stock)}
          hint={`${formatQuantity(item.total_purchased)} bought in total`}
        />
        <Stat
          label="Average cost"
          value={item.purchase_count > 0 ? formatPrice(item.avg_cost) : '—'}
          hint="Per unit, across purchases"
        />
        <Stat
          label="Stock value"
          value={item.purchase_count > 0 ? formatPrice(Math.round(item.value)) : '—'}
          hint="In stock × average cost"
        />
        <Stat
          label="Total spent"
          value={
            item.purchase_count > 0 ? formatPrice(Math.round(item.total_spent)) : '—'
          }
          hint={`${item.purchase_count} ${item.purchase_count === 1 ? 'purchase' : 'purchases'}`}
        />
      </dl>

      <section
        className="card card-border bg-base-100"
        aria-labelledby="purchases-heading"
      >
        <div className="card-body gap-3 p-4 sm:p-6">
          <h2 id="purchases-heading" className="font-heading text-lg font-semibold">
            Purchases
          </h2>
          {item.purchases.length === 0 ? (
            <p className="text-base-content/70 text-sm">
              Nothing recorded yet. Use Add Purchase to log what you bought.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Each</th>
                      <th className="text-right">Total</th>
                      <th>Bought From</th>
                      <th>Invoice</th>
                      <th className="w-28">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap">
                          {formatEventDate(p.purchased_on)}
                        </td>
                        <td className="text-right">{formatQuantity(p.quantity)}</td>
                        <td className="text-right whitespace-nowrap">
                          {formatPrice(p.unit_price)}
                        </td>
                        <td className="text-right font-medium whitespace-nowrap">
                          {formatPrice(p.total)}
                        </td>
                        <td>
                          {p.vendor ?? '—'}
                          {p.notes ? (
                            <span
                              className="text-base-content/60 block max-w-48 truncate text-xs"
                              title={p.notes}
                            >
                              {p.notes}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <InvoiceLinks purchase={p} />
                        </td>
                        <td>
                          <PurchaseActions
                            purchase={p}
                            onEdit={() => {
                              setEditingPurchase(p)
                              setPurchaseSheet((n) => n + 1)
                            }}
                            onDelete={() =>
                              ask({
                                kind: 'purchase',
                                id: p.id,
                                label: `${formatQuantity(p.quantity)} bought on ${formatEventDate(p.purchased_on)}`,
                              })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-base-200 divide-y md:hidden">
                {item.purchases.map((p) => (
                  <li key={p.id} className="flex flex-col gap-2 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {formatQuantity(p.quantity)} × {formatPrice(p.unit_price)}
                          <span className="text-base-content/60 font-normal">
                            {' '}
                            = {formatPrice(p.total)}
                          </span>
                        </p>
                        <p className="text-base-content/70 text-sm">
                          {formatEventDate(p.purchased_on)}
                          {p.vendor ? ` · ${p.vendor}` : ''}
                        </p>
                        {p.notes ? (
                          <p className="text-base-content/60 text-sm">{p.notes}</p>
                        ) : null}
                      </div>
                      <PurchaseActions
                        purchase={p}
                        onEdit={() => {
                          setEditingPurchase(p)
                          setPurchaseSheet((n) => n + 1)
                        }}
                        onDelete={() =>
                          ask({
                            kind: 'purchase',
                            id: p.id,
                            label: `${formatQuantity(p.quantity)} bought on ${formatEventDate(p.purchased_on)}`,
                          })
                        }
                      />
                    </div>
                    <InvoiceLinks purchase={p} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section
        className="card card-border bg-base-100"
        aria-labelledby="changes-heading"
      >
        <div className="card-body gap-3 p-4 sm:p-6">
          <h2 id="changes-heading" className="font-heading text-lg font-semibold">
            Stock changes
          </h2>
          {item.adjustments.length === 0 ? (
            <p className="text-base-content/70 text-sm">
              Lost, damaged or used-up items appear here. Use Change Stock to record
              one.
            </p>
          ) : (
            <ul className="divide-base-200 divide-y">
              {item.adjustments.map((a) => (
                <li
                  key={a.id}
                  className="flex min-h-14 items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      <span
                        className={cn(
                          'tabular-nums',
                          a.delta < 0 ? 'text-error' : 'text-success',
                        )}
                      >
                        {a.delta > 0 ? '+' : '−'}
                        {formatQuantity(Math.abs(a.delta))}
                      </span>{' '}
                      {reasonLabel(a.reason)}
                    </p>
                    <p className="text-base-content/60 text-sm">
                      {formatEventDate(a.adjusted_on)}
                      {a.notes ? ` · ${a.notes}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-square text-error size-11 min-h-0"
                    aria-label={`Delete ${reasonLabel(a.reason)} entry from ${formatEventDate(a.adjusted_on)}`}
                    onClick={() =>
                      ask({
                        kind: 'adjustment',
                        id: a.id,
                        label: `${a.delta > 0 ? '+' : '−'}${Math.abs(a.delta)} ${reasonLabel(a.reason)} on ${formatEventDate(a.adjusted_on)}`,
                      })
                    }
                  >
                    <Icon name="trash" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ItemFormSheet
        key={`edit-${editOpen}`}
        open={editOpen > 0}
        item={item}
        categories={categories}
        csrf={csrf}
        onClose={() => setEditOpen(0)}
        onSaved={(saved) => {
          setItem(saved)
          setEditOpen(0)
        }}
      />
      <PurchaseFormSheet
        key={`purchase-${purchaseSheet}`}
        open={purchaseSheet > 0}
        item={item}
        purchase={editingPurchase}
        csrf={csrf}
        onClose={() => setPurchaseSheet(0)}
        onSaved={(saved) => {
          setItem(saved)
          setPurchaseSheet(0)
        }}
      />
      <AdjustmentFormSheet
        key={`adjust-${adjustSheet}`}
        open={adjustSheet > 0}
        item={item}
        csrf={csrf}
        onClose={() => setAdjustSheet(0)}
        onSaved={(saved) => {
          setItem(saved)
          setAdjustSheet(0)
        }}
      />
      <ConfirmDialog
        key={`confirm-${confirmKey}`}
        open={confirm !== null}
        title={confirmCopy.title}
        body={confirmCopy.body}
        confirmLabel={confirmCopy.label}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

function PurchaseActions({
  purchase,
  onEdit,
  onDelete,
}: {
  purchase: InventoryPurchase
  onEdit: () => void
  onDelete: () => void
}) {
  const label = `${purchase.quantity} bought on ${formatEventDate(purchase.purchased_on)}`
  return (
    <div className="flex shrink-0 justify-end">
      <button
        type="button"
        className="btn btn-ghost btn-square size-11 min-h-0"
        aria-label={`Edit purchase: ${label}`}
        onClick={onEdit}
      >
        <Icon name="pencil" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-square text-error size-11 min-h-0"
        aria-label={`Delete purchase: ${label}`}
        onClick={onDelete}
      >
        <Icon name="trash" />
      </button>
    </div>
  )
}

function InvoiceLinks({ purchase }: { purchase: InventoryPurchase }) {
  if (!purchase.has_invoice)
    return <span className="text-base-content/50 text-sm">No invoice</span>
  return (
    <span className="flex flex-wrap items-center gap-x-4">
      <a
        href={inventoryInvoiceUrl(purchase.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline"
      >
        <Icon name="external-link" size="sm" />
        Open invoice
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <a
        href={inventoryInvoiceUrl(purchase.id, true)}
        className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline"
      >
        <Icon name="download" size="sm" />
        Download
      </a>
    </span>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card card-border bg-base-100 px-4 py-3">
      <dt className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="font-heading mt-1 text-2xl font-semibold">{value}</dd>
      {hint ? <p className="text-base-content/60 text-xs">{hint}</p> : null}
    </div>
  )
}

function BackLink() {
  return (
    <Link to={ROUTES.opsInventory} className="btn btn-ghost -ml-3 h-11 w-fit gap-2">
      <Icon name="arrow-left" size="sm" />
      Inventory
    </Link>
  )
}
