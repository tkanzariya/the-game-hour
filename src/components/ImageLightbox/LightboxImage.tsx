import type { ImgHTMLAttributes, MouseEvent } from 'react'
import { cn } from '@/utils/cn'
import { useLightbox } from './LightboxContext'
import type { LightboxItem } from './types'

type LightboxImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string
  alt: string
  caption?: string
  /** Full-resolution URL loaded only when lightbox opens */
  srcFull?: string
  /** Gallery for prev/next navigation; defaults to single image */
  gallery?: LightboxItem[]
  galleryIndex?: number
  wrapperClassName?: string
  showExpandIcon?: boolean
  /** Disable lightbox for decorative/non-interactive images */
  enableLightbox?: boolean
}

function ExpandIcon() {
  return (
    <span
      className="pointer-events-none absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full surface-accent text-on-accent-subtle opacity-0 shadow-glow-accent transition-brand group-hover/lightbox:opacity-100 group-focus-visible/lightbox:opacity-100"
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    </span>
  )
}

export default function LightboxImage({
  src,
  alt,
  caption,
  srcFull,
  gallery,
  galleryIndex = 0,
  className,
  wrapperClassName,
  showExpandIcon = true,
  enableLightbox = true,
  ...imgProps
}: LightboxImageProps) {
  const { open } = useLightbox()

  const items: LightboxItem[] =
    gallery ??
    [
      {
        src,
        alt,
        caption,
        srcFull,
      },
    ]

  const index =
    gallery && gallery.length > 0
      ? Math.min(Math.max(galleryIndex, 0), gallery.length - 1)
      : 0

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (!enableLightbox) return
    event.stopPropagation()
    open({ items, index })
  }

  if (!enableLightbox) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        {...imgProps}
      />
    )
  }

  return (
    <button
      type="button"
      className={cn(
        'lightbox-trigger group/lightbox relative block w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
        wrapperClassName,
      )}
      onClick={handleOpen}
      aria-label={`View fullscreen: ${alt}`}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition-brand duration-500 group-hover/lightbox:scale-[1.04] group-focus-visible/lightbox:scale-[1.02]',
          className,
        )}
        draggable={false}
        {...imgProps}
      />
      {showExpandIcon && <ExpandIcon />}
    </button>
  )
}
