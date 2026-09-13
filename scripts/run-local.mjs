/**
 * Local ops + booking: PHP CMS on :8765 and Vite on :5173.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureLocalCms } from './ensure-local-cms.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
ensureLocalCms()

const isWin = process.platform === 'win32'
const children = []

function start(command, args, name, useShell = false) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: useShell,
    env: process.env,
  })
  child.on('exit', (code, signal) => {
    if (signal) return
    stopAll()
    process.exit(code ?? 1)
  })
  children.push({ name, child })
  return child
}

function stopAll() {
  for (const { child } of children) {
    if (!child.killed) {
      child.kill()
    }
  }
}

process.on('SIGINT', () => {
  stopAll()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})

console.log('Local ops: PHP API http://127.0.0.1:8765  →  Vite http://localhost:5173/ops/login')
console.log('Sign in with devadmin / dev123 (JSON mode). Edits write to cms/dev-data/bookings.json')

start(process.execPath, [path.join(root, 'scripts', 'run-cms-dev.mjs')], 'cms')
start(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], 'vite', isWin)
