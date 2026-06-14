import { Navigate } from 'react-router-dom'
import {
  HOME_SECTIONS,
  LEGACY_SERVICE_ROUTE_REDIRECTS,
  ROUTES,
  servicePath,
} from '@/constants/routes'

type Props = {
  legacyKey: keyof typeof LEGACY_SERVICE_ROUTE_REDIRECTS
}

/** SPA redirect from legacy per-service URLs to /services/:slug */
export function LegacyServiceRedirect({ legacyKey }: Props) {
  const slug = LEGACY_SERVICE_ROUTE_REDIRECTS[legacyKey]
  if (!slug) {
    return <Navigate to={{ pathname: ROUTES.home, hash: HOME_SECTIONS.experiences }} replace />
  }
  return <Navigate to={servicePath(slug)} replace />
}
