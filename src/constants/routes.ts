/**
 * Canonical routes, single source for router, navigation, and links.
 * Import from `@/constants/routes` (not `@/utils/routes`).
 */
export const ROUTES = {
  home: '/',
  about: '/about',
  serviceDetail: '/services/:slug',
  gallery: '/gallery',
  contact: '/contact',
  book: '/book',
  bookSocial: '/book/social',
  bookCorporate: '/book/corporate',
  ops: '/ops',
  opsLogin: '/ops/login',
  opsEvents: '/ops/events',
  opsCalendar: '/ops/calendar',
  opsPayments: '/ops/payments',
  opsFinance: '/ops/finance',
  opsTeam: '/ops/team',
  opsGames: '/ops/games',
  opsInquiries: '/ops/inquiries',
  opsInventory: '/ops/inventory',
  opsInquiryNew: '/ops/inquiries/new',
  chooseGames: '/choose-games',
  opsSettings: '/ops/settings',
  gameLibrary: '/game-library',
  designPreview: '/design-preview',
  newUiPreview: '/new-ui-preview',
  themePreviewCoral: '/theme-preview/coral',
} as const

/** Homepage section IDs for hash navigation (service discovery). */
export const HOME_SECTIONS = {
  experiences: 'experiences',
} as const

export const homeExperiencesPath = `${ROUTES.home}#${HOME_SECTIONS.experiences}` as const

/**
 * Public URL slugs that differ from the service slug. The service slug is also the
 * CMS image key prefix and asset folder, so it stays as it is and only the URL changes.
 */
const SERVICE_URL_SLUGS: Record<string, string> = {
  'school-and-collage-event': 'school-and-college-events',
}

/** Service slug → the slug shown in the URL */
export function serviceUrlSlug(slug: string): string {
  return SERVICE_URL_SLUGS[slug] ?? slug
}

/** URL slug → service slug (accepts either form) */
export function serviceSlugFromUrl(urlSlug: string | undefined): string | undefined {
  if (!urlSlug) return undefined
  const match = Object.keys(SERVICE_URL_SLUGS).find((slug) => SERVICE_URL_SLUGS[slug] === urlSlug)
  return match ?? urlSlug
}

/** Old URL slugs that now live at a new address: old → new */
export const RENAMED_SERVICE_URL_SLUGS: Readonly<Record<string, string>> = SERVICE_URL_SLUGS

/** Build path for a service detail page */
export function servicePath(slug: string): string {
  return `/services/${serviceUrlSlug(slug)}`
}

export function isBookingPath(pathname: string): boolean {
  return pathname === ROUTES.book || pathname.startsWith(`${ROUTES.book}/`)
}

export function bookingSearch(category: 'social' | 'corporate'): string {
  return `?category=${category}`
}

/**
 * Legacy per-service URLs → canonical slugs (301-style redirects in SPA).
 * @see services.json `slug` field
 */
export const LEGACY_SERVICE_ROUTE_REDIRECTS: Record<string, string> = {
  'corporate-events': 'corporate-games',
  'birthday-events': 'birthday-games',
  'school-events': 'school-and-collage-event',
  'traditional-games': 'traditional-games',
  'wedding-events': 'wedding-or-haldi-games',
  'social-gathering': 'social-gathering-games',
  'game-festival': 'game-festival',
  bollywood: 'bollywood-games',
}

export type StaticRoute = (typeof ROUTES)[keyof typeof ROUTES]
