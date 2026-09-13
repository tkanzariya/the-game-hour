import { cn } from '@/utils/cn'

type StepIndicatorProps = {
  step: 1 | 2
  labels?: [string, string]
}

export function StepIndicator({
  step,
  labels = ['Event details', 'Advance payment'],
}: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center gap-3" aria-label={`Step ${step} of 2`}>
      {[1, 2].map((n) => {
        const active = step === n
        const done = step > n
        return (
          <div key={n} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold',
                active || done
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-muted text-accent-muted-grey',
              )}
            >
              {done ? '✓' : n}
            </span>
            <span
              className={cn(
                'font-heading text-sm font-semibold',
                active ? 'text-primary' : 'text-accent-muted-grey',
              )}
            >
              {labels[n - 1]}
            </span>
            {n === 1 ? (
              <span
                className="mx-1 hidden h-px flex-1 bg-primary/15 sm:block"
                aria-hidden
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
