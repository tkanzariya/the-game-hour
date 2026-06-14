#!/usr/bin/env node
/**
 * Verify CMS image mapping resolution (Node-side, no PHP required).
 * Run: node scripts/verify-cms-mapping.mjs
 */
import assert from 'node:assert/strict'
import {
  FALLBACK_PATH_TO_IMAGE_KEYS,
  GALLERY_EVENT_MOMENT_CMS_KEYS,
  GALLERY_FEATURED_CMS_KEYS,
  GALLERY_STORY_CMS_KEYS,
  IMAGE_KEY_REGISTRY,
  resolveCanonicalCmsKey,
} from '../src/data/image-keys.ts'

const CRITICAL = [
  { label: 'Home hero', key: 'homepage-hero', path: 'homepage/hero.webp' },
  { label: 'Gallery hero', key: 'gallery-hero', path: 'gallery/gallery-hero.webp' },
  { label: 'Gallery featured 1', key: 'gallery-featured-1', path: 'gallery/moments/moment-1.webp' },
  { label: 'Gallery event moment 1', key: 'gallery-event-moment-1', path: 'gallery/event-gallery-1.webp' },
  { label: 'Gallery story 1', key: 'gallery-story-1', path: 'gallery/event-gallery-2.webp' },
  { label: 'Games & activities 1', key: 'homepage-about-teaser', path: 'homepage/about-teaser.webp' },
  { label: 'Home teaser 1', key: 'homepage-moment-1', path: 'gallery/moments/moment-1.webp' },
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

assert.equal(GALLERY_FEATURED_CMS_KEYS.length, 4)
assert.equal(GALLERY_EVENT_MOMENT_CMS_KEYS.length, 12)
assert.equal(GALLERY_STORY_CMS_KEYS.length, 3)
console.log('OK gallery section key counts')

assert.equal(resolveCanonicalCmsKey('birthday-hero'), 'birthday-games-slider-1')
assert.equal(resolveCanonicalCmsKey('gallery-2'), 'gallery-event-moment-2')
console.log('OK legacy aliases')

console.log('')
console.log('Registry keys:', Object.keys(IMAGE_KEY_REGISTRY).length)
console.log(failed === 0 ? 'All critical mappings verified.' : `${failed} mapping error(s).`)
process.exit(failed > 0 ? 1 : 0)
