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

/** Build path for a service detail page */
export function servicePath(slug: string): string {
  return `/services/${slug}`
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
