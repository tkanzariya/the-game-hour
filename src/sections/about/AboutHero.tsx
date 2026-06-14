import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { LightboxImage } from '@/components/ImageLightbox'
import { Reveal } from '@/components/motion'
import { homeExperiencesPath } from '@/constants/routes'
import { ASSET_MAP } from '@/data/asset-map'
import { getAssetUrl } from '@/lib/assets'
import { getAboutHero } from '@/lib/about-page'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'

export default function AboutHero() {
  const hero = getAboutHero()
  const heroImage = getAssetUrl(ASSET_MAP.homepage.hero)
  const accentImage = getAssetUrl(ASSET_MAP.homepage.aboutTeaser)

  return (
    <header
      className="relative overflow-hidden bg-primary pt-nav-clearance pb-12 md:pb-16"
      aria-labelledby="about-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 100% 0%, var(--color-secondary) 0%, transparent 50%)',
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
              {hero.eyebrow}
            </p>
            <h1
              id="about-hero-heading"
              className="hero-title-primary font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            >
              {hero.headline}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg text-white/92 md:text-xl">
              {hero.subheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" href={getDefaultBookingUrl()} external>
                {getBookingLabel('bookYourEvent')}
              </Button>
              <Button
                variant="tertiary"
                size="lg"
                href={homeExperiencesPath}
                className="!border-white/55 !text-white hover:!bg-white hover:!text-primary"
              >
                Explore experiences
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/70">{hero.trustLine}</p>
          </Reveal>
          <Reveal className="relative">
            <div className="image-frame">
              <LightboxImage
                src={heroImage}
                alt={ASSET_MAP.homepage.hero.alt ?? 'Guests laughing during a Game Hour event'}
                className="aspect-4/3 w-full object-cover lg:aspect-[5/4]"
                wrapperClassName="w-full"
                width={800}
                height={640}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="absolute -bottom-4 -right-2 hidden overflow-hidden rounded-2xl border-4 border-primary shadow-glow-accent sm:block md:-right-4">
              <LightboxImage
                src={accentImage}
                alt={ASSET_MAP.homepage.aboutTeaser.alt ?? 'People playing games together'}
                className="aspect-square w-28 object-cover md:w-36"
                wrapperClassName="w-28 md:w-36"
                width={144}
                height={144}
                loading="lazy"
                showExpandIcon={false}
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </header>
  )
}
