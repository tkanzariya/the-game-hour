import socialJson from '@/data/content/social-links.json'
import type { SocialLinkItem, SocialLinksData } from '@/data/types'

const socialData = socialJson as SocialLinksData

export function getSocialLinks(): SocialLinkItem[] {
  return socialData.items
}

export function getSocialLink(id: SocialLinkItem['id']) {
  return socialData.items.find((item) => item.id === id)
}

/** Record shape for legacy SOCIAL constant consumers. */
export function getSocialUrlsRecord(): Record<string, string> {
  return Object.fromEntries(socialData.items.map((item) => [item.id, item.url]))
}

export function getSocialMessagingLines(link: SocialLinkItem): string[] {
  if (link.lines?.length) return link.lines
  if (link.tagline) return [link.tagline]
  return []
}
