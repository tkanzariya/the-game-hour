import { FEATURE_FLAGS } from '@/utils/constants'

/** Future: fixed WhatsApp action, disabled until UI phase */
export default function WhatsAppButton() {
  if (!FEATURE_FLAGS.whatsappButton) return null
  return <div aria-hidden>WhatsApp button placeholder</div>
}
