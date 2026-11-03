import { FieldShell } from '@/components/booking'
import {
  formatPrice,
  parsePrice,
  parseQuantity,
  switchPriceMode,
  totalPaid,
  type PriceMode,
} from '@/lib/ops/inventory'
import { cn } from '@/utils/cn'

type PriceFieldProps = {
  id: string
  /** The quantity typed next to it, used to convert and to show the other figure. */
  quantity: string
  mode: PriceMode
  price: string
  error?: string
  onChange: (mode: PriceMode, price: string) => void
}

const MODES: { value: PriceMode; label: string }[] = [
  { value: 'each', label: 'Price of one' },
  { value: 'total', label: 'Total paid' },
]

/**
 * The price can be typed either as what one costs or as what the whole purchase cost.
 * Switching converts the number so the same money is kept.
 */
export function PriceField({
  id,
  quantity,
  mode,
  price,
  error,
  onChange,
}: PriceFieldProps) {
  const total = totalPaid(mode, price, quantity)
  const qty = parseQuantity(quantity)
  const each =
    parsePrice(price) !== null && qty !== null && mode === 'total' ? total! / qty : null

  return (
    <FieldShell id={id} label="Price" required error={error}>
      <div className="flex flex-col gap-3">
        <div
          role="group"
          aria-label="How you want to enter the price"
          className="join w-full"
        >
          {MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={mode === option.value}
              className={cn(
                'btn join-item h-11 flex-1 px-2',
                mode === option.value ? 'btn-primary' : 'btn-outline border-base-300',
              )}
              onClick={() =>
                onChange(
                  option.value,
                  switchPriceMode(mode, option.value, price, quantity),
                )
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className={cn('input h-11 w-full', error && 'input-error')}>
          <span className="text-base-content/60">₹</span>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder={mode === 'each' ? '45' : '2550'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            value={price}
            onChange={(e) => onChange(mode, e.target.value)}
          />
          <span className="text-base-content/60 text-sm">
            {mode === 'each' ? 'each' : 'in total'}
          </span>
        </label>
        {total !== null && (mode === 'each' || each !== null) ? (
          <p className="bg-base-200 rounded-box px-4 py-3 text-sm" aria-live="polite">
            {mode === 'each' ? (
              <>
                Total for this purchase: <strong>{formatPrice(total)}</strong>
              </>
            ) : (
              <>
                That works out to{' '}
                <strong>{formatPrice(Math.round((each ?? 0) * 100) / 100)}</strong> each
              </>
            )}
          </p>
        ) : null}
      </div>
    </FieldShell>
  )
}
