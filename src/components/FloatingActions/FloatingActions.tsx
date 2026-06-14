import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { getBookingLabel, getDefaultBookingUrl } from '@/lib/content/booking'
import { getContactInfo } from '@/lib/content/company'
import { FEATURE_FLAGS } from '@/utils/constants'

type FloatingActionsProps = {
  preview?: boolean
}

const fabIconClass =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-on-accent shadow-fab transition-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary'

export default function FloatingActions({ preview = false }: FloatingActionsProps) {
  if (!preview && !FEATURE_FLAGS.floatingCta) return null

  const contact = getContactInfo()
  const bookingUrl = getDefaultBookingUrl()
  const bookLabel = getBookingLabel('bookNow')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2.5 sm:right-4 sm:bottom-4 md:gap-3"
      aria-label="Quick contact actions"
    >
      <motion.a
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98, y: 0 }}
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-secondary/80 surface-accent px-5 py-3 text-sm font-bold text-on-accent shadow-fab transition-brand hover:shadow-glow-accent hover:brightness-105 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
          'max-w-[calc(100vw-1.5rem)] sm:min-w-[8.5rem]',
        )}
        aria-label={bookLabel}
      >
        <span aria-hidden className="text-base">
          ✦
        </span>
        <span className="whitespace-nowrap">{bookLabel}</span>
      </motion.a>

      <div className="flex gap-2.5">
        {(preview || FEATURE_FLAGS.whatsappButton) && (
          <motion.a
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(fabIconClass, 'bg-whatsapp hover:shadow-glow-accent active:brightness-95')}
            aria-label={getBookingLabel('whatsappUs')}
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.a>
        )}

        {(preview || FEATURE_FLAGS.callButton) && (
          <motion.a
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            href={`tel:${contact.phone}`}
            className={cn(
              fabIconClass,
              'bg-primary text-on-accent hover:bg-primary-600 active:brightness-95',
            )}
            aria-label="Call us"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </motion.a>
        )}
      </div>

      {preview && (
        <p className="rounded-xl bg-dark/90 px-3 py-1.5 text-center text-[10px] font-medium text-white/90">
          Preview · flags off in prod
        </p>
      )}
    </motion.div>
  )
}
