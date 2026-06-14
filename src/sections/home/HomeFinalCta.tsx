import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import { getFooterCta } from '@/lib/navigation'

export default function HomeFinalCta() {
  const cta = getFooterCta()
  const contact = getContactInfo()

  return (
    <Section tone="default" padding="sm" id="book" profile="marketing">
      <Reveal>
        <CTA headline={cta.headline} description={cta.description} tone="primary">
          <Button variant="secondary" size="lg" href={getDefaultBookingUrl()} external>
            {getBookingLabel('bookYourEventNow')}
          </Button>
          <Button variant="whatsapp" size="lg" href={contact.whatsappUrl} external>
            {getBookingLabel('whatsappUs')}
          </Button>
        </CTA>
      </Reveal>
    </Section>
  )
}
