import { FEATURE_FLAGS } from '@/utils/constants'

/** Future: sticky book-now / enquiry CTA, disabled until UI phase */
export default function FloatingCTA() {
  if (!FEATURE_FLAGS.floatingCta) return null
  return <div aria-hidden>Floating CTA placeholder</div>
}
