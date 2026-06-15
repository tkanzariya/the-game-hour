import { Section } from '@/components/Section'
import { CmsImageFrame } from '@/components/CmsImages/CmsImageFrame'
import { Reveal, RevealItem } from '@/components/motion'
import { ASSET_MAP } from '@/data/asset-map'
import { useCmsImage } from '@/hooks/useCmsImage'
import { getAboutStory } from '@/lib/about-page'

export default function AboutStory() {
  const story = getAboutStory()
  const storyImage = useCmsImage('about-story')

  return (
    <Section tone="muted" id="story" profile="marketing">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="image-frame">
            <CmsImageFrame
              ready={storyImage.ready}
              src={storyImage.src}
              alt={ASSET_MAP.homepage.aboutTeaser.alt ?? 'People playing games at an event'}
              className="aspect-4/3 w-full object-cover lg:aspect-[4/5]"
              wrapperClassName="w-full"
              skeletonClassName="aspect-4/3 w-full rounded-2xl lg:aspect-[4/5]"
              width={640}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <h2 className="heading-accent font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl lg:text-5xl">
            {story.title}
          </h2>
          <p className="mt-5 font-body text-lg font-medium leading-relaxed text-primary md:text-xl">
            {story.lead}
          </p>
          {story.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-4 font-body text-base leading-relaxed text-accent-muted-grey"
            >
              {paragraph}
            </p>
          ))}
          <Reveal staggerChildren className="mt-8 grid gap-4 sm:grid-cols-3">
            {story.milestones.map((milestone) => (
              <RevealItem key={milestone.era}>
                <article className="surface-clay h-full rounded-2xl p-4 transition-brand hover:-translate-y-0.5 hover:shadow-card-hover">
                  <p className="font-heading text-sm font-extrabold text-secondary">{milestone.era}</p>
                  <h3 className="mt-1 font-heading text-base font-bold text-primary">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-accent-muted-grey">
                    {milestone.summary}
                  </p>
                </article>
              </RevealItem>
            ))}
          </Reveal>
        </Reveal>
      </div>
    </Section>
  )
}
