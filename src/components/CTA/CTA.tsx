import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type CTATone = 'primary' | 'light'

type CTAProps = {
  headline: string
  description?: string
  children?: ReactNode
  tone?: CTATone
  className?: string
}

export default function CTA({
  headline,
  description,
  children,
  tone = 'primary',
  className,
}: CTAProps) {
  const isPrimary = tone === 'primary'

  return (
    <aside
      className={cn(
        'rounded-3xl px-8 py-12 md:px-12 md:py-14',
        isPrimary
          ? 'surface-primary shadow-float border border-white/10'
          : 'surface-clay text-text',
        className,
      )}
    >
      <div>
        <h2
          className={cn(
            'font-heading text-2xl font-bold md:text-3xl lg:text-4xl',
            isPrimary ? 'text-on-primary' : 'text-on-light',
          )}
        >
          {headline}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-4 max-w-xl text-lg font-body leading-relaxed',
              isPrimary ? 'text-white/92' : 'text-accent-muted-grey',
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
      </div>
    </aside>
  )
}
