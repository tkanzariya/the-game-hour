import { useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { FaqItem } from '@/data/types'

type FaqAccordionProps = {
  items: FaqItem[]
  className?: string
}

export default function FaqAccordion({ items, className }: FaqAccordionProps) {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id
        const panelId = `${baseId}-${item.id}-panel`
        const triggerId = `${baseId}-${item.id}-trigger`

        return (
          <article
            key={item.id}
            className="surface-clay overflow-hidden rounded-2xl border border-white/50"
          >
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-heading text-base font-bold text-primary transition-brand hover:text-secondary-emphasis md:px-6 md:py-5 md:text-lg"
              >
                <span>{item.question}</span>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition-transform duration-300',
                    isOpen && 'rotate-45 surface-accent-soft text-on-accent-subtle',
                  )}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-surface-muted px-5 pb-5 font-body text-sm leading-relaxed text-accent-muted-grey md:px-6 md:pb-6 md:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        )
      })}
    </div>
  )
}
