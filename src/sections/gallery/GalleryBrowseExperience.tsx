import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LightboxImage } from '@/components/ImageLightbox'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { cn } from '@/utils/cn'
import {
  GALLERY_FILTER_ALL,
  getFilteredGalleryImages,
  isGalleryServiceSlug,
  type GalleryFilterId,
} from '@/lib/gallery'
import {
  getGalleryBrowse,
  getGalleryFilters,
  getGalleryGridIntro,
} from '@/lib/gallery-page'
import { toLightboxGallery } from '@/lib/lightbox'
import SectionIntro from '@/sections/home/SectionIntro'

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
}

export default function GalleryBrowseExperience() {
  const browse = getGalleryBrowse()
  const gridIntro = getGalleryGridIntro()
  const filters = getGalleryFilters()
  const [activeFilter, setActiveFilter] = useState<GalleryFilterId>(GALLERY_FILTER_ALL)

  const images = useMemo(
    () => getFilteredGalleryImages(activeFilter),
    [activeFilter],
  )

  const lightboxGallery = useMemo(() => toLightboxGallery(images), [images])

  const handleFilter = useCallback((id: string) => {
    if (id === GALLERY_FILTER_ALL) {
      setActiveFilter(GALLERY_FILTER_ALL)
      return
    }
    if (isGalleryServiceSlug(id)) {
      setActiveFilter(id)
    }
  }, [])

  return (
    <Section id="browse" profile="marketing">
      <SectionIntro title={browse.title} subtitle={browse.subtitle} />
      <Reveal>
        <div
          className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3"
          role="tablist"
          aria-label="Filter gallery by experience type"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleFilter(filter.id)}
                className={cn(
                  'rounded-full px-4 py-2 font-body text-sm font-semibold transition-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  isActive
                    ? 'surface-accent shadow-sm'
                    : 'surface-light border-2 border-primary/15 text-primary hover:border-secondary/40 hover:text-secondary-emphasis',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </Reveal>

      <div className="mb-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-primary md:text-3xl">
          {gridIntro.title}
        </h3>
        <p className="prose-intro prose-intro-center mt-3 font-body text-base text-accent-muted-grey">
          {gridIntro.subtitle}
        </p>
        <p className="mt-2 text-sm text-accent-muted-grey" aria-live="polite">
          Showing {images.length} {images.length === 1 ? 'moment' : 'moments'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          role="tabpanel"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {images.map((item, index) => (
            <motion.figure
              key={item.id}
              variants={itemVariants}
              layout
              className="group surface-clay overflow-hidden rounded-3xl transition-brand hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="image-frame m-3 mb-0 aspect-4/3 overflow-hidden">
                <LightboxImage
                  src={item.src}
                  alt={item.alt}
                  caption={item.caption}
                  gallery={lightboxGallery}
                  galleryIndex={index}
                  className="h-full w-full"
                  wrapperClassName="h-full w-full"
                  width={640}
                  height={480}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {item.caption && (
                <figcaption className="px-5 py-4 text-sm font-medium leading-relaxed text-dark-grey">
                  {item.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}
