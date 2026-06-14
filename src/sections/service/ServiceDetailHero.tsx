import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { LightboxImage } from '@/components/ImageLightbox'
import { Reveal } from '@/components/motion'
import type { ServiceSlug } from '@/data/asset-map'
import { getServiceAssetUrl } from '@/lib/assets'
import { resolveServiceCtaHref } from '@/lib/services'
import { getServiceAccentColor } from '@/lib/service-accent'
import { getBookingLabel } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import type { Service } from '@/data/types'

const DEFAULT_TRUST_LINE =
  'Screen-free fun · Professional facilitators · We come to your venue'

type ServiceDetailHeroProps = {
  service: Service
}

export default function ServiceDetailHero({ service }: ServiceDetailHeroProps) {
  const slug = service.slug as ServiceSlug
  const heroImage = getServiceAssetUrl(slug, 'slider', 0)
  const bookHref = resolveServiceCtaHref(service)
  const contact = getContactInfo()
  const accentColor = getServiceAccentColor(service.hero.accentTint)
  const eyebrow = service.hero.eyebrow ?? `${service.name} · Gujarat`
  const trustLine = service.hero.trustLine ?? DEFAULT_TRUST_LINE

  return (
    <header className="relative overflow-hidden bg-primary pt-nav-clearance pb-12 md:pb-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 65% at 100% 0%, ${accentColor} 0%, transparent 50%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-dark/50 to-primary"
        aria-hidden
      />
      <Container width="wide" className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1.5 font-heading text-xs font-bold tracking-wide text-secondary uppercase backdrop-blur-sm">
              {eyebrow}
            </p>
            <h1 className="hero-title-primary font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              {service.hero.headline}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg text-white/92 md:text-xl">
              {service.hero.subheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="lg"
                href={bookHref}
                external={bookHref.startsWith('http')}
              >
                {service.cta.label}
              </Button>
              <Button variant="whatsapp" size="lg" href={contact.whatsappUrl} external>
                {getBookingLabel('whatsappUs')}
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/70">{trustLine}</p>
          </Reveal>
          <Reveal>
            <div className="image-frame">
              <LightboxImage
                src={heroImage}
                alt={service.name}
                className="aspect-4/3 w-full object-cover"
                wrapperClassName="w-full"
                width={800}
                height={600}
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </header>
  )
}
