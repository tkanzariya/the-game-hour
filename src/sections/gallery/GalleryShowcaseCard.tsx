import { motion } from 'framer-motion'
import { LightboxImage, type LightboxItem } from '@/components/ImageLightbox'
import { cn } from '@/utils/cn'

type GalleryShowcaseCardProps = {
  src: string
  alt: string
  caption?: string
  className?: string
  priority?: boolean
  gallery?: LightboxItem[]
  galleryIndex?: number
}

export default function GalleryShowcaseCard({
  src,
  alt,
  caption,
  className,
  priority = false,
  gallery,
  galleryIndex,
}: GalleryShowcaseCardProps) {
  return (
    <motion.figure
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group surface-clay h-full overflow-hidden rounded-3xl transition-brand hover:shadow-card-hover',
        className,
      )}
    >
      <div className="image-frame m-3 mb-0 aspect-[16/10] overflow-hidden sm:aspect-[3/2]">
        <LightboxImage
          src={src}
          alt={alt}
          caption={caption}
          gallery={gallery}
          galleryIndex={galleryIndex}
          className="h-full w-full"
          wrapperClassName="h-full w-full"
          width={960}
          height={600}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      {caption && (
        <figcaption className="px-5 py-4 font-body text-sm font-medium leading-relaxed text-dark-grey">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  )
}
