/**
 * Generate favicon assets from branding/logo.svg for public/ and dist/.
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
  'favicon.svg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'apple-touch-icon.png',
  'site.webmanifest',
]

async function writePng(svgPath, dest, size) {
  await sharp(svgPath).resize(size, size).png().toFile(dest)
  console.log(`  ${path.basename(dest)} (${size}x${size})`)
}

async function mirrorToDist() {
  try {
    await fs.access(DIST)
  } catch {
    return
  }
  for (const name of FAVICON_FILES) {
    const src = path.join(PUBLIC, name)
    try {
      await fs.copyFile(src, path.join(DIST, name))
    } catch {
      // skip missing optional outputs
    }
  }
  console.log('dist/: favicon assets synced')
}

async function main() {
  try {
    await fs.access(LOGO_SVG)
  } catch {
    console.error('Missing logo:', LOGO_SVG)
    process.exit(1)
  }

  await fs.mkdir(PUBLIC, { recursive: true })
  await fs.copyFile(LOGO_SVG, path.join(PUBLIC, 'favicon.svg'))
  console.log('favicon.svg')

  await writePng(LOGO_SVG, path.join(PUBLIC, 'favicon-16x16.png'), 16)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'favicon-32x32.png'), 32)
  await writePng(LOGO_SVG, path.join(PUBLIC, 'apple-touch-icon.png'), 180)

  const ico32 = await sharp(LOGO_SVG).resize(32, 32).png().toBuffer()
  await fs.writeFile(path.join(PUBLIC, 'favicon.ico'), ico32)
  console.log('  favicon.ico')

  const manifest = {
    name: 'The Game Hour',
    short_name: 'Game Hour',
    icons: [
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    theme_color: '#032a5d',
    background_color: '#032a5d',
    display: 'standalone',
  }
  await fs.writeFile(
    path.join(PUBLIC, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
  )
  console.log('site.webmanifest')

  await mirrorToDist()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
