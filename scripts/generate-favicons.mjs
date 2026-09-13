/**
 * Favicon helper for public/ and dist/.
 *
 * If a real favicon pack is already in public/ (favicon.ico + PNGs), leave it
 * alone. Only generate from branding/logo.svg when those files are missing.
 *
 * Run: npm run assets:favicons
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const LOGO_SVG = path.join(ROOT, 'src', 'assets', 'images', 'branding', 'logo.svg')
const PUBLIC = path.join(ROOT, 'public')
const DIST = path.join(ROOT, 'dist')

const FAVICON_FILES = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'site.webmanifest',
]

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function writePng(svgPath, dest, size) {
  await sharp(svgPath).resize(size, size).png().toFile(dest)
  console.log(`  ${path.basename(dest)} (${size}x${size})`)
}

async function mirrorToDist() {
  if (!(await fileExists(DIST))) {
    return
  }
  for (const name of FAVICON_FILES) {
    const src = path.join(PUBLIC, name)
    if (!(await fileExists(src))) {
      continue
    }
    await fs.copyFile(src, path.join(DIST, name))
  }
  console.log('dist/: favicon assets synced')
}

async function hasFaviconPack() {
  return (
    (await fileExists(path.join(PUBLIC, 'favicon.ico'))) &&
    (await fileExists(path.join(PUBLIC, 'favicon-32x32.png'))) &&
    (await fileExists(path.join(PUBLIC, 'apple-touch-icon.png')))
  )
}

async function main() {
  await fs.mkdir(PUBLIC, { recursive: true })

  if (await hasFaviconPack()) {
    console.log('Using existing favicon pack in public/ (not overwriting from logo.svg)')
    await mirrorToDist()
    return
  }

  if (!(await fileExists(LOGO_SVG))) {
    console.error('Missing favicon pack in public/ and missing logo:', LOGO_SVG)
    process.exit(1)
  }

  await writePng(LOGO_SVG, path.join(PUBLIC, 'favicon-16x16.png'), 16)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'favicon-32x32.png'), 32)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'apple-touch-icon.png'), 180)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'android-chrome-192x192.png'), 192)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'android-chrome-512x512.png'), 512)

  const ico32 = await sharp(LOGO_SVG).resize(32, 32).png().toBuffer()
  await fs.writeFile(path.join(PUBLIC, 'favicon.ico'), ico32)
  console.log('  favicon.ico')

  await mirrorToDist()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
