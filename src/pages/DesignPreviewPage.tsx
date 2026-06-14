import { Seo } from '@/components/Seo'
import { buildSeo } from '@/utils/seo'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { ServiceCard } from '@/components/ServiceCard'
import { GalleryCard } from '@/components/GalleryCard'
import { StatCard } from '@/components/StatCard'
import { CTA } from '@/components/CTA'
import { FloatingActions } from '@/components/FloatingActions'
import { Reveal, RevealItem } from '@/components/motion'
import { getAssetUrl } from '@/lib/assets'
import { ASSET_MAP } from '@/data/asset-map'
import { getAllServices } from '@/lib/services'
import { BOOKING } from '@/utils/constants'
import { homeExperiencesPath, ROUTES, servicePath } from '@/constants/routes'

export default function DesignPreviewPage() {
  const services = getAllServices().slice(0, 3)
  const heroImg = getAssetUrl(ASSET_MAP.homepage.hero)
  const galleryImg = getAssetUrl(ASSET_MAP.gallery.events[0])

  return (
    <>
      <Seo
        {...buildSeo({
          title: 'Design Preview',
          description: 'Internal UI showcase, claymorphism + TGH brand.',
          noIndex: true,
        })}
      />

      <PageHero
        badge="Claymorphism · SKILL.md aligned"
        title="Design System Preview"
        subtitle="Typography, tokens, components, navbar, footer, and motion, not production page content."
        align="center"
        size="large"
      >
        <Button variant="secondary" href={ROUTES.home}>
          Placeholder routes
        </Button>
        <Button variant="primary" href={BOOKING.url} external>
          Book Now
        </Button>
      </PageHero>

      <Section id="typography">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Typography
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center font-body text-accent-muted-grey">
          <strong className="text-primary">Poppins</strong> (display / headings) +{' '}
          <strong className="text-primary">Montserrat</strong> (body), per SKILL.md, adapted
          for TGH brand.
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="surface-clay-flat p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Display / H1
            </p>
            <p className="mt-2 font-heading text-4xl font-extrabold text-primary md:text-5xl">
              Unleash the Fun
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-secondary">
              Heading / H2
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              Moments of Pure Joy
            </p>
          </div>
          <div className="surface-clay-flat p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Body</p>
            <p className="mt-2 font-body text-lg leading-relaxed text-text">
              Screen-free games and interactive activities for birthdays, weddings, corporate
              events, and festivals across Gujarat. Trustworthy for HR teams, exciting for kids.
            </p>
            <p className="mt-4 font-body text-sm text-accent-muted-grey">
              Caption, Montserrat 400, muted grey, WCAG AA on light surfaces.
            </p>
          </div>
        </div>
      </Section>

      <Section id="colors" tone="muted">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Color palette
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-accent-muted-grey">
          Brand #032A5D overrides SKILL default blue. Orange accent = energetic, not carnival.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: 'Primary', class: 'surface-primary', text: 'text-on-primary' },
            { name: 'Primary 600', class: 'bg-primary-600', text: 'text-on-primary' },
            { name: 'Dark', class: 'surface-dark', text: 'text-on-dark' },
            { name: 'Secondary', class: 'surface-accent', text: 'text-on-accent' },
            { name: 'Light', class: 'bg-light border border-surface-muted', text: 'text-text' },
            { name: 'Clay muted', class: 'bg-surface-clay-muted', text: 'text-text' },
          ].map((swatch) => (
            <div key={swatch.name} className="text-center">
              <div
                className={`h-20 rounded-2xl shadow-card ${swatch.class} flex items-end justify-center p-2`}
              >
                <span className={`text-[10px] font-bold ${swatch.text}`}>{swatch.name}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Buttons
        </h2>
        <p className="mt-3 text-center text-sm text-accent-muted-grey">
          States: hover lift · active press (clay) · focus-visible orange ring
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="whatsapp" href={BOOKING.url} external>
            WhatsApp
          </Button>
          <Button variant="primary" size="lg" href={BOOKING.url} external>
            Book Now
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section id="badges" tone="muted">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Badges
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Badge variant="primary">Corporate</Badge>
          <Badge variant="secondary">Kids & Family</Badge>
          <Badge variant="outline">Traditional</Badge>
          <Badge variant="muted">Gujarat</Badge>
        </div>
      </Section>

      <Section id="stats">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Stat cards
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value="50+" label="Events Hosted" />
          <StatCard value="3,000+" label="Participants Engaged" />
          <StatCard value="100+" label="Games Conducted" />
          <StatCard value="6" label="Cities Served" />
        </div>
      </Section>

      <Section id="cards" tone="muted">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Cards
        </h2>
        <Reveal staggerChildren className="mt-10 grid gap-8 lg:grid-cols-3">
          {services.map((s) => (
            <RevealItem key={s.slug}>
              <ServiceCard
                title={s.name}
                description={s.shortDescription}
                href={servicePath(s.slug)}
                imageSrc={getAssetUrl(ASSET_MAP.services[s.slug as keyof typeof ASSET_MAP.services].titleCard)}
              />
            </RevealItem>
          ))}
        </Reveal>
        <h3 className="mt-14 text-center font-heading text-2xl font-bold text-primary">
          Gallery cards
        </h3>
        <Reveal className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <RevealItem>
            <GalleryCard
              src={galleryImg}
              alt="Event gallery sample"
              caption="Clay-framed gallery item with hover lift."
            />
          </RevealItem>
          <RevealItem>
            <GalleryCard src={heroImg} alt="Hero sample" caption="Homepage hero asset." />
          </RevealItem>
          <RevealItem>
            <GalleryCard caption="Placeholder surface when no image." />
          </RevealItem>
        </Reveal>
      </Section>

      <Section id="cta">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          CTA blocks
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8">
          <CTA
            headline="Ready to plan your next unforgettable event?"
            description="Premium navy clay panel with confident Montserrat body copy."
            tone="primary"
          >
            <Button variant="secondary" href={BOOKING.url} external>
              Book Now
            </Button>
            <Button
              variant="tertiary"
              className="!border-white !text-white hover:!bg-white hover:!text-primary"
              href={ROUTES.contact}
            >
              Contact Us
            </Button>
          </CTA>
          <CTA
            headline="Light clay surface"
            description="For sections on default backgrounds."
            tone="light"
          >
            <Button variant="primary" href={homeExperiencesPath}>
              View services
            </Button>
          </CTA>
        </div>
      </Section>

      <Section id="spacing" tone="muted">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Spacing & radius
        </h2>
        <ul className="mx-auto mt-8 max-w-lg space-y-2 font-body text-accent-muted-grey">
          <li>Spacing scale (SKILL): 4 · 8 · 12 · 16 · 24 · 32 px</li>
          <li>Section padding: 64-96px vertical (responsive)</li>
          <li>Container: 1200px max · 20-24px horizontal padding</li>
          <li>Card radius: 24px (xl) · Buttons: pill (full)</li>
          <li>Shadows: clay dual-layer (highlight + depth)</li>
        </ul>
      </Section>

      <Section id="layout" tone="dark">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold !text-white md:text-5xl">
          Navbar & footer
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center font-body text-white/85">
          Live site chrome is active on this page, scroll to test transparent → solid header.
          Services dropdown uses navigation.json. Footer includes all service links + social
          placeholders.
        </p>
      </Section>

      <Section id="motion">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Motion
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-accent-muted-grey">
          Framer Motion: slideUp reveals, stagger grids, card hover lift, FAB scale. Easing{' '}
          <code className="rounded bg-surface-muted px-1">cubic-bezier(0.25, 0.1, 0.25, 1)</code>
        </p>
        <Reveal staggerChildren className="mt-10 grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <RevealItem key={n}>
              <div className="surface-clay h-24 rounded-2xl" />
            </RevealItem>
          ))}
        </Reveal>
      </Section>

      <Section id="responsive" tone="muted">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Responsive QA
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-accent-muted-grey">
          Resize: mobile (320+) · tablet (768+) · desktop (1024+). Nav collapses with accordion
          services. Grids: 1 → 2 → 3 columns.
        </p>
      </Section>

      <Section id="floating" className="pb-28">
        <h2 className="heading-accent heading-accent-center text-center text-4xl font-bold md:text-5xl">
          Floating actions
        </h2>
        <p className="mt-4 text-center text-accent-muted-grey">
          WhatsApp + Call, bottom-right. Feature flag{' '}
          <code className="rounded bg-surface-muted px-1">floatingCta</code> off in production;
          active here via preview prop.
        </p>
      </Section>

      <FloatingActions preview />
    </>
  )
}
