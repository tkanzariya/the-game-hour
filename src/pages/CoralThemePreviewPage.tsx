import { useLayoutEffect } from 'react'
import { Seo } from '@/components/Seo'
import { buildSeo } from '@/utils/seo'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { ServiceCard } from '@/components/ServiceCard'
import { GalleryCard } from '@/components/GalleryCard'
import { IconChip } from '@/components/Icon'
import { StatCard } from '@/components/StatCard'
import { CTA } from '@/components/CTA'
import { Reveal, RevealItem } from '@/components/motion'
import { getAssetUrl } from '@/lib/assets'
import { ASSET_MAP } from '@/data/asset-map'
import { getAllServices } from '@/lib/services'
import { servicePath } from '@/constants/routes'
import { BOOKING } from '@/utils/constants'
import '@/styles/coral-theme-preview.css'

const SWATCHES = [
  { name: 'Primary', hex: '#032A5D', class: 'bg-primary text-white' },
  { name: 'Accent', hex: '#FF6B6B', class: 'surface-accent' },
  { name: 'Accent Hover', hex: '#FF5252', class: 'bg-secondary-hover text-on-accent' },
  { name: 'Accent Light', hex: '#FFF3F3', class: 'surface-accent-light border border-primary/10' },
  { name: 'Accent Soft', hex: '#FFE8E8', class: 'surface-accent-soft border border-primary/10' },
  { name: 'Emphasis (links)', hex: '#C24141', class: 'surface-light text-on-accent-subtle border border-primary/10' },
]

export default function CoralThemePreviewPage() {
  const services = getAllServices().slice(0, 3)
  const heroImg = getAssetUrl(ASSET_MAP.homepage.hero)
  const galleryImg = getAssetUrl(ASSET_MAP.gallery.events[0])

  useLayoutEffect(() => {
    document.documentElement.dataset.previewTheme = 'coral'
    return () => {
      delete document.documentElement.dataset.previewTheme
    }
  }, [])

  return (
    <>
      <Seo
        {...buildSeo({
          title: 'Soft Coral Theme Preview',
          description: 'Accent color evaluation for The Game Hour.',
          noIndex: true,
        })}
      />

      <PageHero
          badge="Soft Coral accent"
          title="Theme preview"
          subtitle="Archived coral accent for comparison. Production site now uses violet."
          align="center"
          size="large"
        >
          <Button variant="secondary" size="lg" href={BOOKING.url} external>
            Book event
          </Button>
          <Button variant="primary" size="lg" href={BOOKING.url} external>
            Primary action
          </Button>
        </PageHero>

        <Section id="palette">
          <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary md:text-4xl">
            Coral palette
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SWATCHES.map((swatch) => (
              <div
                key={swatch.name}
                className={`rounded-2xl px-5 py-6 font-semibold ${swatch.class}`}
              >
                <p>{swatch.name}</p>
                <p className="mt-1 text-sm opacity-90">{swatch.hex}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section tone="muted" id="buttons">
          <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary">
            Buttons
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="whatsapp" href={BOOKING.url} external>
              WhatsApp
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Badge variant="primary">Primary badge</Badge>
            <Badge variant="secondary">Coral badge</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        <Section id="cards">
          <h2 className="heading-accent heading-accent-center text-center font-heading text-3xl font-bold text-primary">
            Cards
          </h2>
          <Reveal staggerChildren className="mt-10 grid gap-7 md:grid-cols-3">
            {services.map((service) => {
              const titleCard =
                ASSET_MAP.services[service.slug as keyof typeof ASSET_MAP.services]?.titleCard
              return (
                <RevealItem key={service.slug}>
                  <ServiceCard
                    title={service.name}
                    description={service.shortDescription}
                    href={servicePath(service.slug)}
                    imageSrc={titleCard ? getAssetUrl(titleCard) : heroImg}
                    variant="clay"
                  />
                </RevealItem>
              )
            })}
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <StatCard value="50+" label="Events Hosted" icon={<IconChip name="party" size="md" />} />
            <GalleryCard src={galleryImg} alt="Event moment" caption="Gallery card framing" />
            <div className="flex items-center justify-center rounded-3xl bg-accent-light p-6 text-center">
              <p className="font-heading text-lg font-bold text-primary">Accent Light surface</p>
              <p className="mt-2 text-sm text-accent-muted-grey">Warm, soft background tint</p>
            </div>
          </div>
        </Section>

        <Section tone="warm" padding="sm" id="cta">
          <CTA
            headline="Ready for screen-free fun?"
            description="Coral CTA block on navy with white secondary button."
            tone="primary"
          >
            <Button variant="secondary" size="lg" href={BOOKING.url} external>
              Book your event
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              href={BOOKING.url}
              external
              className="!border-white/50 !text-white hover:!bg-white hover:!text-primary"
            >
              Learn more
            </Button>
          </CTA>
        </Section>

        <Section tone="muted" id="hero-sample" layout="flat" className="!bg-primary !py-0">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 md:px-10 md:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              aria-hidden
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 90% 10%, var(--color-secondary) 0%, transparent 55%)',
              }}
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="hero-eyebrow">Hero accent sample</p>
                <h2 className="hero-title-primary mt-3">Real laughter.</h2>
                <p className="hero-title-accent">Warm coral glow.</p>
                <p className="hero-body mt-4">
                  Coral radial on navy feels energetic without festival-poster orange.
                </p>
              </div>
              <div className="image-frame">
                <img src={heroImg} alt="" className="aspect-4/3 w-full object-cover" />
              </div>
            </div>
          </div>
        </Section>
    </>
  )
}
