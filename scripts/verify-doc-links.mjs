import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const mdFiles = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules') continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.name.endsWith('.md')) mdFiles.push(p)
  }
}

walk(path.join(root, 'docs'))
walk(path.join(root, 'archive'))
if (fs.existsSync(path.join(root, 'README.md'))) {
  mdFiles.push(path.join(root, 'README.md'))
}

const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g
const bareRe = /`([A-Za-z0-9_\-]+\.md)`/g
const deleted = new Set([
  'ADMIN_URL_FIX.md',
  'IMAGE_LABELS_REPORT.md',
  'IMAGE_FILTERING_REPORT.md',
  'FLOATING_CTA_POLISH.md',
  'NAVBAR_REFINEMENT.md',
  'HERO_HIERARCHY_FIX.md',
  'ROUTE_AUDIT.md',
  'ASSET_MIGRATION_REPORT.md',
  'SERVICES_PAGE_REDESIGN.md',
  'CONTENT_CLEANUP_REPORT.md',
])

const broken = []

for (const file of mdFiles) {
  const text = fs.readFileSync(file, 'utf8')
  const dir = path.dirname(file)
  if (file.includes('DOCUMENTATION_INVENTORY') || file.includes('DOCUMENTATION_CLEANUP_PLAN')) {
    continue
  }

  let m
  while ((m = linkRe.exec(text))) {
    const target = m[2].split('#')[0].trim()
    if (!target || target.startsWith('http')) continue
    if (deleted.has(path.basename(target))) {
      broken.push({ file: path.relative(root, file), link: m[0], reason: 'deleted file' })
      continue
    }
    const resolved = path.normalize(path.join(dir, target))
    if (!fs.existsSync(resolved)) {
      broken.push({
        file: path.relative(root, file),
        link: m[0],
        reason: `missing: ${path.relative(root, resolved)}`,
      })
    }
  }

  while ((m = bareRe.exec(text))) {
    if (deleted.has(m[1]) && !file.includes('archive/README')) {
      broken.push({ file: path.relative(root, file), link: m[0], reason: 'bare ref to deleted file' })
    }
  }
}

console.log(`Checked ${mdFiles.length} files`)
console.log(`Broken: ${broken.length}`)
for (const b of broken) {
  console.log(`- ${b.file} | ${b.link} | ${b.reason}`)
}
process.exit(broken.length > 0 ? 1 : 0)
