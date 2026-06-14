import { Seo } from '@/components/Seo'
import { Button } from '@/components/Button'
import { PageHero } from '@/components/PageHero'
import { Section } from '@/components/Section'
import { SocialChannels } from '@/components/SocialChannels'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getContactInfo, getSiteInfo } from '@/lib/content/company'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'

export default function ContactPage() {
  const contact = getContactInfo()
  const site = getSiteInfo()
  const bookingUrl = getDefaultBookingUrl()

  const seo = buildSeo({
    title: 'Contact',
    description: `Reach ${site.name} in Ahmedabad, Gujarat. Call, email, or WhatsApp to plan facilitator-led games for your next event.`,
    canonical: `${SITE.url}/contact`,
  })

  return (
    <>
      <Seo {...seo} />
      <PageHero
        title="Let's plan your event"
        subtitle="Share your date, venue, and guest count. We reply quickly with options tailored to your crowd."
        badge="Contact"
        containerWidth="wide"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="secondary" size="lg" href={bookingUrl} external>
            {getBookingLabel('bookYourEvent')}
          </Button>
          <Button variant="whatsapp" size="lg" href={contact.whatsappUrl} external>
            {getBookingLabel('whatsappUs')}
          </Button>
        </div>
      </PageHero>

      <Section tone="muted" profile="marketing">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          <article className="surface-clay rounded-2xl p-6">
            <h2 className="font-heading text-lg font-bold text-primary">Phone</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
              Call or WhatsApp us during business hours.
            </p>
            <a
              href={`tel:${contact.phone}`}
              className="mt-4 inline-block font-heading text-base font-semibold text-primary transition-brand hover:text-secondary-emphasis"
            >
              {contact.phoneDisplay}
            </a>
          </article>

          <article className="surface-clay rounded-2xl p-6">
            <h2 className="font-heading text-lg font-bold text-primary">Email</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
              For enquiries, packages, and event details.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 inline-block font-heading text-base font-semibold text-primary transition-brand hover:text-secondary-emphasis"
            >
              {contact.email}
            </a>
          </article>

          <article className="surface-clay rounded-2xl p-6 sm:col-span-2">
            <h2 className="font-heading text-lg font-bold text-primary">Location</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
              We travel across Gujarat for birthdays, weddings, corporates, schools, and community events.
            </p>
            <p className="mt-4 font-heading text-base font-semibold text-primary">{contact.location}</p>
          </article>

          <article className="surface-clay rounded-2xl p-6 sm:col-span-2">
            <h2 className="font-heading text-lg font-bold text-primary">Connect with us</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
              Follow us on Instagram for real event photos and on LinkedIn for corporate credibility
              and professional event expertise.
            </p>
            <div className="mt-5 rounded-2xl bg-primary p-4 sm:p-6">
              <SocialChannels variant="contact" />
            </div>
          </article>
        </div>
      </Section>
    </>
  )
}
