import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { homeExperiencesPath } from '@/constants/routes'
import { getAboutExperiencesInvite } from '@/lib/about-page'

export default function AboutExperiencesInvite() {
  const content = getAboutExperiencesInvite()

  return (
    <Section tone="muted" id="experiences-invite" profile="marketing">
      <Reveal>
        <CTA headline={content.title} description={content.description} tone="light">
          <Button variant="primary" size="lg" href={homeExperiencesPath}>
            {content.primaryLabel}
          </Button>
          <Link
            to={content.secondaryHref}
            className="inline-flex min-h-12 items-center text-sm font-semibold text-primary transition-brand hover:text-secondary-emphasis"
          >
            {content.secondaryLabel} →
          </Link>
        </CTA>
      </Reveal>
    </Section>
  )
}
