import { cn } from '@/utils/cn'

type SectionIntroProps = {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
  dark?: boolean
}

export default function SectionIntro({
  title,
  subtitle,
  align = 'center',
  className,
  dark = false,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        'mb-12 md:mb-14 lg:mb-16',
        align === 'center' && 'prose-intro prose-intro-center',
        className,
      )}
    >
      <h2
        className={cn(
          'heading-accent font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl',
          align === 'center' && 'heading-accent-center',
          dark ? '!text-white' : 'text-primary',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 font-body text-base leading-relaxed md:text-lg',
            dark ? 'text-white/85' : 'text-accent-muted-grey',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
