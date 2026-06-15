import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CmsImageFrame } from '@/components/CmsImages/CmsImageFrame'
import { Reveal } from '@/components/motion'
import { homeExperiencesPath } from '@/constants/routes'
import { useCmsImage } from '@/hooks/useCmsImage'
import { getAboutHero } from '@/lib/about-page'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'

export default function AboutHero() {
  const hero = getAboutHero()
  const heroImage = useCmsImage('about-hero')

  return (
    <header
      className="relative overflow-hidden bg-primary pt-nav-clearance pb-0 md:pb-4"
      aria-labelledby="about-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, var(--color-secondary) 0%, transparent 62%)',
        }}
      />

      <Container width="wide" className="relative z-10 pb-8 md:pb-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 font-heading text-xs font-bold tracking-wide text-secondary uppercase backdrop-blur-sm">
            {hero.eyebrow}
          </p>
          <h1
            id="about-hero-heading"
            className="hero-title-primary font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-tight"
          >
            {hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-white/92 md:text-xl">
            {hero.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
          <p className="mt-5 text-sm text-white/70">{hero.trustLine}</p>
        </Reveal>
      </Container>

      <Container width="wide" className="relative z-10 pb-12 md:pb-16">
        <Reveal>
          <CmsImageFrame
            ready={heroImage.ready}
            src={heroImage.src}
            alt="Guests laughing during a Game Hour event"
            className="aspect-[21/10] w-full object-cover sm:aspect-[21/9]"
            wrapperClassName="w-full overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
            skeletonClassName="aspect-[21/10] w-full rounded-3xl sm:aspect-[21/9]"
            fetchPriority="high"
            decoding="async"
          />
        </Reveal>
      </Container>
    </header>
  )
}
