import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'whatsapp'
type ButtonSize = 'sm' | 'md' | 'lg'

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string
    external?: boolean
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'surface-primary border-primary/90 shadow-clay hover:bg-primary-700 hover:shadow-card-hover hover:scale-[1.02] active:shadow-clay-pressed active:scale-[0.99]',
  secondary:
    'surface-light border-primary/25 shadow-card hover:surface-primary hover:scale-[1.02] active:scale-[0.99]',
  tertiary:
    'bg-surface-clay-muted/80 text-on-light border-primary/20 hover:border-primary/50 hover:surface-light hover:scale-[1.02] active:scale-[0.99]',
  whatsapp:
    'bg-whatsapp text-white border-whatsapp shadow-fab hover:scale-[1.02] hover:shadow-glow-accent active:scale-[0.99]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-6 py-2.5 text-sm min-h-10 rounded-2xl',
  md: 'px-8 py-3.5 text-md min-h-12 rounded-2xl',
  lg: 'px-10 py-4 text-lg min-h-14 rounded-2xl',
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 border-2 font-semibold font-body transition-brand focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-60 disabled:text-on-disabled disabled:shadow-none disabled:scale-100'

export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', children, className, ...rest } = props

  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className)

  if ('href' in props && props.href) {
    const { href, external, ...anchorRest } = rest as ButtonAsLink
    if (external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a
          href={href}
          className={classes}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          {...anchorRest}
        >
          {children}
        </a>
      )
    }
    return (
      <Link to={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
