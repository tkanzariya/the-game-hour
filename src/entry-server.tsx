/**
 * Build-time renderer for the public pages (used by scripts/prerender.mjs).
 * Renders the same tree as src/main.tsx so the browser can hydrate the result.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom'
import { ROUTES, servicePath } from '@/constants/routes'
import { getServiceSlugs } from '@/lib/services'
import { publicRoutes } from '@/public-routes'
import { SITE } from '@/utils/constants'

export const siteUrl = SITE.url

/** A path no page uses: renders the not-found page for 404.html. */
export const notFoundPath = '/404'

/** Indexable pages, in sitemap order. Add a public page here to prerender it. */
export const prerenderPages: { path: string; changefreq: string; priority: string }[] =
  [
    { path: ROUTES.home, changefreq: 'weekly', priority: '1.0' },
    { path: ROUTES.about, changefreq: 'monthly', priority: '0.8' },
    { path: ROUTES.gallery, changefreq: 'weekly', priority: '0.8' },
    { path: ROUTES.contact, changefreq: 'monthly', priority: '0.7' },
    ...getServiceSlugs().map((slug) => ({
      path: servicePath(slug),
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ]

export async function render(path: string): Promise<string> {
  const handler = createStaticHandler(publicRoutes)
  const context = await handler.query(new Request(`${siteUrl}${path}`))
  if (context instanceof Response) {
    throw new Error(`Prerender: ${path} answered with a redirect, not a page`)
  }
  const router = createStaticRouter(handler.dataRoutes, context)

  return renderToString(
    <StrictMode>
      <HelmetProvider>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </HelmetProvider>
    </StrictMode>,
  )
}
