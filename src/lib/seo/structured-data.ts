import type { FaqItem } from '@/data/types'
import { getContactInfo, getSiteInfo } from '@/lib/content/company'
import { getSocialUrlsRecord } from '@/lib/content/social'
import { getDefaultOgImageUrl } from '@/lib/seo/og-images'

type JsonLd = Record<string, unknown>

function parseLocation(location: string): {
  locality: string
  region: string
  country: string
} {
  const parts = location.split(',').map((p) => p.trim())
  return {
    locality: parts[0] ?? 'Ahmedabad',
    region: parts[1] ?? 'Gujarat',
    country: parts[2] === 'India' ? 'IN' : (parts[2] ?? 'IN'),
  }
}

export function buildOrganizationSchema(): JsonLd {
  const site = getSiteInfo()
  const contact = getContactInfo()
  const social = getSocialUrlsRecord()
  const { locality, region, country } = parseLocation(contact.location)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: getDefaultOgImageUrl(),
    description: site.description,
    email: contact.email,
    telephone: contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: region,
      addressCountry: country,
    },
    sameAs: [social.instagram, social.linkedin].filter(Boolean),
  }
}

export function buildLocalBusinessSchema(): JsonLd {
  const site = getSiteInfo()
  const contact = getContactInfo()
  const social = getSocialUrlsRecord()
  const { locality, region, country } = parseLocation(contact.location)

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    image: getDefaultOgImageUrl(),
    url: site.url,
    telephone: contact.phone,
    email: contact.email,
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: region,
      addressCountry: country,
    },
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
