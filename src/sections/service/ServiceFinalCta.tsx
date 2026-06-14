import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import type { Service } from '@/data/types'
import { getBookingLabel } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import { resolveServiceCtaHref } from '@/lib/services'

type ServiceFinalCtaProps = {
  service: Service
}

export default function ServiceFinalCta({ service }: ServiceFinalCtaProps) {
  const bookHref = resolveServiceCtaHref(service)
  const contact = getContactInfo()

  return (
    <Section tone="default" padding="sm" id="book" profile="marketing">
      <Reveal>
        <CTA headline={service.cta.headline} tone="primary">
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
        </CTA>
      </Reveal>
    </Section>
  )
}
