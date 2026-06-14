/**
 * Migrate + optimize legacy images into src/assets/images/
 * Run: node scripts/migrate-assets.mjs
 */
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const LEGACY = path.join(ROOT, '..', 'TheGameHour-legacy', 'images')
const OUT = path.join(ROOT, 'src', 'assets', 'images')
const PUBLIC = path.join(ROOT, 'public')
const REPORT_PATH = path.join(ROOT, 'scripts', 'migration-stats.json')

const MAX_KB = 500
const IDEAL_KB = 300

/** @type {{ id: string, src: string, dest: string, type: 'photo'|'card'|'logo'|'icon'|'og', maxWidth?: number, quality?: number, skipWebp?: boolean }[]} */
const MIGRATIONS = [
  // Branding
  { id: 'logo-light', src: 'tgh-logo.png', dest: 'branding/logo-light', type: 'logo', maxWidth: 512 },
  { id: 'logo-svg', src: 'public/favicon.svg', dest: 'branding/logo', type: 'icon', skipWebp: true, fromRoot: true },

  // Homepage
  { id: 'hero', src: 'Hero Section.jpg', dest: 'homepage/hero', type: 'photo', maxWidth: 1600, quality: 78 },
  { id: 'about-teaser', src: 'About Us1.jpg', dest: 'homepage/about-teaser', type: 'photo', maxWidth: 1200, quality: 80 },
  { id: 'team-building', src: 'team-building-games.jpg', dest: 'homepage/team-building', type: 'photo', maxWidth: 1200, quality: 82 },
  { id: 'strategy-games', src: 'Game Types/Strategy Games.jpg', dest: 'homepage/strategy-games', type: 'photo', maxWidth: 1200, quality: 82 },

  // Service title cards
  { id: 'birthday-title', src: 'Service Titles/birthday-games-title-card.png', dest: 'services/birthday-games/title-card', type: 'card', maxWidth: 800 },
  { id: 'corporate-title', src: 'Service Titles/corporate-games-title-card.png', dest: 'services/corporate-games/title-card', type: 'card', maxWidth: 800 },
  { id: 'social-title', src: 'Service Titles/social-gathering-title-card.jpg', dest: 'services/social-gathering-games/title-card', type: 'card', maxWidth: 800 },
  { id: 'festival-title', src: 'Service Titles/game-festival-title-card.jpg', dest: 'services/game-festival/title-card', type: 'card', maxWidth: 800 },
  { id: 'school-title', src: 'Service Titles/school-event-title-card.jpg', dest: 'services/school-and-collage-event/title-card', type: 'card', maxWidth: 800 },
  { id: 'traditional-title', src: 'Service Titles/traditional-games-title-card.jpg', dest: 'services/traditional-games/title-card', type: 'card', maxWidth: 800 },
  { id: 'wedding-title', src: 'wedding-games-title.jpg', dest: 'services/wedding-or-haldi-games/title-card', type: 'card', maxWidth: 1000, quality: 75 },
  { id: 'bollywood-title', src: 'bollywood-games-title.jpg', dest: 'services/bollywood-games/title-card', type: 'card', maxWidth: 800, quality: 82 },

  // Birthday service
  { id: 'birthday-slider-1', src: '1. Birthday Photos/birtday_photo_1.jpg', dest: 'services/birthday-games/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'birthday-slider-2', src: '1. Birthday Photos/birtday_photo_2.jpg', dest: 'services/birthday-games/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'birthday-slider-3', src: '1. Birthday Photos/birtday_photo_3.jpg', dest: 'services/birthday-games/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'birthday-gallery-1', src: '1. Birthday Photos/birtday_photo_1.jpg', dest: 'services/birthday-games/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'birthday-gallery-2', src: '1. Birthday Photos/birtday_photo_2.jpg', dest: 'services/birthday-games/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'birthday-gallery-3', src: '1. Birthday Photos/birtday_photo_3.jpg', dest: 'services/birthday-games/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'birthday-gallery-4', src: '1. Birthday Photos/birtday_photo_4.jpg', dest: 'services/birthday-games/gallery-4', type: 'photo', maxWidth: 1200 },

  // Corporate
  { id: 'corporate-slider-1', src: '2. Coporate Photos/corporate-activities-title-1.png', dest: 'services/corporate-games/slider-1', type: 'card', maxWidth: 1200 },
  { id: 'corporate-slider-2', src: '2. Coporate Photos/corporate-activities-title-2.jpg', dest: 'services/corporate-games/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'corporate-slider-3', src: '2. Coporate Photos/corporate-activities-title-3.JPG', dest: 'services/corporate-games/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'corporate-gallery-1', src: '2. Coporate Photos/corporate-activities-photo-1.JPG', dest: 'services/corporate-games/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'corporate-gallery-2', src: '2. Coporate Photos/corporate-activities-photo-2.jpg', dest: 'services/corporate-games/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'corporate-gallery-3', src: '2. Coporate Photos/corporate-activities-photo-3.png', dest: 'services/corporate-games/gallery-3', type: 'card', maxWidth: 1200 },
  { id: 'corporate-gallery-4', src: '2. Coporate Photos/corporate-activities-photo-4.png', dest: 'services/corporate-games/gallery-4', type: 'card', maxWidth: 1200 },

  // Social gathering
  { id: 'social-slider-1', src: '3. Social Gathering Photos/social-gathering-activities-title-1.jpg', dest: 'services/social-gathering-games/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'social-slider-2', src: '3. Social Gathering Photos/social-gathering-activities-title-2.jpg', dest: 'services/social-gathering-games/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'social-slider-3', src: '3. Social Gathering Photos/social-gathering-activities-title-3.jpg', dest: 'services/social-gathering-games/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'social-gallery-1', src: '3. Social Gathering Photos/social-gathering-activities-photo-1.jpg', dest: 'services/social-gathering-games/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'social-gallery-2', src: '3. Social Gathering Photos/social-gathering-activities-photo-2.jpg', dest: 'services/social-gathering-games/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'social-gallery-3', src: '3. Social Gathering Photos/social-gathering-activities-photo-3.jpg', dest: 'services/social-gathering-games/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'social-gallery-4', src: '3. Social Gathering Photos/social-gathering-activities-photo-4.png', dest: 'services/social-gathering-games/gallery-4', type: 'card', maxWidth: 1200 },

  // Game festival
  { id: 'festival-slider-1', src: '4. Game Festival Photos/game-festival-activities-title-1.jpg', dest: 'services/game-festival/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'festival-slider-2', src: '4. Game Festival Photos/game-festival-activities-title-2.jpg', dest: 'services/game-festival/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'festival-slider-3', src: '4. Game Festival Photos/game-festival-activities-title-3.jpg', dest: 'services/game-festival/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'festival-gallery-1', src: '4. Game Festival Photos/game-festival-activities-photo-1.jpg', dest: 'services/game-festival/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'festival-gallery-2', src: '4. Game Festival Photos/game-festival-activities-photo-2.jpg', dest: 'services/game-festival/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'festival-gallery-3', src: '4. Game Festival Photos/game-festival-activities-photo-3.jpg', dest: 'services/game-festival/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'festival-gallery-4', src: '4. Game Festival Photos/game-festival-activities-photo-4.png', dest: 'services/game-festival/gallery-4', type: 'card', maxWidth: 1200 },

  // School
  { id: 'school-slider-1', src: '5. SchoolCollege Event Photos/game-festival-activities-title-1.jpg', dest: 'services/school-and-collage-event/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'school-slider-2', src: '5. SchoolCollege Event Photos/game-festival-activities-title-2.jpg', dest: 'services/school-and-collage-event/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'school-slider-3', src: '5. SchoolCollege Event Photos/game-festival-activities-title-3.jpg', dest: 'services/school-and-collage-event/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'school-gallery-1', src: '5. SchoolCollege Event Photos/game-festival-activities-photo-1.jpg', dest: 'services/school-and-collage-event/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'school-gallery-2', src: '5. SchoolCollege Event Photos/game-festival-activities-photo-2.png', dest: 'services/school-and-collage-event/gallery-2', type: 'card', maxWidth: 1200 },
  { id: 'school-gallery-3', src: '5. SchoolCollege Event Photos/game-festival-activities-photo-3.jpg', dest: 'services/school-and-collage-event/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'school-gallery-4', src: '5. SchoolCollege Event Photos/game-festival-activities-title-4.jpg', dest: 'services/school-and-collage-event/gallery-4', type: 'photo', maxWidth: 1200 },

  // Wedding
  { id: 'wedding-slider-1', src: '6. Wedding-Haldi Event Photos/wedding-games-title-1.jpg', dest: 'services/wedding-or-haldi-games/slider-1', type: 'photo', maxWidth: 1400, quality: 78 },
  { id: 'wedding-slider-2', src: '6. Wedding-Haldi Event Photos/wedding-games-title-2.jpg', dest: 'services/wedding-or-haldi-games/slider-2', type: 'photo', maxWidth: 1400, quality: 78 },
  { id: 'wedding-slider-3', src: '6. Wedding-Haldi Event Photos/wedding-games-title-3.jpg', dest: 'services/wedding-or-haldi-games/slider-3', type: 'photo', maxWidth: 1400, quality: 78 },
  { id: 'wedding-gallery-1', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-1.jpg', dest: 'services/wedding-or-haldi-games/gallery-1', type: 'photo', maxWidth: 1200, quality: 78 },
  { id: 'wedding-gallery-2', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-2.JPG', dest: 'services/wedding-or-haldi-games/gallery-2', type: 'photo', maxWidth: 1200, quality: 78 },
  { id: 'wedding-gallery-3', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-3.jpg', dest: 'services/wedding-or-haldi-games/gallery-3', type: 'photo', maxWidth: 1200, quality: 78 },
  { id: 'wedding-gallery-4', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-4.JPG', dest: 'services/wedding-or-haldi-games/gallery-4', type: 'photo', maxWidth: 1200, quality: 78 },

  // Traditional
  { id: 'traditional-slider-1', src: '7. Traditional Game Photos/traditional-games-title-1.jpg', dest: 'services/traditional-games/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'traditional-slider-2', src: '7. Traditional Game Photos/traditional-games-title-2.jpg', dest: 'services/traditional-games/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'traditional-slider-3', src: '7. Traditional Game Photos/traditional-games-title-3.jpg', dest: 'services/traditional-games/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'traditional-gallery-1', src: '7. Traditional Game Photos/traditional-games-photo-1.jpg', dest: 'services/traditional-games/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'traditional-gallery-2', src: '7. Traditional Game Photos/traditional-games-photo-2.jpg', dest: 'services/traditional-games/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'traditional-gallery-3', src: '7. Traditional Game Photos/traditional-games-photo-3.jpg', dest: 'services/traditional-games/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'traditional-gallery-4', src: '7. Traditional Game Photos/traditional-games-photo-4.jpg', dest: 'services/traditional-games/gallery-4', type: 'photo', maxWidth: 1200 },

  // Bollywood
  { id: 'bollywood-slider-1', src: '8. Bollywood Game Photos/bollywood-games-title-1.jpg', dest: 'services/bollywood-games/slider-1', type: 'photo', maxWidth: 1400 },
  { id: 'bollywood-slider-2', src: '8. Bollywood Game Photos/bollywood-games-title-2.jpg', dest: 'services/bollywood-games/slider-2', type: 'photo', maxWidth: 1400 },
  { id: 'bollywood-slider-3', src: '8. Bollywood Game Photos/bollywood-games-title-3.jpg', dest: 'services/bollywood-games/slider-3', type: 'photo', maxWidth: 1400 },
  { id: 'bollywood-gallery-1', src: '8. Bollywood Game Photos/bollywood-games-photo-1.jpg', dest: 'services/bollywood-games/gallery-1', type: 'photo', maxWidth: 1200 },
  { id: 'bollywood-gallery-2', src: '8. Bollywood Game Photos/bollywood-games-photo-2.jpg', dest: 'services/bollywood-games/gallery-2', type: 'photo', maxWidth: 1200 },
  { id: 'bollywood-gallery-3', src: '8. Bollywood Game Photos/bollywood-games-photo-3.jpg', dest: 'services/bollywood-games/gallery-3', type: 'photo', maxWidth: 1200 },
  { id: 'bollywood-gallery-4', src: '8. Bollywood Game Photos/bollywood-games-photo-4.jpg', dest: 'services/bollywood-games/gallery-4', type: 'photo', maxWidth: 1200 },
]

/** Gallery placeholders, source service gallery photos */
const GALLERY_PLACEHOLDERS = [
  { dest: 'gallery/gallery-hero', src: '2. Coporate Photos/corporate-activities-photo-2.jpg', type: 'photo', maxWidth: 1600, quality: 80 },
  { dest: 'gallery/event-gallery-1', src: '1. Birthday Photos/birtday_photo_1.jpg' },
  { dest: 'gallery/event-gallery-2', src: '2. Coporate Photos/corporate-activities-photo-2.jpg' },
  { dest: 'gallery/event-gallery-3', src: '3. Social Gathering Photos/social-gathering-activities-photo-2.jpg' },
  { dest: 'gallery/event-gallery-4', src: '5. SchoolCollege Event Photos/game-festival-activities-photo-3.jpg' },
  { dest: 'gallery/event-gallery-5', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-2.JPG', quality: 78 },
  { dest: 'gallery/event-gallery-6', src: '7. Traditional Game Photos/traditional-games-photo-3.jpg' },
  { dest: 'gallery/event-gallery-7', src: '4. Game Festival Photos/game-festival-activities-photo-2.jpg' },
  { dest: 'gallery/event-gallery-8', src: '8. Bollywood Game Photos/bollywood-games-photo-3.jpg' },
  { dest: 'gallery/event-gallery-9', src: '1. Birthday Photos/birtday_photo_4.jpg' },
  { dest: 'gallery/moments/moment-1', src: '1. Birthday Photos/birtday_photo_2.jpg' },
  { dest: 'gallery/moments/moment-2', src: '2. Coporate Photos/corporate-activities-photo-1.JPG' },
  { dest: 'gallery/moments/moment-3', src: '3. Social Gathering Photos/social-gathering-activities-photo-3.jpg' },
  { dest: 'gallery/moments/moment-4', src: '6. Wedding-Haldi Event Photos/wedding-games-photo-1.jpg', quality: 78 },
  { dest: 'gallery/moments/moment-5', src: '7. Traditional Game Photos/traditional-games-photo-2.jpg' },
  { dest: 'gallery/moments/moment-6', src: '8. Bollywood Game Photos/bollywood-games-photo-1.jpg' },
]

const stats = []

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

async function fileSizeKb(filePath) {
  try {
    const s = await fs.stat(filePath)
    return Math.round((s.size / 1024) * 10) / 10
  } catch {
    return 0
  }
}

async function optimizeImage(inputPath, destBase, opts) {
  const { type = 'photo', maxWidth = 1400, quality = 82, skipWebp = false } = opts
  const originalKb = await fileSizeKb(inputPath)
  await ensureDir(destBase + '.webp')

  let pipeline = sharp(inputPath).rotate()
  const meta = await pipeline.metadata()
  const w = meta.width || maxWidth
  if (w > maxWidth) pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true })

  const results = { webpKb: 0, jpgKb: 0, pngKb: 0 }

  if (!skipWebp) {
    const webpQ = type === 'card' ? Math.min(quality, 85) : quality
    await pipeline
      .clone()
      .webp({ quality: webpQ, effort: 4 })
      .toFile(destBase + '.webp')
    results.webpKb = await fileSizeKb(destBase + '.webp')
  }

  if (type === 'logo' || type === 'card') {
    await pipeline
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(destBase + '.png')
    results.pngKb = await fileSizeKb(destBase + '.png')
  } else if (type !== 'icon') {
    const jpgQ = type === 'photo' ? quality : 85
    await pipeline
      .clone()
      .jpeg({ quality: jpgQ, mozjpeg: true })
      .toFile(destBase + '.jpg')
    results.jpgKb = await fileSizeKb(destBase + '.jpg')
  }

  const optimizedKb = results.webpKb || results.jpgKb || results.pngKb
  const overMax = optimizedKb > MAX_KB

  if (overMax && !skipWebp && results.webpKb > 0) {
    let q = quality - 8
    while (q >= 60 && (await fileSizeKb(destBase + '.webp')) > MAX_KB) {
      await sharp(inputPath)
        .rotate()
        .resize(maxWidth, null, { withoutEnlargement: true })
        .webp({ quality: q, effort: 4 })
        .toFile(destBase + '.webp')
      q -= 6
    }
    results.webpKb = await fileSizeKb(destBase + '.webp')
  }

  return {
    originalKb,
    optimizedKb: results.webpKb || results.jpgKb || results.pngKb,
    ...results,
    overMax: (results.webpKb || results.jpgKb || results.pngKb) > MAX_KB,
  }
}

async function copySvg(src, dest) {
  await ensureDir(dest)
  await fs.copyFile(src, dest)
  const kb = await fileSizeKb(dest)
  return { originalKb: kb, optimizedKb: kb, webpKb: 0, jpgKb: 0, pngKb: 0, overMax: false }
}

/** Logo for dark backgrounds (nav/footer), same asset until white logo supplied */
async function createLogoOnDark(lightWebp, lightPng, destBase) {
  await fs.copyFile(lightWebp, destBase + '.webp')
  await fs.copyFile(lightPng, destBase + '.png')
  const webpKb = await fileSizeKb(destBase + '.webp')
  return {
    originalKb: await fileSizeKb(lightPng),
    optimizedKb: webpKb,
    webpKb,
    jpgKb: 0,
    pngKb: await fileSizeKb(destBase + '.png'),
    overMax: false,
    note: 'alias-of-logo-light',
  }
}

async function createOgImages(heroWebp, logoWebp) {
  const destSeo = path.join(OUT, 'seo', 'og-default')
  const destPublicWebp = path.join(PUBLIC, 'og-default.webp')
  const destPublicJpg = path.join(PUBLIC, 'og-default.jpg')

  let bg
  try {
    bg = await sharp(heroWebp).resize(1200, 630, { fit: 'cover', position: 'centre' })
  } catch {
    bg = sharp({
      create: { width: 1200, height: 630, channels: 3, background: { r: 3, g: 42, b: 93 } },
    })
  }

  const base = await bg
    .composite([
      {
        input: await sharp({
          create: { width: 1200, height: 630, channels: 4, background: { r: 3, g: 42, b: 93, alpha: 0.55 } },
        })
          .png()
          .toBuffer(),
        blend: 'over',
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer()

  await ensureDir(destSeo + '.jpg')
  await sharp(base).toFile(destSeo + '.jpg')
  await sharp(base).webp({ quality: 85 }).toFile(destSeo + '.webp')
  await fs.copyFile(destSeo + '.jpg', destPublicJpg)
  await fs.copyFile(destSeo + '.webp', destPublicWebp)

  const socialDest = path.join(OUT, 'seo', 'social-preview')
  await sharp(base).resize(1200, 630).webp({ quality: 85 }).toFile(socialDest + '.webp')
  await sharp(base).resize(1200, 630).jpeg({ quality: 85 }).toFile(socialDest + '.jpg')

  return {
    originalKb: 0,
    optimizedKb: await fileSizeKb(destPublicJpg),
    webpKb: await fileSizeKb(destPublicWebp),
    jpgKb: await fileSizeKb(destPublicJpg),
    pngKb: 0,
    overMax: false,
    note: 'generated',
  }
}

async function copyIcons() {
  const icons = [
    ['favicon-16x16.png', 'icons/favicon-16x16.png'],
    ['favicon-32x32.png', 'icons/favicon-32x32.png'],
    ['favicon.ico', 'icons/favicon.ico'],
  ]
  for (const [src, dest] of icons) {
    const input = path.join(LEGACY, src)
    const output = path.join(OUT, dest)
    try {
      await ensureDir(output)
      await fs.copyFile(input, output)
      const kb = await fileSizeKb(output)
      stats.push({ id: dest, src, dest, status: 'copied', originalKb: kb, optimizedKb: kb })
      await fs.copyFile(output, path.join(PUBLIC, path.basename(dest)))
    } catch (e) {
      stats.push({ id: dest, src, dest, status: 'missing', error: e.message })
    }
  }
}

async function main() {
  console.log('Migrating assets from legacy...\n')

  for (const job of MIGRATIONS) {
    const input = job.fromRoot ? path.join(ROOT, job.src) : path.join(LEGACY, job.src)
    const destBase = path.join(OUT, job.dest)

    try {
      await fs.access(input)
    } catch {
      stats.push({ id: job.id, src: job.src, dest: job.dest, status: 'missing', originalKb: 0, optimizedKb: 0 })
      console.log(`  SKIP (missing): ${job.src}`)
      continue
    }

    let result
    if (job.skipWebp && job.src.endsWith('.svg')) {
      result = await copySvg(input, destBase + '.svg')
      stats.push({ id: job.id, src: job.src, dest: job.dest + '.svg', status: 'copied', ...result })
    } else {
      result = await optimizeImage(input, destBase, job)
      stats.push({
        id: job.id,
        src: job.src,
        dest: job.dest,
        status: 'optimized',
        ...result,
        savingsPct: result.originalKb
          ? Math.round((1 - result.optimizedKb / result.originalKb) * 100)
          : 0,
      })
      console.log(
        `  OK ${job.id}: ${result.originalKb}KB → ${result.optimizedKb}KB webp${result.overMax ? ' (over 500KB!)' : ''}`,
      )
    }
  }

  for (const job of GALLERY_PLACEHOLDERS) {
    const input = path.join(LEGACY, job.src)
    const destBase = path.join(OUT, job.dest)
    try {
      await fs.access(input)
      const result = await optimizeImage(input, destBase, {
        type: 'photo',
        maxWidth: job.maxWidth || 1200,
        quality: job.quality || 82,
      })
      stats.push({
        id: job.dest,
        src: job.src,
        dest: job.dest,
        status: 'placeholder',
        ...result,
        savingsPct: result.originalKb
          ? Math.round((1 - result.optimizedKb / result.originalKb) * 100)
          : 0,
      })
      console.log(`  PLACEHOLDER ${job.dest}: ${result.optimizedKb}KB`)
    } catch (e) {
      stats.push({ id: job.dest, status: 'failed', error: e.message })
    }
  }

  try {
    const darkResult = await createLogoOnDark(
      path.join(OUT, 'branding/logo-light.webp'),
      path.join(OUT, 'branding/logo-light.png'),
      path.join(OUT, 'branding/logo-dark'),
    )
    stats.push({ id: 'logo-dark', dest: 'branding/logo-dark', status: 'derived', ...darkResult })
  } catch (e) {
    console.log('  logo-dark skip:', e.message)
  }

  await copyIcons()

  const heroWebp = path.join(OUT, 'homepage/hero.webp')
  const ogResult = await createOgImages(heroWebp, path.join(OUT, 'branding/logo-light.webp'))
  stats.push({ id: 'og-default', dest: 'seo/og-default', status: 'generated', ...ogResult })
  console.log(`  OG image: ${ogResult.jpgKb}KB jpg, ${ogResult.webpKb}KB webp`)

  await fs.writeFile(REPORT_PATH, JSON.stringify({ generated: new Date().toISOString(), stats }, null, 2))
  console.log(`\nDone. Stats: ${REPORT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
