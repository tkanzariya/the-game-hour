/**
 * @deprecated Import from `@/constants/routes` and `@/lib/navigation` instead.
 * Re-exports kept for gradual migration.
 */
export {
  ROUTES,
  servicePath,
  LEGACY_SERVICE_ROUTE_REDIRECTS,
  type StaticRoute,
} from '@/constants/routes'

import { getMainNavLinks } from '@/lib/navigation'

/** @deprecated Use getMainNavLinks() from navigation.json */
export const NAV_LINKS = getMainNavLinks()

export type AppRoute = string
