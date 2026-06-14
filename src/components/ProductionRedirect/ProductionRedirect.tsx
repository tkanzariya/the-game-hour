import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

type ProductionRedirectProps = {
  to?: string
}

/** Redirects dev-only routes to home in production builds. */
export function ProductionRedirect({ to = ROUTES.home }: ProductionRedirectProps) {
  return <Navigate to={to} replace />
}
