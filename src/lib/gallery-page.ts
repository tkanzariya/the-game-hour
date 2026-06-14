import {
  GALLERY_FEATURED_CMS_KEYS,
  GALLERY_STORY_CMS_KEYS,
} from '@/data/image-keys'
import { getImageByKey } from '@/lib/assets'
import { getGalleryPageContent, type ResolvedGalleryImage } from '@/lib/gallery'
import { getGalleryStoriesContent } from '@/lib/content/gallery-stories'

export function getGalleryHero() {
  return getGalleryPageContent().hero
}

export function getGalleryFeaturedMoments() {
  const section = getGalleryPageContent().featuredMoments
  const images: ResolvedGalleryImage[] = GALLERY_FEATURED_CMS_KEYS.map((key, index) => ({
    id: key,
    src: getImageByKey(key),
    alt: `Featured moment ${index + 1}`,
  }))
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
  const content = getGalleryStoriesContent()
  const storyImages = GALLERY_STORY_CMS_KEYS.map((key, index) => ({
    key,
    src: getImageByKey(key),
    alt: content.items[index]?.title ?? `Gallery story ${index + 1}`,
  }))
  return { ...content, storyImages }
}

export function getGalleryFinalCta() {
  return getGalleryPageContent().finalCta
}

export type { ResolvedGalleryImage }
