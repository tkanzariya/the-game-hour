/**
 * Remove em dashes, en dashes, and horizontal bars from project text files.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git'])
const EXT = new Set(['.tsx', '.ts', '.json', '.md', '.css', '.html', '.mjs'])

let filesChanged = 0
let totalReplacements = 0

function countDashes(s) {
  return (s.match(/\u2014|\u2013|\u2015/g) ?? []).length
}

function cleanText(text) {
  const before = countDashes(text)
  let out = text

  out = out.replaceAll('\u2013', '-')
  out = out.replaceAll('\u2015', '-')

  out = out.replace(/^(\s{0,3}#{1,6}\s+[^\n]*?) \u2014 /gm, '$1: ')
  out = out.replace(/^(\s*\|[^\n]*?) \u2014 /gm, '$1: ')
  out = out.replace(/^(\s{0,3}#{1,6}\s+[^\n]*?)\u2014/gm, '$1: ')

  out = out.replaceAll(' \u2014 ', ', ')

  out = out.replace(
    /The Game Hour, Screen-Free Event Games in Gujarat/g,
    'The Game Hour | Screen-Free Event Games in Gujarat',
  )

  out = out.replaceAll('\u2014', ', ')

  out = out.replace(/, ,/g, ',')
  out = out.replace(/,\s+,/g, ', ')

  const after = countDashes(out)
  return { out, replacements: before - after }
}

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(name.name)) continue
    const full = path.join(dir, name.name)
    if (name.isDirectory()) {
      walk(full)
      continue
    }
    const ext = path.extname(name.name)
    if (!EXT.has(ext)) continue
    if (name.name === 'cleanup-dashes.mjs') continue

    const raw = fs.readFileSync(full, 'utf8')
    const { out, replacements } = cleanText(raw)
    if (out !== raw) {
      fs.writeFileSync(full, out, 'utf8')
      filesChanged++
      totalReplacements += replacements
      console.log(`${path.relative(root, full)} (${replacements})`)
    }
  }
}

walk(root)
console.log(`\nDone: ${filesChanged} files, ${totalReplacements} dash characters removed.`)
