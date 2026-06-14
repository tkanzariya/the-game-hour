import clientLogosJson from '@/data/content/client-logos.json'
import type { TrustLogoCategoryId, TrustLogosData } from '@/data/types'

const trustLogosData = clientLogosJson as TrustLogosData

export function getTrustLogosContent() {
  return trustLogosData
}

/** @deprecated Use getTrustLogosContent */
export const getClientLogosContent = getTrustLogosContent

export function getTrustLogos() {
  return trustLogosData.items
}

/** @deprecated Use getTrustLogos */
export const getClientLogos = getTrustLogos

export function getTrustLogosByCategory(category: TrustLogoCategoryId) {
  return trustLogosData.items.filter((item) => item.category === category)
}

export function getTrustLogoCategory(category: TrustLogoCategoryId) {
  return trustLogosData.categories[category]
}

export function getTrustLogoPlacement(page: keyof TrustLogosData['placements']) {
  return trustLogosData.placements[page]
}

export function hasTrustLogos(category?: TrustLogoCategoryId): boolean {
  if (category) {
    return getTrustLogosByCategory(category).length > 0
  }
  return trustLogosData.items.length > 0
}

/** @deprecated Use hasTrustLogos */
export const hasClientLogos = hasTrustLogos

export function shouldShowTrustLogos(page: keyof TrustLogosData['placements']): boolean {
  const placement = getTrustLogoPlacement(page)
  if (!placement.enabled) return false
  return placement.categories.some((category) => getTrustLogosByCategory(category).length > 0)
}
