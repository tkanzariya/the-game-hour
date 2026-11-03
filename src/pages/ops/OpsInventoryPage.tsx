import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '@/components/Icon/Icon'
import { ItemFormSheet } from '@/components/ops/inventory/ItemFormSheet'
import { PurchaseFormSheet } from '@/components/ops/inventory/PurchaseFormSheet'
import { StockBadge } from '@/components/ops/inventory/StockBadge'
import { ROUTES } from '@/constants/routes'
import { loadInventory } from '@/lib/ops/api'
import { useOpsAuth } from '@/lib/ops/auth'
import { formatEventDate } from '@/lib/ops/format'
import { formatPrice, formatQuantity, type StockFilter } from '@/lib/ops/inventory'
import type { InventoryItem, InventoryTotals } from '@/lib/ops/types'
import { cn } from '@/utils/cn'

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

export default function OpsInventoryPage() {
  const { csrf } = useOpsAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [totals, setTotals] = useState<InventoryTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemSheet, setItemSheet] = useState(0)
  const [purchaseFor, setPurchaseFor] = useState<InventoryItem | null>(null)
  const [purchaseSheet, setPurchaseSheet] = useState(0)

  const rawFilter = params.get('stock')
  const filter: StockFilter = FILTERS.some((f) => f.value === rawFilter)
    ? (rawFilter as StockFilter)
    : 'all'
  const category = params.get('category') ?? ''
  const q = params.get('q') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value && value !== 'all') next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const apply = useCallback((result: Awaited<ReturnType<typeof loadInventory>>) => {
    if (result.ok) {
      setItems(result.items)
      setTotals(result.totals)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  const reload = useCallback(() => void loadInventory().then(apply), [apply])

  useEffect(() => {
    void loadInventory().then(apply)
  }, [apply])

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c))),
      ).sort((a, b) => a.localeCompare(b)),
    [items],
  )

  const counts = useMemo(
    () => ({
      all: items.length,
      low: items.filter((i) => i.low_stock).length,
      out: items.filter((i) => i.out_of_stock).length,
    }),
    [items],
  )

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'low' && !item.low_stock) return false
      if (filter === 'out' && !item.out_of_stock) return false
      if (category && item.category !== category) return false
      if (
        needle &&
        !`${item.name} ${item.category ?? ''}`.toLowerCase().includes(needle)
      ) {
        return false
      }
      return true
    })
  }, [items, filter, category, q])

  const hasFilters = filter !== 'all' || category !== '' || q !== ''
  const openItem = (item: InventoryItem) =>
    navigate(`${ROUTES.opsInventory}/${item.id}`)
  const startPurchase = (item: InventoryItem) => {
    setPurchaseFor(item)
    setPurchaseSheet((n) => n + 1)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Inventory</h1>
          <p className="text-base-content/70 text-sm" aria-live="polite">
            {loading
              ? 'Kits, equipment and what you have of each.'
              : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary h-11 gap-2"
          onClick={() => setItemSheet((n) => n + 1)}
        >
          <Icon name="plus" size="sm" />
          Add Item
        </button>
      </div>

      {totals && items.length > 0 ? (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Items" value={String(totals.item_count)} />
          <Stat label="Units in stock" value={formatQuantity(totals.units)} />
          <Stat
            label="Stock value"
            value={formatPrice(Math.round(totals.value))}
            hint="At average cost"
          />
          <Stat
            label="Needs attention"
            value={String(totals.low + totals.out)}
            hint={`${totals.low} low · ${totals.out} out`}
            tone={totals.low + totals.out > 0 ? 'warn' : undefined}
          />
        </dl>
      ) : null}

      {items.length > 0 ? (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Stock level" className="join w-full xl:w-auto">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filter === option.value}
                className={cn(
                  'btn join-item h-11 flex-1 gap-1.5 px-2 sm:px-4 xl:flex-none',
                  filter === option.value
                    ? 'btn-primary'
                    : 'btn-outline border-base-300',
                )}
                onClick={() => setParam('stock', option.value)}
              >
                {option.label}
                <span className="text-xs opacity-70">{counts[option.value]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {categories.length > 0 ? (
              <select
                className={cn(
                  'select h-11 w-full sm:w-48',
                  category && 'select-primary',
                )}
                aria-label="Category"
                value={category}
                onChange={(e) => setParam('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : null}
            <label className="input h-11 w-full sm:w-64">
              <Icon name="search" size="sm" className="text-base-content/50" />
              <input
                type="search"
                placeholder="Search items"
                aria-label="Search items"
                value={q}
                onChange={(e) => setParam('q', e.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div
          className="flex flex-col gap-3"
          role="status"
          aria-label="Loading inventory"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-16 rounded-box" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="alert alert-error">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            className="btn btn-sm h-10"
            onClick={() => {
              setLoading(true)
              reload()
            }}
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <Empty
          title="No items yet"
          body="Add your first item, like Rubber Ball, and record what you bought and when."
          action={
            <button
              type="button"
              className="btn btn-primary h-11 gap-2"
              onClick={() => setItemSheet((n) => n + 1)}
            >
              <Icon name="plus" size="sm" />
              Add Item
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <Empty
          title="No items match"
          body="Try a different search, or clear the filters."
          action={
            <button
              type="button"
              className="btn h-11"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="card card-border bg-base-100 hidden overflow-x-auto xl:block">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">In Stock</th>
                  <th>Status</th>
                  <th className="text-right">Avg Cost</th>
                  <th className="text-right">Value</th>
                  <th>Last Bought</th>
                  <th className="w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-base-200/60 cursor-pointer"
                    onClick={() => openItem(item)}
                  >
                    <td>
                      <Link
                        to={`${ROUTES.opsInventory}/${item.id}`}
                        className="link link-hover font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.name}
                      </Link>
                      {item.category ? (
                        <span className="text-base-content/60 block text-xs">
                          {item.category}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-right font-medium whitespace-nowrap">
                      {formatQuantity(item.stock)}
                    </td>
                    <td>
                      <StockBadge item={item} />
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {item.purchase_count > 0 ? formatPrice(item.avg_cost) : '—'}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {item.purchase_count > 0
                        ? formatPrice(Math.round(item.value))
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap">
                      {item.last_purchased_on
                        ? formatEventDate(item.last_purchased_on)
                        : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-square size-11 min-h-0"
                        aria-label={`Add a purchase of ${item.name}`}
                        title="Add purchase"
                        onClick={(e) => {
                          e.stopPropagation()
                          startPurchase(item)
                        }}
                      >
                        <Icon name="plus" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="card card-border bg-base-100 divide-base-200 divide-y xl:hidden">
            {visible.map((item) => (
              <li key={item.id} className="flex items-stretch">
                <Link
                  to={`${ROUTES.opsInventory}/${item.id}`}
                  className="hover:bg-base-200/60 flex min-h-16 min-w-0 flex-1 flex-col justify-center gap-0.5 px-4 py-3"
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-primary font-semibold">{item.name}</span>
                    <StockBadge item={item} />
                  </span>
                  <span className="text-base-content/70 text-sm">
                    {formatQuantity(item.stock)} in stock
                    {item.purchase_count > 0
                      ? ` · ${formatPrice(Math.round(item.value))} value`
                      : ''}
                    {item.category ? ` · ${item.category}` : ''}
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-square m-1 size-11 min-h-0 self-center"
                  aria-label={`Add a purchase of ${item.name}`}
                  onClick={() => startPurchase(item)}
                >
                  <Icon name="plus" />
                </button>
              </li>
            ))}
          </ul>
          {hasFilters ? (
            <div>
              <button
                type="button"
                className="btn btn-ghost h-11"
                onClick={() => setParams({}, { replace: true })}
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </>
      )}

      <ItemFormSheet
        key={`item-${itemSheet}`}
        open={itemSheet > 0}
        item={null}
        categories={categories}
        csrf={csrf}
        onClose={() => setItemSheet(0)}
        onSaved={(saved) => {
          setItemSheet(0)
          navigate(`${ROUTES.opsInventory}/${saved.id}`)
        }}
      />
      <PurchaseFormSheet
        key={`purchase-${purchaseSheet}`}
        open={purchaseFor !== null}
        item={purchaseFor}
        purchase={null}
        csrf={csrf}
        onClose={() => setPurchaseFor(null)}
        onSaved={() => {
          setPurchaseFor(null)
          reload()
        }}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'warn'
}) {
  return (
    <div className="card card-border bg-base-100 px-4 py-3">
      <dt className="text-base-content/60 text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          'font-heading mt-1 text-2xl font-semibold',
          tone === 'warn' && 'text-warning-content',
        )}
      >
        {value}
      </dd>
      {hint ? <p className="text-base-content/60 text-xs">{hint}</p> : null}
    </div>
  )
}

function Empty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body items-center gap-2 py-12 text-center">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-base-content/70 max-w-sm text-sm">{body}</p>
        <div className="mt-2">{action}</div>
      </div>
    </div>
  )
}
