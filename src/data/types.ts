export type ServiceSellingPoint = {
  title: string
  description: string
  icon: string
}

export type ServiceAccentTint =
  | 'violet'
  | 'warm'
  | 'cool'
  | 'celebration'
  | 'community'
  | 'heritage'
  | 'cinema'

export type ServiceHero = {
  headline: string
  subheadline: string
  eyebrow?: string
  trustLine?: string
  accentTint?: ServiceAccentTint
}

export type ServiceIntro = {
  headline: string
  paragraphs: string[]
}

export type ServiceImages = {
  titleCard: string
  slider: string[]
  gallery: string[]
  /** v2 paths under src/assets/images/ (see asset-manifest.json) */
  v2?: ServiceImagesV2
}

export type ServiceImagesV2 = {
  titleCard?: string
  slider?: string[]
  gallery?: string[]
}

export type ServiceTestimonial = {
  quote: string
  attribution: string
}

export type ServiceCta = {
  headline: string
  label: string
  href: string
}

export type Service = {
  id: string
  slug: string
  legacyPath: string
  name: string
  shortDescription: string
  hero: ServiceHero
  intro: ServiceIntro
  sellingPoints: ServiceSellingPoint[]
  images: ServiceImages
  testimonial: ServiceTestimonial
  cta: ServiceCta
  eventTypes: string[]
}

export type ServicesPageAudience = {
  id: string
  label: string
  description: string
  icon: string
  relatedServiceSlug: string
}

export type ServicesPageContent = {
  hero: ServiceHero
  audiences: ServicesPageAudience[]
  galleryInvite: {
    title: string
    description: string
    primaryLabel: string
  }
}

export type ServicesData = {
  meta: {
    source: string
    generated: string
    bookingUrl: string
    corporateBookingUrl?: string
  }
  services: Service[]
  servicesPage?: ServicesPageContent
  gameCategories?: GameCategory[]
}

export type GameCategory = {
  id: string
  name: string
  description: string
  image: string
  note?: string
}

export type Testimonial = {
  id: string
  quote: string
  /** CMS review text (same as quote when loaded from CMS). */
  review?: string
  name?: string
  role?: string
  rating?: number
  /** Short outcome headline shown when case-study UI ships */
  outcome?: string
  attribution: string
  context?: 'home' | 'corporate' | 'birthday' | 'festival' | 'service'
  serviceSlug?: string
  theme?:
    | 'engagement'
    | 'participation'
    | 'team-bonding'
    | 'kids-involvement'
    | 'community-interaction'
  eventType?: string
  participantCount?: number
}

export type TestimonialsData = {
  meta: {
    source: string
    generated: string
    status?: string
    notice?: string
  }
  sections: {
    home: { title: string; subtitle: string }
    service: { title: string; subtitleTemplate: string }
  }
  items: Testimonial[]
}

export type HomeWhyUsReason = {
  title: string
  description: string
  icon: string
}

export type HomeHowItWorksStep = {
  step: string
  title: string
  description: string
}

export type HomePageContent = {
  meta: { source: string; generated: string; note?: string }
  hero: {
    headlinePrimary: string
    headlineAccent: string
    subheadline: string
    trustLine: string
    trustLinkLabel: string
  }
  whyUs: {
    title: string
    subtitle: string
    reasons: HomeWhyUsReason[]
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: HomeHowItWorksStep[]
  }
}

export type GalleryItem = {
  id: string
  legacySrc: string
  v2Src: string
  alt: string
  caption?: string
  featured?: boolean
  /** When set, shown on matching service detail gallery section */
  serviceSlug?: string
}

export type GalleryFilter = {
  id: string
  label: string
}

export type GalleryStory = {
  id: string
  title: string
  context: string
  serviceSlug: string
}

export type GalleryMetric = {
  value: string
  label: string
}

export type GalleryPageContent = {
  hero: {
    eyebrow: string
    headline: string
    subheadline: string
  }
  featuredMoments: {
    title: string
    subtitle: string
  }
  browse: {
    title: string
    subtitle: string
  }
  grid: {
    title: string
    subtitle: string
  }
  filters: GalleryFilter[]
  finalCta: {
    headline: string
    description: string
    primaryLabel: string
    secondaryLabel: string
  }
}

export type GalleryData = {
  meta: { source: string; generated: string; note?: string }
  hero: { headline: string; subheadline: string }
  items: GalleryItem[]
  page?: GalleryPageContent
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  category?: string
}

export type FaqsData = {
  meta: { source: string; generated: string; note?: string }
  items: FaqItem[]
}

export type FaqContentItem =
  | {
      id: string
      question: string
      answer: string
      category?: string
    }
  | {
      id: string
      question: string
      dynamic: true
      category?: string
    }

export type FaqsContentData = {
  meta: { source: string; generated: string; note?: string }
  sections: {
    service: { title: string; subtitle: string }
  }
  bookingFaq: { question: string; responseTime: string }
  items: FaqContentItem[]
}

export type BookingLinksData = {
  meta: { source: string; generated: string; note?: string }
  urls: { default: string; corporate: string }
  corporateServiceSlug: string
  labels: {
    bookNow: string
    book: string
    bookEvent: string
    bookYourEvent: string
    bookYourEventNow: string
    whatsapp: string
    whatsappUs: string
    exploreExperiences: string
  }
}

