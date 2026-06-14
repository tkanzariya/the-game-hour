import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Container } from '@/components/Container'

type PageHeroProps = {
  title: string
  subtitle?: string
  badge?: string
  children?: ReactNode
  align?: 'left' | 'center'
  size?: 'default' | 'large'
  className?: string
  containerWidth?: 'default' | 'wide'
}

export default function PageHero({
  title,
  subtitle,
  badge,
  children,
  align = 'left',
  size = 'default',
  className,
  containerWidth = 'default',
}: PageHeroProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden bg-primary pt-nav-clearance pb-16 md:pb-20',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 100% 0%, var(--color-secondary) 0%, transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-dark/50 to-primary"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-[90%] -translate-x-1/2 rounded-full bg-primary/40 blur-2xl"
        aria-hidden
      />
      <Container
        width={containerWidth}
        className={cn('relative z-10', align === 'center' && 'text-center')}
      >
        {badge && (
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 font-heading text-xs font-bold tracking-wide text-secondary uppercase backdrop-blur-sm">
            {badge}
          </p>
        )}
        <h1
          className={cn(
            'font-heading font-extrabold tracking-tight text-white',
            size === 'large'
              ? 'text-4xl sm:text-5xl md:text-6xl'
              : 'text-3xl sm:text-4xl md:text-5xl',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'mt-4 max-w-2xl font-body text-lg text-white/92 md:text-xl lg:max-w-3xl',
              align === 'center' && 'mx-auto',
            )}
          >
            {subtitle}
          </p>
        )}
        {children && (
          <div
            className={cn(
              'mt-8 flex flex-wrap gap-4',
              align === 'center' && 'justify-center',
            )}
          >
            {children}
          </div>
        )}
      </Container>
    </header>
  )
}
