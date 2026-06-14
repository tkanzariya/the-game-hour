/**
 * Audit CMS image keys vs frontend asset-map usage.
 * Run: node scripts/audit-image-mappings.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')

const COMPONENT_MAP = {
  'homepage/hero.webp': { component: 'HomeHero, AboutHero', location: 'Home `/` hero · About `/about` hero (shared)' },
  'homepage/about-teaser.webp': { component: 'AboutHero, AboutStory, service-activities', location: 'About page story/accent · activity cards' },
  'homepage/team-building.webp': { component: 'service-activities', location: 'Home/service activity cards — team building' },
  'homepage/strategy-games.webp': { component: 'service-activities', location: 'Home/service activity cards — strategy' },
  'gallery/gallery-hero.webp': { component: 'GalleryHero', location: 'Gallery `/gallery` hero' },
  'branding/logo-light.webp': { component: 'getLogoUrl', location: 'Site header/footer logo (light)' },
  'branding/logo-dark.webp': { component: 'getLogoUrl', location: 'Site header/footer logo (dark)' },
  'seo/og-default.webp': { component: 'getOgImageUrl', location: 'Default Open Graph / social share image' },
  'seo/social-preview.webp': { component: 'og-images', location: 'Social preview OG image' },
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory()) walk(p, files)
    else if (/\.(tsx|ts|jsx|js)$/.test(name.name)) files.push(p)
  }
  return files
}

function parseRegistry() {
  const file = fs.readFileSync(path.join(srcDir, 'data', 'image-keys.ts'), 'utf8')
  const keys = []
  const re = /'([a-z0-9-]+)':\s*\{[^}]*fallback:\s*'([^']+)'/g
  let m
  while ((m = re.exec(file))) {
    keys.push({ key: m[1], fallback: m[2] })
  }
  const serviceRe = /keys\[`\$\{slug\}-slider-\$\{n\}`\][\s\S]*?fallback: `\$\{base\}\/slider-\$\{n\}\.webp`/g
  return keys
}

function loadRegistryFromTs() {
  const text = fs.readFileSync(path.join(srcDir, 'data', 'image-keys.ts'), 'utf8')
  const entries = []

  const staticRe = /'([a-z0-9-]+)':\s*\{[\s\S]*?title:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?fallback:\s*'([^']+)'/g
  let m
  while ((m = staticRe.exec(text))) {
    entries.push({ key: m[1], title: m[2], category: m[3], fallback: m[4] })
  }

  const slugs = [
    'birthday-games', 'corporate-games', 'social-gathering-games', 'game-festival',
    'school-and-collage-event', 'wedding-or-haldi-games', 'traditional-games', 'bollywood-games',
  ]
  const labels = {
    'birthday-games': 'Birthday Games',
    'corporate-games': 'Corporate Games',
    'social-gathering-games': 'Social Gatherings',
    'game-festival': 'Game Festival',
    'school-and-collage-event': 'School & College',
    'wedding-or-haldi-games': 'Wedding Games',
    'traditional-games': 'Community Events',
    'bollywood-games': 'Bollywood Theme',
  }

  for (const slug of slugs) {
    const label = labels[slug]
    entries.push({
      key: `${slug}-title-card`,
      title: `${label} Title Card`,
      category: label,
      fallback: `services/${slug}/title-card.webp`,
      component: 'HomeEventCategories, service pages',
      location: `${label} card on home · service detail pages`,
    })
    for (let n = 1; n <= 3; n++) {
      entries.push({
        key: `${slug}-slider-${n}`,
        title: n === 1 ? `${label} Hero Banner` : `${label} Gallery Image ${n}`,
        category: label,
        fallback: `services/${slug}/slider-${n}.webp`,
        component: n === 1 ? 'ServiceDetailHero' : 'Service gallery sections',
        location: n === 1 ? `${label} page hero` : `${label} page slider ${n}`,
      })
    }
    for (let n = 1; n <= 4; n++) {
      entries.push({
        key: `${slug}-gallery-${n}`,
        title: `${label} Gallery Photo ${n}`,
        category: label,
        fallback: `services/${slug}/gallery-${n}.webp`,
        component: 'gallery.ts service grids',
        location: `${label} page gallery grid`,
      })
    }
  }

  for (let n = 1; n <= 9; n++) {
    entries.push({
      key: `gallery-${n}`,
      title: `Gallery Photo ${n}`,
      category: 'Gallery',
      fallback: `gallery/event-gallery-${n}.webp`,
      component: 'gallery.ts resolveGalleryItem',
      location: `Gallery page event grid photo ${n}`,
    })
  }
  for (let n = 1; n <= 6; n++) {
    entries.push({
      key: `gallery-moment-${n}`,
      title: `Gallery Moment ${n}`,
      category: 'Gallery',
      fallback: `gallery/moments/moment-${n}.webp`,
      component: 'HomeGalleryMoments, AboutBelieveInPlay, gallery.ts',
      location: `Gallery moments · home/about featured moments ${n}`,
    })
  }

  return entries
}

const registry = loadRegistryFromTs()
const assetMap = fs.readFileSync(path.join(srcDir, 'data', 'asset-map.ts'), 'utf8')
const usedPaths = new Set([...assetMap.matchAll(/img\('([^']+)'/g)].map((x) => x[1]))

const fallbackToKeys = {}
for (const row of registry) {
  if (!fallbackToKeys[row.fallback]) fallbackToKeys[row.fallback] = []
  fallbackToKeys[row.fallback].push(row.key)
}

const duplicates = Object.entries(fallbackToKeys).filter(([, ks]) => ks.length > 1)
const missingFrontend = registry.filter((r) => !usedPaths.has(r.fallback) && !r.fallback.includes('gallery/moments'))
const missingRegistry = [...usedPaths].filter((p) => !fallbackToKeys[p] && !p.startsWith('icons/'))

console.log('Registry keys:', registry.length)
console.log('Duplicate fallback paths:', duplicates.length)
duplicates.forEach(([fb, ks]) => console.log('  DUP', fb, '→', ks.join(', ')))
console.log('Asset paths without registry:', missingRegistry.length, missingRegistry.slice(0, 10))
console.log('Registry paths not in asset-map:', missingFrontend.length)

const md = []
md.push('# Image Mapping Audit')
md.push('')
md.push(`Generated: ${new Date().toISOString()}`)
md.push('')
md.push('## Summary')
md.push('')
md.push(`| Metric | Count |`)
md.push(`|--------|------:|`)
md.push(`| CMS / registry keys | ${registry.length} |`)
md.push(`| Duplicate fallback paths | ${duplicates.length} |`)
md.push(`| Asset-map paths missing registry | ${missingRegistry.length} |`)
md.push('')
md.push('## Resolution chain')
md.push('')
md.push('1. React components call `getAssetUrl(ASSET_MAP…)` with a bundled path (e.g. `homepage/hero.webp`).')
md.push('2. `getImageUrlForAssetPath()` maps path → CMS key(s) via `FALLBACK_PATH_TO_IMAGE_KEYS`.')
md.push('3. CMS manifest from `/cms/api/images.php` supplies uploaded URL when `file_path` is set.')
md.push('4. Otherwise bundled Vite asset is used.')
md.push('')
md.push('## Full mapping matrix')
md.push('')
md.push('| CMS Label | CMS Key | Asset Path | Frontend Component | Website Location |')
md.push('|-----------|---------|------------|-------------------|------------------|')

for (const row of registry.sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key))) {
  const hint = COMPONENT_MAP[row.fallback] ?? {
    component: row.component ?? 'getAssetUrl',
    location: row.location ?? row.category,
  }
  md.push(`| ${row.title} | \`${row.key}\` | \`${row.fallback}\` | ${hint.component} | ${hint.location} |`)
}

if (duplicates.length) {
  md.push('')
  md.push('## Duplicate fallback paths (fixed via multi-key lookup)')
  md.push('')
  for (const [fb, ks] of duplicates) {
    md.push(`- \`${fb}\` → ${ks.map((k) => `\`${k}\``).join(', ')}`)
  }
}

if (missingRegistry.length) {
  md.push('')
  md.push('## Asset-map paths without CMS keys')
  md.push('')
  for (const p of missingRegistry) md.push(`- \`${p}\``)
}

fs.writeFileSync(path.join(root, 'IMAGE_MAPPING_AUDIT.md'), md.join('\n'))
console.log('Wrote IMAGE_MAPPING_AUDIT.md')
