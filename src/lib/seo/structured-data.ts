import type { FaqItem } from '@/data/types'
import { getContactInfo, getContactPostalAddress, getSiteInfo } from '@/lib/content/company'
import { getSocialUrlsRecord } from '@/lib/content/social'
import { getDefaultOgImageUrl } from '@/lib/seo/og-images'

type JsonLd = Record<string, unknown>

function postalAddressSchema() {
  const address = getContactPostalAddress()
  return {
    '@type': 'PostalAddress',
    streetAddress: address.streetAddress,
    addressLocality: address.addressLocality,
    addressRegion: address.addressRegion,
    postalCode: address.postalCode,
    addressCountry: address.addressCountry,
  }
}

export function buildOrganizationSchema(): JsonLd {
  const site = getSiteInfo()
  const contact = getContactInfo()
  const social = getSocialUrlsRecord()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: getDefaultOgImageUrl(),
    description: site.description,
    email: contact.email,
    telephone: contact.phone,
    address: postalAddressSchema(),
    sameAs: [social.instagram, social.linkedin].filter(Boolean),
  }
}

export function buildLocalBusinessSchema(): JsonLd {
  const site = getSiteInfo()
  const contact = getContactInfo()
  const social = getSocialUrlsRecord()

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    image: getDefaultOgImageUrl(),
    url: site.url,
    telephone: contact.phone,
    email: contact.email,
    description: site.description,
    address: postalAddressSchema(),
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Gujarat, India',
    },
    sameAs: [social.instagram, social.linkedin].filter(Boolean),
  }
}

export function buildFaqPageSchema(faqs: FaqItem[]): JsonLd | null {
  if (faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function buildSiteStructuredData(): JsonLd[] {
  return [buildOrganizationSchema(), buildLocalBusinessSchema()]
}