export type CompanyInfoData = {
  meta: { source: string; generated: string; note?: string }
  site: {
    name: string
    tagline: string
    description: string
    url: string
    locale: string
  }
  contact: {
    email: string
    phone: string
    phoneDisplay: string
    whatsappUrl: string
    location: string
    address: {
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }
  footer: {
    columnHeadings: {
      quickLinks: string
      services: string
      contact: string
      planYourEvent: string
    }
    taglineSuffix: string
  }
}

export type SocialLinkItem = {
  id: 'instagram' | 'linkedin'
  url: string
  label: string
  abbr: string
  /** @deprecated Use `lines` — kept for backward compatibility */
  tagline?: string
  lines?: string[]
}

export type SocialLinksData = {
  meta: { source: string; generated: string; note?: string }
  items: SocialLinkItem[]
}

export type TrustLogoCategoryId =
  | 'corporate'
  | 'school'
  | 'community'
  | 'partner'
  | 'client'

export type TrustLogoCategory = {
  label: string
  section: { title: string; subtitle: string }
}

export type TrustLogoPlacement = {
  enabled: boolean
  categories: TrustLogoCategoryId[]
}

export type TrustLogoItem = {
  id: string
  name: string
  category: TrustLogoCategoryId
  imagePath: string
  url?: string
  /** Optional city for local credibility */
  city?: string
}

/** @deprecated Use TrustLogoItem */
export type ClientLogoItem = TrustLogoItem

export type TrustLogosData = {
  meta: {
    source: string
    generated: string
    status?: string
    note?: string
  }
  categories: Record<TrustLogoCategoryId, TrustLogoCategory>
  placements: {
    home: TrustLogoPlacement
    about: TrustLogoPlacement
    services: TrustLogoPlacement
    gallery: TrustLogoPlacement
    corporateService: TrustLogoPlacement
  }
  items: TrustLogoItem[]
}

/** @deprecated Use TrustLogosData */
export type ClientLogosData = TrustLogosData

export type EventStoryStatus = 'draft' | 'published' | 'archived'

export type EventStoryAudience =
  | 'corporate'
  | 'school'
  | 'community'
  | 'birthday'
  | 'wedding'
  | 'festival'
  | 'social'

export type EventStoryItem = {
  id: string
  status: EventStoryStatus
  title: string
  location: {
    city: string
    venue?: string
    state?: string
  }
  audience: EventStoryAudience
  participants?: number
  serviceSlug: string
  date?: string
  story: string
  outcomes: string[]
  photoIds: string[]
  featured?: boolean
}

export type EventStoriesData = {
  meta: {
    source: string
    generated: string
    status?: string
    note?: string
  }
  section: { title: string; subtitle: string }
  items: EventStoryItem[]
}

export type GalleryStoriesData = {
  meta: { source: string; generated: string; note?: string }
  title: string
  subtitle: string
  itemEyebrow: string
  serviceLinkTemplate: string
  items: GalleryStory[]
}

export type NavLink = {
  label: string
  to: string
}

export type FooterLinkGroup = {
  title: string
  links: NavLink[]
}

export type NavigationData = {
  meta: { source: string; generated: string }
  main: NavLink[]
  footer: {
    tagline: string
    quickLinks: NavLink[]
    serviceLinks: NavLink[]
    cta: { headline: string; description: string }
  }
}

export type AssetManifestEntry = {
  legacyPath: string
  v2Path: string
  status: 'keep' | 'optimize' | 'remove' | 'missing'
  category: 'branding' | 'services' | 'gallery' | 'marketing'
  serviceSlug?: string
  note?: string
}

export type AssetManifest = {
  meta: { generated: string; note: string }
  entries: AssetManifestEntry[]
}

export type AboutMilestone = {
  era: string
  title: string
  summary: string
}

export type AboutPlayPillar = {
  id: string
  title: string
  description: string
  icon: string
}

export type AboutMetric = {
  value: string
  label: string
}

export type SiteMetricId =
  | 'events-hosted'
  | 'participants'
  | 'games-conducted'
  | 'cities-served'

export type SiteMetric = {
  id: SiteMetricId
  value: string
  label: string
}

export type SiteStatsData = {
  meta: { source: string; generated: string; note?: string }
  metrics: SiteMetric[]
  sections: {
    home: { title: string; subtitle: string }
  }
  homeGalleryTeaser?: {
    title: string
    subtitle: string
    primaryLabel: string
    linkLabel: string
    maxItems: number
  }
}

export type AboutDifferentiator = {
  id: string
  title: string
  tagline: string
  description: string
  icon: string
}

export type AboutAudience = {
  id: string
  label: string
  description: string
  icon: string
  serviceSlug: string
}

export type AboutPageContent = {
  meta: { source: string; generated: string }
  hero: {
    eyebrow: string
    headline: string
    subheadline: string
    trustLine: string
  }
  story: {
    title: string
    lead: string
    paragraphs: string[]
    milestones: AboutMilestone[]
  }
  believeInPlay: {
    title: string
    subtitle: string
    pillars: AboutPlayPillar[]
  }
  galleryInvite: {
    title: string
    description: string
    primaryLabel: string
  }
  experiencesInvite: {
    title: string
    description: string
    primaryLabel: string
    secondaryLabel: string
    secondaryHref: string
  }
  finalCta: {
    headline: string
    description: string
    primaryLabel: string
    secondaryLabel: string
  }
}
