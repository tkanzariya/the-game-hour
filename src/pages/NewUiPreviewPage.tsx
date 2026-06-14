import type { ReactNode } from 'react'
import '@/styles/legacy-preview.css'
import { Seo } from '@/components/Seo'
import { buildSeo } from '@/utils/seo'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { Button } from '@/components/Button'
import { ServiceCard } from '@/components/ServiceCard'
import { GalleryCard } from '@/components/GalleryCard'
import { IconChip } from '@/components/Icon'
import { StatCard } from '@/components/StatCard'
import { CTA } from '@/components/CTA'
import { getAssetUrl } from '@/lib/assets'
import { ASSET_MAP } from '@/data/asset-map'
import { getAllServices } from '@/lib/services'
import { servicePath } from '@/constants/routes'

function CompareColumn({
  label,
  variant,
  children,
}: {
  label: string
  variant: 'legacy' | 'soft'
  children: ReactNode
}) {
  return (
    <div
      className={
        variant === 'legacy'
          ? 'ui-legacy rounded-2xl border border-surface-muted bg-surface-muted/50 p-4 md:p-5'
          : 'rounded-3xl border border-white/60 bg-light-soft/80 p-4 md:p-5'
      }
    >
      <p
        className={`mb-4 text-xs font-bold uppercase tracking-widest ${
          variant === 'legacy' ? 'text-accent-muted-grey' : 'text-secondary'
        }`}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

export default function NewUiPreviewPage() {
  const sample = getAllServices()[0]
  const heroImg = getAssetUrl(ASSET_MAP.homepage.hero)
  const galleryImg = getAssetUrl(ASSET_MAP.gallery.events[0])
  const titleCard = ASSET_MAP.services['birthday-games']?.titleCard

  return (
    <>
      <Seo
        {...buildSeo({
          title: 'Soft UI Preview',
          description: 'Compare previous and refined clay UI components.',
          noIndex: true,
        })}
      />

      <PageHero
        badge="Visual refinement only"
        title="Soft UI comparison"
        subtitle="Same content and structure. Softer clay surfaces, floating sections, and image-forward cards."
        align="center"
        size="large"
      />

      <Section id="buttons">
        <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary md:text-4xl">
          Buttons
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <CompareColumn label="Before" variant="legacy">
            <div className="flex flex-wrap gap-3">
              <span className="legacy-btn legacy-btn-primary">Book event</span>
              <span className="legacy-btn bg-white text-primary">Secondary</span>
            </div>
          </CompareColumn>
          <CompareColumn label="After (soft)" variant="soft">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Book event</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </CompareColumn>
        </div>
      </Section>

      <Section tone="muted" id="service-card">
        <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary md:text-4xl">
          Service card
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <CompareColumn label="Before" variant="legacy">
            <article className="legacy-service-card">
              <img src={titleCard ? getAssetUrl(titleCard) : heroImg} alt="" />
              <div className="body">
                <h3 className="font-heading text-xl font-bold text-primary">{sample.name}</h3>
                <p className="mt-2 text-sm text-accent-muted-grey">{sample.shortDescription}</p>
                <span className="mt-4 inline-block rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary">
                  Learn More
                </span>
              </div>
            </article>
          </CompareColumn>
          <CompareColumn label="After (soft)" variant="soft">
            <ServiceCard
              title={sample.name}
              description={sample.shortDescription}
              href={servicePath(sample.slug)}
              imageSrc={titleCard ? getAssetUrl(titleCard) : undefined}
              variant="clay"
              featured
            />
          </CompareColumn>
        </div>
      </Section>

      <Section id="gallery-card">
        <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary md:text-4xl">
          Gallery card
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <CompareColumn label="Before" variant="legacy">
            <figure className="legacy-gallery-card">
              <img src={galleryImg} alt="Event" />
              <figcaption className="border-t px-4 py-3 text-sm text-dark-grey">
                Flat card, flush image
              </figcaption>
            </figure>
          </CompareColumn>
          <CompareColumn label="After (soft)" variant="soft">
            <GalleryCard
              src={galleryImg}
              alt="Event"
              caption="Framed image, clay surface, gentle hover"
            />
          </CompareColumn>
        </div>
      </Section>

      <Section tone="warm" id="stat-cta">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="heading-accent font-heading text-2xl font-bold text-primary md:text-3xl">
              Stat card
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <CompareColumn label="Before" variant="legacy">
                <div className="legacy-stat-card">
                  <p className="font-heading text-4xl font-extrabold text-primary">500+</p>
                  <p className="mt-2 text-sm text-accent-muted-grey">events hosted</p>
                </div>
              </CompareColumn>
              <CompareColumn label="After" variant="soft">
                <StatCard value="50+" label="Events Hosted" icon={<IconChip name="party" size="md" />} />
              </CompareColumn>
            </div>
          </div>
          <div>
            <h2 className="heading-accent font-heading text-2xl font-bold text-primary md:text-3xl">
              CTA block
            </h2>
            <div className="mt-8 grid gap-6">
              <CompareColumn label="Before" variant="legacy">
                <div className="legacy-cta">
                  <h3 className="font-heading text-2xl font-bold">Ready to book?</h3>
                  <p className="mt-2 text-white/90">Sharper corners, tighter padding.</p>
                </div>
              </CompareColumn>
              <CompareColumn label="After" variant="soft">
                <CTA headline="Ready to book?" description="Softer float shadow and room to breathe.">
                  <Button variant="secondary" href="#">
                    Book now
                  </Button>
                </CTA>
              </CompareColumn>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted" id="section-float">
        <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary md:text-4xl">
          Floating section (site-wide)
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-accent-muted-grey">
          Homepage and services pages now render content inside rounded floating panels with gap
          between blocks. Heroes stay full-bleed.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <CompareColumn label="Before" variant="legacy">
            <div className="legacy-section-flat text-center">
              <p className="font-heading font-bold text-primary">Flat full-width section</p>
              <p className="mt-2 text-sm text-accent-muted-grey">Edge-to-edge background band</p>
            </div>
          </CompareColumn>
          <CompareColumn label="After" variant="soft">
            <div className="section-float section-float-muted py-10 text-center">
              <p className="font-heading font-bold text-primary">Floating clay panel</p>
              <p className="mt-2 text-sm text-accent-muted-grey">Breathing room on every side</p>
            </div>
          </CompareColumn>
        </div>
      </Section>
    </>
  )
}
