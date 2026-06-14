import { Link } from 'react-router-dom'
import { LightboxImage } from '@/components/ImageLightbox'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { servicePath } from '@/constants/routes'
import { getGalleryStoryServiceLinkLabel } from '@/lib/content/gallery-stories'
import { getGalleryItemById } from '@/lib/gallery'
import { getGalleryStories } from '@/lib/gallery-page'
import { getServiceBySlug } from '@/lib/services'
import { toLightboxGallery } from '@/lib/lightbox'
import SectionIntro from '@/sections/home/SectionIntro'

export default function GalleryStories() {
  const content = getGalleryStories()
  const storyImages = content.items
    .map((story) => getGalleryItemById(story.imageId))
    .filter((image): image is NonNullable<typeof image> => image !== undefined)
  const lightboxGallery = toLightboxGallery(storyImages)

  return (
    <Section tone="warm" id="stories" profile="marketing">
      <SectionIntro title={content.title} subtitle={content.subtitle} />
      <div className="flex flex-col gap-10 lg:gap-14">
        {content.items.map((story, index) => {
          const image = getGalleryItemById(story.imageId)
          const service = getServiceBySlug(story.serviceSlug)
          const imageFirst = index % 2 === 0

          return (
            <Reveal key={story.id}>
              <article
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 ${
                  imageFirst ? '' : 'lg:[&>div:first-child]:order-2'
                }`}
              >
                <div>
                  {image && (
                    <div className="image-frame overflow-hidden rounded-3xl">
                      <LightboxImage
                        src={image.src}
                        alt={image.alt}
                        caption={image.caption}
                        gallery={lightboxGallery}
                        galleryIndex={index}
                        className="aspect-[16/10] w-full object-cover sm:aspect-[3/2]"
                        wrapperClassName="w-full"
                        width={960}
                        height={600}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-secondary">
                    {content.itemEyebrow}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-primary md:text-3xl">
                    {story.title}
                  </h3>
                  <p className="mt-4 font-body text-base leading-relaxed text-accent-muted-grey">
                    {story.context}
                  </p>
                  {image?.caption && (
                    <p className="mt-3 font-body text-sm italic text-dark-grey">{image.caption}</p>
                  )}
                  {service && (
                    <Link
                      to={servicePath(story.serviceSlug)}
                      className="mt-5 inline-block text-sm font-semibold text-primary transition-brand hover:text-secondary-emphasis"
                    >
                      {getGalleryStoryServiceLinkLabel(service.name)}
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
