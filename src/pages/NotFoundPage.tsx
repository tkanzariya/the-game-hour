import { Seo } from '@/components/Seo'
import { Button } from '@/components/Button'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { homeExperiencesPath, ROUTES } from '@/constants/routes'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getSiteInfo } from '@/lib/content/company'
import { buildSeo } from '@/utils/seo'

type NotFoundPageProps = {
  /** When true, copy targets an unknown service slug rather than a generic missing page. */
  variant?: 'default' | 'service'
}

export default function NotFoundPage({ variant = 'default' }: NotFoundPageProps) {
  const site = getSiteInfo()
  const isService = variant === 'service'

  const title = isService ? 'Experience not found' : 'Page not found'
  const description = isService
    ? 'That game experience may have moved or the link may be outdated. Browse our packages from the homepage or contact us to plan your event.'
    : 'The page you are looking for does not exist or may have moved.'

  return (
    <>
      <Seo
        {...buildSeo({
          title,
          description,
          noIndex: true,
        })}
      />
      <PageHero
        title={isService ? "We couldn't find that experience" : '404 — Page not found'}
        subtitle={description}
        badge={isService ? 'Unknown experience' : '404'}
        containerWidth="wide"
        align="center"
      >
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" size="lg" href={ROUTES.home}>
            Back to home
          </Button>
          <Button variant="primary" size="lg" href={homeExperiencesPath}>
            Browse experiences
          </Button>
          <Button variant="tertiary" size="lg" href={getDefaultBookingUrl()} external>
            {getBookingLabel('bookYourEvent')}
          </Button>
        </div>
      </PageHero>

      <Section tone="muted" profile="marketing">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-base leading-relaxed text-accent-muted-grey">
            {isService
              ? `Every ${site.name} package has its own page — birthday, corporate, wedding, school, festival, and more. Start from our homepage experience cards or reach out and we will guide you.`
              : 'Try the homepage, gallery, or contact page — or book directly if you already know your event date.'}
          </p>
        </div>
      </Section>
    </>
  )
}
