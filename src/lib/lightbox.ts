import type { LightboxItem } from '@/components/ImageLightbox'

type LightboxSource = {
  src: string
  alt: string
  caption?: string
  srcFull?: string
}

/** Build a lightbox gallery array from showcase images. */
export function toLightboxGallery(items: LightboxSource[]): LightboxItem[] {
  return items.map((item) => ({
    src: item.src,
    alt: item.alt,
    caption: item.caption,
    srcFull: item.srcFull,
  }))
}
