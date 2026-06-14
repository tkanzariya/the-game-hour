import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Container, type ContainerWidth } from '@/components/Container'
import { resolveLayoutProfile, type FloatDensity, type LayoutProfile } from '@/constants/layout'

type SectionTone = 'default' | 'muted' | 'dark' | 'warm'
type SectionLayout = 'flat' | 'float'
type SectionPadding = 'default' | 'sm' | 'none'

type SectionProps = {
  id?: string
  children: ReactNode
  className?: string
  containerClassName?: string
  tone?: SectionTone
  padding?: SectionPadding
  /** Floating rounded panel (default). Use `flat` for full-bleed heroes. */
  layout?: SectionLayout
  /**
   * Layout profile — `marketing` = wide container + open float (production pages).
   * Explicit `width` / `floatDensity` override the profile.
   */
  profile?: LayoutProfile
  width?: ContainerWidth
  floatDensity?: FloatDensity
}

const floatPanelTone: Record<Exclude<SectionTone, 'dark'>, string> = {
  default: 'section-float-default',
  muted: 'section-float-muted',
  warm: 'section-float-warm',
}

const flatToneStyles: Record<SectionTone, string> = {
  default: 'bg-light text-text',
  muted: 'bg-surface-muted text-text',
  dark: 'bg-primary text-white [&_h2]:text-white',
  warm: 'bg-accent-warm-white text-text',
}

const floatOuterStyles: Record<SectionTone, string> = {
  default: 'text-text',
  muted: 'text-text',
  dark: 'bg-primary text-white [&_h2]:text-white',
  warm: 'text-text',
}

const paddingInner = {
  default: 'py-2 md:py-4',
  sm: 'py-1 md:py-2',
  none: '',
}

const paddingFlat = {
  default: 'py-20 md:py-24 lg:py-28',
  sm: 'py-12 md:py-16',
  none: '',
}

const paddingFloatOuter = {
  default: 'py-5 md:py-7 lg:py-9',
  sm: 'py-4 md:py-6',
  none: 'py-2',
}

const paddingFloatOuterOpen = {
  default: 'py-6 md:py-8 lg:py-10',
  sm: 'py-5 md:py-7',
  none: 'py-2',
}

export default function Section({
  id,
  children,
  className,
  containerClassName,
  tone = 'default',
  padding = 'default',
  layout = 'float',
  profile = 'default',
  width,
  floatDensity,
}: SectionProps) {
  const useFloat = layout === 'float' && tone !== 'dark'
  const { width: resolvedWidth, floatDensity: resolvedFloatDensity } = resolveLayoutProfile(
    profile,
    { width, floatDensity },
  )
  const isOpen = resolvedFloatDensity === 'open'
  const outerPadding = isOpen ? paddingFloatOuterOpen : paddingFloatOuter

  if (useFloat) {
    return (
      <section
        id={id}
        className={cn(floatOuterStyles[tone], outerPadding[padding], className)}
      >
        <Container width={resolvedWidth} className={containerClassName}>
          <div
            className={cn(
              'section-float',
              isOpen && 'section-float-open',
              floatPanelTone[tone as Exclude<SectionTone, 'dark'>],
              paddingInner[padding],
            )}
          >
            {children}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section
      id={id}
      className={cn(flatToneStyles[tone], paddingFlat[padding], className)}
    >
      <Container width={resolvedWidth} className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}
