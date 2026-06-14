import servicesJson from './services.json'
import navigationJson from './navigation.json'
import galleryJson from './gallery.json'
import aboutJson from './about.json'
import assetManifestJson from './asset-manifest.json'

export { ASSET_MAP, getServiceAssets, resolveAssetPath, PUBLIC_ASSETS } from './asset-map'
export type { AssetEntry, ServiceAssets, ServiceSlug, ImageFormats } from './asset-map'
import type {
  AboutPageContent,
  AssetManifest,
  GalleryData,
  NavigationData,
  ServicesData,
} from './types'

export const servicesData = servicesJson as ServicesData
export const navigationData = navigationJson as NavigationData
export const galleryData = galleryJson as GalleryData
export const aboutData = aboutJson as AboutPageContent
export const assetManifest = assetManifestJson as AssetManifest

export * from './types'
