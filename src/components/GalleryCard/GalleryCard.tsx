import { motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { LightboxImage, type LightboxItem } from '@/components/ImageLightbox'
import { cn } from '@/utils/cn'

type GalleryCardProps = {
  src?: string
  alt?: string
  caption?: string
  className?: string
  gallery?: LightboxItem[]
  galleryIndex?: number
  enableLightbox?: boolean
}

export default function GalleryCard({
  src,
  alt,
  caption,
  className,
  gallery,
  galleryIndex,
  enableLightbox = true,
}: GalleryCardProps) {
  return (
    <motion.figure
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group surface-clay overflow-hidden rounded-3xl transition-brand hover:shadow-card-hover',
        className,
      )}
    >
      <div className="image-frame m-3 mb-0 aspect-4/3">
        {src ? (
          <LightboxImage
            src={src}
            alt={alt ?? ''}
            caption={caption}
            gallery={gallery}
            galleryIndex={galleryIndex}
            enableLightbox={enableLightbox}
            className="h-full w-full"
            wrapperClassName="h-full w-full rounded-[inherit]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 bg-linear-to-br from-accent-light to-surface-muted text-on-accent-subtle"
            aria-hidden
          >
            <Icon name="camera" size="lg" />
            <span className="font-heading text-xs font-semibold tracking-wide uppercase opacity-80">
              The Game Hour
            </span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="px-5 py-4 text-sm font-medium leading-relaxed text-dark-grey">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  )
}
