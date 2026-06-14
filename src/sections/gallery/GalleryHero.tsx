import { Container } from '@/components/Container'
import { LightboxImage } from '@/components/ImageLightbox'
import { Reveal } from '@/components/motion'
import { ASSET_MAP } from '@/data/asset-map'
import { getAssetUrl } from '@/lib/assets'
import { getGalleryHero } from '@/lib/gallery-page'

export default function GalleryHero() {
  const hero = getGalleryHero()
  const heroImage = getAssetUrl(ASSET_MAP.gallery.hero)

  return (
    <header
      className="relative overflow-hidden bg-primary pt-nav-clearance pb-12 md:pb-16"
      aria-labelledby="gallery-hero-heading"
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
              id="gallery-hero-heading"
              className="hero-title-primary font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            >
              {hero.headline}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg text-white/92 md:text-xl">
              {hero.subheadline}
            </p>
            <p className="mt-6 text-sm text-white/70">
              Real people · Real participation · Screen-free play across Gujarat
            </p>
          </Reveal>
          <Reveal>
            <div className="image-frame">
              <LightboxImage
                src={heroImage}
                alt={ASSET_MAP.gallery.hero.alt ?? 'Guests enjoying games at a vibrant event'}
                className="aspect-4/3 w-full object-cover lg:aspect-[5/4]"
                wrapperClassName="w-full"
                width={800}
                height={640}
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
