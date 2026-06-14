/**
 * Copy cms/ into dist/ after Vite build so PHP admin + API deploy with the site.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const src = path.join(root, 'cms')
const dest = path.join(root, 'dist', 'cms')

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name)
    const d = path.join(to, entry.name)
    if (entry.name === 'config.php' || entry.name === 'config.local.php') continue
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

if (!fs.existsSync(path.join(root, 'dist'))) {
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true })
  console.log('copy-cms: created dist/ for local CMS dev')
}

copyDir(src, dest)

const localConfig = path.join(src, 'config.local.php')
if (fs.existsSync(localConfig)) {
  fs.copyFileSync(localConfig, path.join(dest, 'config.local.php'))
  console.log('copy-cms: config.local.php → dist/cms/ (local dev)')
}

const imagesSrc = path.join(root, 'src', 'assets', 'images')
const staticDest = path.join(src, 'static', 'images')
const staticDist = path.join(dest, 'static', 'images')
if (fs.existsSync(imagesSrc)) {
  copyDir(imagesSrc, staticDest)
  copyDir(imagesSrc, staticDist)
  console.log('copy-cms: src/assets/images → cms/static/images (admin previews)')
}

const uploadsHtaccess = path.join(src, 'uploads', '.htaccess')
const publicUploads = path.join(root, 'dist', 'uploads')
fs.mkdirSync(publicUploads, { recursive: true })
if (fs.existsSync(uploadsHtaccess)) {
  fs.copyFileSync(uploadsHtaccess, path.join(publicUploads, '.htaccess'))
}
fs.writeFileSync(path.join(publicUploads, '.gitkeep'), '')

console.log('copy-cms: cms/ → dist/cms/, uploads/.htaccess → dist/uploads/')
