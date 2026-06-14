/** Shared Framer Motion transition defaults (aligned with design-tokens motion) */
export const motionTransition = {
  default: { duration: 0.3, ease: 'easeOut' as const },
  reveal: { duration: 0.8, ease: 'easeOut' as const },
} as const

export const viewportOnce = {
  once: true,
  amount: 0.15,
} as const
