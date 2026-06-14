import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { SocialChannels } from '@/components/SocialChannels'
import { ROUTES } from '@/constants/routes'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getContactInfo, getFooterContent, getSiteInfo } from '@/lib/content/company'
import {
  getFooterCta,
  getFooterQuickLinks,
  getFooterServiceLinks,
  getFooterTagline,
} from '@/lib/navigation'
import { getLogoUrl } from '@/lib/assets'

export default function Footer() {
  const site = getSiteInfo()
  const contact = getContactInfo()
  const footer = getFooterContent()
  const quickLinks = getFooterQuickLinks()
  const serviceLinks = getFooterServiceLinks()
  const tagline = getFooterTagline()
  const cta = getFooterCta()
  const logoUrl = getLogoUrl('dark')
  const bookingUrl = getDefaultBookingUrl()

  return (
    <footer className="bg-dark text-white">
      <Container width="wide" className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <Link to={ROUTES.home} className="inline-block no-underline">
            <img src={logoUrl} alt={site.name} className="h-10 w-auto" width={140} height={44} />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{tagline}</p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-heading text-xs font-bold tracking-wide text-secondary uppercase">
            {footer.columnHeadings.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-white/80 no-underline transition-brand hover:translate-x-0.5 hover:text-secondary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-heading text-xs font-bold tracking-wide text-secondary uppercase">
            {footer.columnHeadings.services}
          </h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {serviceLinks.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-white/80 no-underline transition-brand hover:text-secondary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-heading text-xs font-bold tracking-wide text-secondary uppercase">
            {footer.columnHeadings.contact}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            <li>{contact.location}</li>
            <li>
              <a href={`tel:${contact.phone}`} className="transition-brand hover:text-secondary">
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="transition-brand hover:text-secondary">
                {contact.email}
              </a>
            </li>
          </ul>
          <div className="mt-5">
            <p className="mb-3 font-heading text-xs font-bold tracking-wide text-secondary uppercase">
              Follow us
            </p>
            <SocialChannels variant="footer" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-heading text-xs font-bold tracking-wide text-secondary uppercase">
            {footer.columnHeadings.planYourEvent}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{cta.description}</p>
          <div className="mt-5 flex flex-col gap-3">
            <Button variant="secondary" size="sm" href={bookingUrl} external>
              {getBookingLabel('bookNow')}
            </Button>
            <Button
              variant="whatsapp"
              size="sm"
              href={contact.whatsappUrl}
              external
              className="w-full justify-center"
            >
              {getBookingLabel('whatsapp')}
            </Button>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container width="wide" className="flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-white/55 sm:flex-row sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-body">{footer.taglineSuffix}</p>
        </Container>
      </div>
    </footer>
  )
}
