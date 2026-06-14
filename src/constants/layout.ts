/**
 * Layout width strategy — single source for section profiles.
 * @see docs/operations/LAYOUT_SYSTEM_AUDIT.md
 */

import type { ContainerWidth } from '@/components/Container'

export type LayoutProfile = 'default' | 'marketing'

export type FloatDensity = 'default' | 'open'

export const LAYOUT_PROFILE = {
  /** Legacy narrow shell — design preview, admin-style pages */
  default: {
    width: 'default' as ContainerWidth,
    floatDensity: 'default' as FloatDensity,
  },
  /** Production marketing pages — homepage, services, service detail, placeholders */
  marketing: {
    width: 'wide' as ContainerWidth,
    floatDensity: 'open' as FloatDensity,
  },
} as const

/** Resolve Section width + float density from optional profile override */
export function resolveLayoutProfile(
  profile: LayoutProfile = 'default',
  overrides?: { width?: ContainerWidth; floatDensity?: FloatDensity },
) {
  const base = LAYOUT_PROFILE[profile]
  return {
    width: overrides?.width ?? base.width,
    floatDensity: overrides?.floatDensity ?? base.floatDensity,
  }
}
