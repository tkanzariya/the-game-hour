import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'muted'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  primary: 'surface-primary shadow-sm',
  secondary: 'surface-accent shadow-sm',
  outline: 'surface-light border-2 border-primary/30 shadow-card',
  muted: 'bg-surface-muted text-dark-grey',
}

export default function Badge({
  children,
  variant = 'primary',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold font-body tracking-wide transition-brand',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
