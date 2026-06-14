import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useLightbox } from './LightboxContext'

const SWIPE_THRESHOLD = 60

export default function ImageLightbox() {
  const { isOpen, items, index, close, goNext, goPrev } = useLightbox()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  const current = items[index]
  const hasMultiple = items.length > 1
  const displaySrc = current?.srcFull ?? current?.src

  useEffect(() => {
    if (!isOpen) {
      setLoadedSrc(null)
      return
    }
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !displaySrc) {
      setLoadedSrc(null)
      return
    }
    setLoadedSrc(null)
    const img = new Image()
    img.src = displaySrc
    img.onload = () => setLoadedSrc(displaySrc)
    return () => {
      img.onload = null
    }
  }, [displaySrc, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowRight' && hasMultiple) {
        event.preventDefault()
        goNext()
        return
      }
      if (event.key === 'ArrowLeft' && hasMultiple) {
        event.preventDefault()
        goPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, goNext, goPrev, hasMultiple, isOpen])

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusable.length === 0) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    dialog.addEventListener('keydown', trapFocus)
    return () => dialog.removeEventListener('keydown', trapFocus)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <motion.button
            type="button"
            aria-label="Close image viewer"
            className="absolute inset-0 bg-primary/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4 px-1">
              {hasMultiple ? (
                <p className="font-body text-sm font-medium text-white/80">
                  {index + 1} of {items.length}
                </p>
              ) : (
                <span />
              )}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="surface-clay flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-primary shadow-glow-accent transition-brand hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="relative">
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute top-1/2 left-2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full surface-clay border border-white/20 text-primary shadow-card transition-brand hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:flex"
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M14 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute top-1/2 right-2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full surface-clay border border-white/20 text-primary shadow-card transition-brand hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:flex"
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M10 6l6 6-6 6" />
                    </svg>
                  </button>
                </>
              )}

              <motion.figure
                key={`${index}-${displaySrc}`}
                drag={hasMultiple ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (!hasMultiple) return
                  if (info.offset.x <= -SWIPE_THRESHOLD) goNext()
                  else if (info.offset.x >= SWIPE_THRESHOLD) goPrev()
                }}
                className="image-frame overflow-hidden rounded-3xl bg-black/20 shadow-glow-accent"
              >
                <div className="relative flex min-h-[40vh] max-h-[75vh] items-center justify-center md:max-h-[78vh]">
                  {!loadedSrc && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden
                    >
                      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-secondary" />
                    </div>
                  )}
                  {loadedSrc && (
                    <motion.img
                      src={loadedSrc}
                      alt={current.alt}
                      className={cn(
                        'max-h-[75vh] w-full object-contain md:max-h-[78vh]',
                        loadedSrc ? 'opacity-100' : 'opacity-0',
                      )}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      draggable={false}
                    />
                  )}
                </div>
                {current.caption && (
                  <figcaption className="border-t border-white/10 bg-primary/40 px-5 py-4 text-center font-body text-sm leading-relaxed text-white/90 md:text-base">
                    {current.caption}
                  </figcaption>
                )}
              </motion.figure>
            </div>

            {hasMultiple && (
              <p className="mt-3 text-center font-body text-xs text-white/60 md:hidden">
                Swipe left or right to browse
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
