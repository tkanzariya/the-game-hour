import {
  getGalleryItemsByIds,
  getGalleryPageContent,
  type ResolvedGalleryImage,
} from '@/lib/gallery'
import { getGalleryStoriesContent } from '@/lib/content/gallery-stories'

export function getGalleryHero() {
  return getGalleryPageContent().hero
}

export function getGalleryFeaturedMoments() {
  const section = getGalleryPageContent().featuredMoments
  const images = getGalleryItemsByIds(section.itemIds)
  return { ...section, images }
}

export function getGalleryBrowse() {
  return getGalleryPageContent().browse
}

export function getGalleryGridIntro() {
  return getGalleryPageContent().grid
}

export function getGalleryFilters() {
  return getGalleryPageContent().filters
}

export function getGalleryStories() {
  return getGalleryStoriesContent()
}

export function getGalleryFinalCta() {
  return getGalleryPageContent().finalCta
}

export type { ResolvedGalleryImage }
