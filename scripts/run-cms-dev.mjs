import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function phpCandidates() {
  const extra = [
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'php83', 'php.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'php', 'php.exe'),
    'C:\\xampp\\php\\php.exe',
    'C:\\laragon\\bin\\php\\php.exe',
  ]
  return extra.filter((p) => p && fs.existsSync(p))
}

function resolvePhp() {
  const which = spawnSync('php', ['-v'], { encoding: 'utf8' })
  if (which.status === 0) {
    return 'php'
  }
  const found = phpCandidates()[0]
  return found || null
}

const php = resolvePhp()
if (!php) {
  console.error(
    'PHP is not installed or not on PATH. Install PHP 8.1+ (php -v must work), then re-run npm run cms:dev.',
  )
  process.exit(1)
}

console.log(`Using PHP: ${php}`)
spawnSync(process.execPath, [path.join(root, 'scripts', 'copy-cms-to-dist.mjs')], {
  cwd: root,
  stdio: 'inherit',
})

const child = spawn(
  php,
  ['-S', '127.0.0.1:8765', '-t', 'dist', path.join(root, 'scripts', 'dev-router.php')],
  { cwd: root, stdio: 'inherit', shell: os.platform() === 'win32' && php === 'php' },
)
child.on('exit', (code) => process.exit(code ?? 1))
