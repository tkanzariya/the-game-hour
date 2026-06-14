import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LightboxImage } from '@/components/ImageLightbox'
import { cn } from '@/utils/cn'

type ServiceCardVariant = 'default' | 'clay'
type ServiceCardLayout = 'standard' | 'showcase'

type ServiceCardProps = {
  title: string
  description?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  ctaLabel?: string
  variant?: ServiceCardVariant
  /** Homepage showcase — wider landscape image, compact text block */
  layout?: ServiceCardLayout
  featured?: boolean
  className?: string
}

export default function ServiceCard({
  title,
  description,
  href,
  imageSrc,
  imageAlt,
  ctaLabel = 'Explore experience',
  variant = 'clay',
  layout = 'standard',
  featured = false,
  className,
}: ServiceCardProps) {
  const isClay = variant === 'clay'
  const isShowcase = layout === 'showcase'

  const body = (
    <>
      <h3
        className={cn(
          'font-heading font-bold text-primary',
          isClay ? 'text-xl md:text-2xl' : 'text-xl',
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'leading-relaxed text-accent-muted-grey',
            isClay && isShowcase
              ? 'mt-2 text-left text-sm md:text-base'
              : isClay
                ? 'mt-2.5 flex-1 text-left text-sm md:text-base'
                : 'mt-2.5 flex-1 text-center text-sm',
          )}
        >
          {description}
        </p>
      )}
      {href && (
        <span
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold transition-brand',
            isShowcase ? 'mt-4' : 'mt-6',
            isClay
              ? 'surface-accent-chip self-start rounded-2xl px-4 py-2.5'
              : 'self-center rounded-full border-2 border-primary px-5 py-2 text-primary group-hover:bg-primary group-hover:text-white',
          )}
        >
          {ctaLabel}
          {isClay && (
            <span
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          )}
        </span>
      )}
    </>
  )

  return (
    <motion.article
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden transition-brand',
        isClay
          ? 'surface-clay rounded-3xl hover:shadow-card-hover'
          : 'rounded-2xl bg-surface-elevated shadow-card hover:shadow-card-hover',
        featured && 'lg:min-h-[24rem]',
        className,
      )}
    >
      {isClay && (
        <span
          className="pointer-events-none absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full surface-accent text-lg shadow-glow-accent"
          aria-hidden
        >
          ✦
        </span>
      )}
      <div
        className={cn(
          isClay && isShowcase
            ? 'image-frame m-3 mb-0 aspect-[16/10]'
            : isClay
              ? 'image-frame m-4 mb-0 aspect-[5/4]'
              : 'relative aspect-4/3 overflow-hidden bg-surface-muted',
        )}
      >
        {imageSrc ? (
          <LightboxImage
            src={imageSrc}
            alt={imageAlt ?? title}
            className={cn('h-full w-full', !isClay && 'rounded-none')}
            wrapperClassName="h-full w-full"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center bg-linear-to-br from-primary-600 to-primary font-heading text-4xl font-bold text-white/25">
            TGH
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-t from-primary/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <div
        className={cn(
          'flex flex-col',
          isClay && isShowcase
            ? 'p-5 pt-4 md:p-6 md:pt-5'
            : isClay
              ? 'flex-1 p-6 pt-5 md:p-7 md:pt-6'
              : 'flex-1 p-6 text-center',
        )}
      >
        {href ? (
          <Link to={href} className="block h-full no-underline focus-visible:rounded-2xl">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
    </motion.article>
  )
}
