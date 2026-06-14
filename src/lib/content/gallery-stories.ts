import galleryStoriesJson from '@/data/content/gallery-stories.json'
import type { GalleryStoriesData } from '@/data/types'

const galleryStoriesData = galleryStoriesJson as GalleryStoriesData

export function getGalleryStoriesContent() {
  return galleryStoriesData
}

export function getGalleryStoryServiceLinkLabel(serviceName: string): string {
  return galleryStoriesData.serviceLinkTemplate.replace('{{serviceName}}', serviceName)
}
