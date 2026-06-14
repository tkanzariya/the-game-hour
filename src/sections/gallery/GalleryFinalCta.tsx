import { Button } from '@/components/Button'
import { CTA } from '@/components/CTA'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { getGalleryFinalCta } from '@/lib/gallery-page'
import { getDefaultBookingUrl } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'

export default function GalleryFinalCta() {
  const cta = getGalleryFinalCta()
  const contact = getContactInfo()

  return (
    <Section tone="default" padding="sm" id="book" profile="marketing">
      <Reveal>
        <CTA headline={cta.headline} description={cta.description} tone="primary">
          <Button variant="secondary" size="lg" href={getDefaultBookingUrl()} external>
            {cta.primaryLabel}
          </Button>
          <Button variant="whatsapp" size="lg" href={contact.whatsappUrl} external>
            {cta.secondaryLabel}
          </Button>
        </CTA>
      </Reveal>
    </Section>
  )
}
