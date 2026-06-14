import { navigationData } from '@/data'

export function getMainNavLinks() {
  return navigationData.main
}

export function getFooterQuickLinks() {
  return navigationData.footer.quickLinks
}

export function getFooterServiceLinks() {
  return navigationData.footer.serviceLinks
}

export function getFooterTagline() {
  return navigationData.footer.tagline
}

export function getFooterCta() {
  return navigationData.footer.cta
}
