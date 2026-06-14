import { ICON_PATHS } from '@/components/Icon/icons'

/** Normalize content icon keys to registered SVG icon names. */
const ICON_ALIASES: Record<string, string> = {
  default: 'check',
  'user-tie': 'user-tie',
  'box-open': 'box-open',
  'people-arrows': 'people-arrows',
  'list-check': 'list-check',
  'users-cog': 'users-cog',
  'people-carry': 'people-carry',
  'calendar-check': 'calendar-check',
  'flag-checkered': 'flag-checkered',
  'chart-bar': 'chart-bar',
  'hand-holding-heart': 'hand-holding-heart',
  'puzzle-piece': 'puzzle-piece',
  'clipboard-list': 'clipboard-list',
  'map-pin': 'map-pin',
  'graduation-cap': 'graduation-cap',
  'phone-off': 'phone-off',
  celebration: 'party',
  engagement: 'target',
  facilitator: 'microphone',
  teamwork: 'handshake',
  community: 'community',
  corporate: 'building',
  kids: 'cake',
  schools: 'graduation-cap',
  weddings: 'ring',
  societies: 'community',
}

export function resolveIconName(iconKey: string): string {
  if (iconKey in ICON_PATHS) return iconKey
  return ICON_ALIASES[iconKey] ?? 'check'
}

export function hasIcon(iconKey: string): boolean {
  const resolved = resolveIconName(iconKey)
  return resolved in ICON_PATHS
}

/** @deprecated Use resolveIconName + Icon component */
export function getSellingPointIcon(_iconKey: string): string {
  return resolveIconName(_iconKey)
}
