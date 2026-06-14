#!/usr/bin/env node
/**
 * Verify CMS image mapping resolution (Node-side, no PHP required).
 * Run: node scripts/verify-cms-mapping.mjs
 */
import assert from 'node:assert/strict'
import {
  FALLBACK_PATH_TO_IMAGE_KEYS,
  IMAGE_KEY_REGISTRY,
  resolveCanonicalCmsKey,
} from '../src/data/image-keys.ts'

const CRITICAL = [
  {
    label: 'Homepage Hero Banner',
    key: 'homepage-hero',
    path: 'homepage/hero.webp',
    component: 'HomeHero',
  },
  {
    label: 'About Section Image',
    key: 'homepage-about-teaser',
    path: 'homepage/about-teaser.webp',
    component: 'AboutStory',
  },
  {
    label: 'Gallery Page Hero Banner',
    key: 'gallery-hero',
    path: 'gallery/gallery-hero.webp',
    component: 'GalleryHero',
  },
  {
    label: 'Homepage Gallery Teaser 1',
    key: 'homepage-moment-1',
    path: 'gallery/moments/moment-1.webp',
    component: 'HomeGalleryMoments',
  },
  {
    label: 'Gallery Event Photo 1',
    key: 'gallery-1',
    path: 'gallery/event-gallery-1.webp',
    component: 'gallery.ts',
  },
]

let failed = 0

for (const row of CRITICAL) {
  const meta = IMAGE_KEY_REGISTRY[row.key]
  if (!meta) {
    console.error('FAIL missing registry key:', row.key)
    failed++
    continue
  }
  if (meta.fallback !== row.path) {
    console.error('FAIL fallback mismatch', row.key, meta.fallback, '!=', row.path)
    failed++
    continue
  }
  const keys = FALLBACK_PATH_TO_IMAGE_KEYS[row.path] ?? []
  if (!keys.includes(row.key)) {
    console.error('FAIL path lookup missing key', row.path, keys)
    failed++
    continue
  }
  console.log('OK', row.label, '→', row.key, '→', row.path)
}

const alias = resolveCanonicalCmsKey('birthday-hero')
assert.equal(alias, 'birthday-games-slider-1', 'birthday-hero alias')
console.log('OK birthday-hero alias → birthday-games-slider-1')

console.log('')
console.log('Registry keys:', Object.keys(IMAGE_KEY_REGISTRY).length)
console.log(failed === 0 ? 'All critical mappings verified.' : `${failed} mapping error(s).`)
process.exit(failed > 0 ? 1 : 0)
