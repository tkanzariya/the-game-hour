import type { ServiceAccentTint } from '@/data/types'

/** Subtle hero radial accent colors — stays within brand violet family. */
const ACCENT_COLORS: Record<ServiceAccentTint, string> = {
  violet: 'var(--color-secondary)',
  warm: '#C084FC',
  cool: '#818CF8',
  celebration: '#E879F9',
  community: '#A78BFA',
  heritage: '#9333EA',
  cinema: '#D946EF',
}

export function getServiceAccentColor(tint?: ServiceAccentTint): string {
  return ACCENT_COLORS[tint ?? 'violet']
}
