import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import ImageLightbox from './ImageLightbox'
import type { LightboxItem, OpenLightboxOptions } from './types'

type LightboxContextValue = {
  isOpen: boolean
  items: LightboxItem[]
  index: number
  open: (options: OpenLightboxOptions) => void
  close: () => void
  goTo: (index: number) => void
  goNext: () => void
  goPrev: () => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

type LightboxProviderProps = {
  children: ReactNode
}

export function LightboxProvider({ children }: LightboxProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<LightboxItem[]>([])
  const [index, setIndex] = useState(0)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback((options: OpenLightboxOptions) => {
    if (options.items.length === 0) return
    triggerRef.current = document.activeElement as HTMLElement | null
    const nextIndex = Math.min(
      Math.max(options.index ?? 0, 0),
      options.items.length - 1,
    )
    setItems(options.items)
    setIndex(nextIndex)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
      triggerRef.current = null
    })
  }, [])

  const goTo = useCallback(
    (nextIndex: number) => {
      if (items.length === 0) return
      setIndex((nextIndex + items.length) % items.length)
    },
    [items.length],
  )

  const goNext = useCallback(() => {
    goTo(index + 1)
  }, [goTo, index])

  const goPrev = useCallback(() => {
    goTo(index - 1)
  }, [goTo, index])

  const value = useMemo(
    () => ({
      isOpen,
      items,
      index,
      open,
      close,
      goTo,
      goNext,
      goPrev,
    }),
    [close, goNext, goPrev, goTo, index, isOpen, items, open],
  )

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <ImageLightbox />
    </LightboxContext.Provider>
  )
}

export function useLightbox() {
  const context = useContext(LightboxContext)
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider')
  }
  return context
}

/** Safe hook for optional lightbox usage outside provider (returns null). */
export function useLightboxOptional() {
  return useContext(LightboxContext)
}
