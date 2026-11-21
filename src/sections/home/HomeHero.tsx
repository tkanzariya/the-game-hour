import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CmsImageFrame } from '@/components/CmsImages/CmsImageFrame'
import LightboxImage from '@/components/ImageLightbox/LightboxImage'
import { homeExperiencesPath } from '@/constants/routes'
import { ASSET_MAP } from '@/data/asset-map'
import { useCmsAssetUrl } from '@/hooks/useCmsImage'
import { getSiteMetric } from '@/lib/site-stats'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getSiteInfo } from '@/lib/content/company'
import { getHomeHeroContent } from '@/lib/content/home'

/**
 * Fixed address of the hero photo's web copy (cms/api/img.php). It is written into the page HTML,
 * so the browser starts fetching it straight away instead of after the scripts and the image list load.
 * No ".webp" on purpose: the live server forces a 60-day cache on .webp files, and a replaced hero must show within an hour.
 */
const HERO_WEB_SRC = '/media/homepage-hero-1600'

export default function HomeHero() {
  // When no hero has been uploaded, or the copy cannot be served, fall back to the CMS/bundled image.
  const [webCopyFailed, setWebCopyFailed] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  // The photo can fail before React attaches onError to server-rendered HTML; decode() catches that too.
  useEffect(() => {
    frameRef.current
      ?.querySelector('img')
      ?.decode()
      .catch(() => setWebCopyFailed(true))
  }, [])
  const site = getSiteInfo()
  const hero = getHomeHeroContent()
  const heroImage = useCmsAssetUrl(ASSET_MAP.homepage.hero)
  const heroAlt = ASSET_MAP.homepage.hero.alt ?? 'Guests laughing during a Game Hour event'
  const eventsHosted = getSiteMetric('events-hosted')

  return (
    <section
      className="relative overflow-hidden bg-primary pt-nav-clearance text-white"
      aria-labelledby="home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 80% 10%, var(--color-secondary) 0%, transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-dark/60 via-primary/90 to-primary"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full max-w-3xl bg-linear-to-r from-primary/95 via-primary/70 to-transparent lg:max-w-[55%]"
        aria-hidden
      />

      <Container width="wide" className="relative z-10 pb-10 pt-4 md:pb-14 md:pt-6 lg:pb-16 lg:pt-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-2xl">
            <p className="hero-eyebrow">{site.tagline}</p>

            <h1 id="home-hero-heading" className="mt-4 md:mt-5">
              <span className="hero-title-primary">{hero.headlinePrimary}</span>
              <span className="hero-title-accent">{hero.headlineAccent}</span>
            </h1>

            <p className="hero-body mt-5 md:mt-6">{hero.subheadline}</p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <Button variant="secondary" size="lg" href={getDefaultBookingUrl()}>
                {getBookingLabel('bookYourEvent')}
              </Button>
              <Button
                variant="tertiary"
                size="lg"
                href={homeExperiencesPath}
                className="!border-white/55 !text-white hover:!bg-white hover:!text-primary"
              >
                {getBookingLabel('exploreExperiences')}
              </Button>
            </div>

            <p className="hero-trust mt-6 text-sm md:mt-7">
              {hero.trustLine} ·{' '}
              <Link
                to={homeExperiencesPath}
                className="font-semibold text-secondary underline-offset-2 hover:underline"
              >
                {hero.trustLinkLabel}
              </Link>
            </p>
          </div>

          <div className="relative lg:mt-2">
            <div ref={frameRef} className="image-frame lg:p-3">
              {webCopyFailed ? (
                <CmsImageFrame
                  ready={heroImage.ready}
                  src={heroImage.src}
                  alt={heroAlt}
                  className="aspect-4/3 w-full object-cover lg:aspect-[5/4]"
                  wrapperClassName="w-full rounded-[inherit]"
                  skeletonClassName="aspect-4/3 w-full rounded-2xl lg:aspect-[5/4]"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <LightboxImage
                  src={HERO_WEB_SRC}
                  alt={heroAlt}
                  className="aspect-4/3 w-full object-cover lg:aspect-[5/4]"
                  wrapperClassName="w-full rounded-[inherit]"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => setWebCopyFailed(true)}
                />
              )}
            </div>
            <div
              className="absolute -bottom-4 -left-2 hidden rounded-2xl surface-accent px-5 py-3.5 shadow-glow-accent sm:block md:-left-4"
              aria-hidden
            >
              <p className="font-heading text-2xl font-extrabold">{eventsHosted?.value ?? '50+'}</p>
              <p className="text-xs font-semibold opacity-90">
                {eventsHosted?.label ?? 'Events Hosted'}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
