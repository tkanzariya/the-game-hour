/**
 * Prepare gitignored local CMS files so ops/booking work without MySQL.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cms = path.join(root, 'cms')
const devDir = path.join(cms, 'dev-data')

export function ensureLocalCms() {
  const sample = path.join(cms, 'config.dev.sample.php')
  const local = path.join(cms, 'config.local.php')
  if (!fs.existsSync(local) && fs.existsSync(sample)) {
    fs.copyFileSync(sample, local)
    console.log('ensure-local-cms: created cms/config.local.php (JSON mode, no MySQL)')
  }

  fs.mkdirSync(devDir, { recursive: true })

  const bookings = path.join(devDir, 'bookings.json')
  const seed = path.join(cms, 'data', 'ops-dummy.json')
  if (!fs.existsSync(bookings) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, bookings)
    console.log('ensure-local-cms: seeded cms/dev-data/bookings.json with dummy events')
  }

  const images = path.join(devDir, 'images.json')
  if (!fs.existsSync(images)) {
    fs.writeFileSync(images, `${JSON.stringify({ images: [] }, null, 4)}\n`)
  }
  const content = path.join(devDir, 'content.json')
  if (!fs.existsSync(content)) {
    fs.writeFileSync(
      content,
      `${JSON.stringify({ testimonials: [], metrics: {} }, null, 4)}\n`,
    )
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ensureLocalCms()
}
