import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import type { Service } from '@/data/types'
import { getBookingLabel } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import { resolveServiceCtaHref } from '@/lib/services'

type ServiceStickyCtaProps = {
  service: Service
}

export default function ServiceStickyCta({ service }: ServiceStickyCtaProps) {
  const bookHref = resolveServiceCtaHref(service)
  const contact = getContactInfo()
  const bookLabel = service.cta.label

  return (
    <motion.aside
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.35 }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-primary/95 px-4 py-3 shadow-fab backdrop-blur-md md:left-auto md:right-6 md:bottom-6 md:max-w-sm md:rounded-2xl md:border md:border-white/15 md:px-5 md:py-4"
      aria-label="Quick booking actions"
    >
      <p className="mb-2 hidden text-center text-xs font-semibold text-white/90 md:block">
        {service.name}
      </p>
      <div className="flex gap-2 md:flex-col md:gap-3">
        <Button
          variant="primary"
          size="md"
          href={bookHref}
          external={bookHref.startsWith('http')}
          className="min-h-11 flex-1 !surface-accent !text-on-accent !shadow-fab hover:!brightness-105 hover:!shadow-glow-accent active:!scale-[0.98] active:!translate-y-px md:w-full"
        >
          <span className="line-clamp-2 text-center text-sm font-bold leading-snug md:line-clamp-none">
            {bookLabel}
          </span>
        </Button>
        <Button
          variant="whatsapp"
          size="md"
          href={contact.whatsappUrl}
          external
          className="min-h-11 flex-1 hover:brightness-105 active:scale-[0.98] md:w-full"
        >
          {getBookingLabel('whatsapp')}
        </Button>
      </div>
    </motion.aside>
  )
}
