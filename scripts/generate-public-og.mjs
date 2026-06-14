/**
 * Copy stable OG images to /public for social crawlers.
 * Run after assets:migrate — `npm run assets:og-public`
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMAGES = path.join(ROOT, 'src', 'assets', 'images')
const PUBLIC = path.join(ROOT, 'public')

const SERVICE_SLUGS = [
  'birthday-games',
  'corporate-games',
  'social-gathering-games',
  'game-festival',
  'school-and-collage-event',
  'wedding-or-haldi-games',
  'traditional-games',
  'bollywood-games',
]

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

async function copyOgJpg(source, dest, resize = true) {
  try {
    await fs.access(source)
  } catch {
    console.log(`  SKIP (missing): ${source}`)
    return false
  }

  await ensureDir(dest)
  if (resize) {
    await sharp(source)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toFile(dest)
  } else {
    await fs.copyFile(source, dest)
  }
  console.log(`  OK ${path.relative(PUBLIC, dest)}`)
  return true
}

async function main() {
  console.log('Generating public OG images...\n')

  await copyOgJpg(
    path.join(IMAGES, 'seo', 'social-preview.jpg'),
    path.join(PUBLIC, 'og', 'social-preview.jpg'),
  )

  await copyOgJpg(
    path.join(IMAGES, 'gallery', 'gallery-hero.jpg'),
    path.join(PUBLIC, 'og', 'gallery.jpg'),
  )

  for (const slug of SERVICE_SLUGS) {
    const titleCard = path.join(IMAGES, 'services', slug, 'title-card.jpg')
    const titleCardPng = path.join(IMAGES, 'services', slug, 'title-card.png')
    let source = titleCard
    try {
      await fs.access(source)
    } catch {
      source = titleCardPng
    }
    await copyOgJpg(source, path.join(PUBLIC, 'og', 'services', `${slug}.jpg`))
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
