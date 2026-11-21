/**
 * Prerender the public pages after `vite build`, so every page is served as real HTML
 * (content, title, description, Open Graph, JSON-LD) before any JavaScript runs.
 *
 * Writes into dist/:
 *   index.html              home, prerendered
 *   prerender/<path>.html   the other public pages (mapped to clean URLs by .htaccess)
 *   404.html                not-found page, served with status 404
 *   app.html                the empty app shell for /ops, /book and /choose-games
 *   sitemap.xml             from the same page list
 *   .htaccess               the "# @prerender-routes" line becomes the clean-URL rule
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const ROOT_MARKER = '<div id="root"></div>'
const ROUTES_MARKER = '# @prerender-routes'

/** Tags React emits ahead of the page markup; they belong in <head>. */
const HEAD_TAG = /^(?:<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>)/

function splitHead(markup) {
  let head = ''
  let rest = markup
  for (;;) {
    const match = HEAD_TAG.exec(rest)
    if (!match) break
    head += `    ${match[0]}\n`
    rest = rest.slice(match[0].length)
  }
  return { head, body: rest }
}

function buildPage(shell, markup, pagePath) {
  const { head, body } = splitHead(markup)
  if (!/<title\b/.test(head)) {
    throw new Error(`Prerender: ${pagePath} rendered without a <title>`)
  }
  return shell
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/, head)
    .replace(ROOT_MARKER, `<div id="root">${body}</div>`)
}

function buildSitemap(siteUrl, pages) {
  const urls = pages
    .map(
      (page) =>
        `  <url>\n    <loc>${siteUrl}${page.path === '/' ? '/' : page.path}</loc>\n` +
        `    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
    )
    .join('\n')
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n</urlset>\n`
  )
}

const shellPath = path.join(dist, 'index.html')
const appShellPath = path.join(dist, 'app.html')
if (!fs.existsSync(shellPath)) {
  throw new Error('Prerender: dist/index.html is missing. Run `vite build` first.')
}
// On a re-run index.html is already filled in, so start from the saved shell.
const shell = fs.readFileSync(
  fs.existsSync(appShellPath) ? appShellPath : shellPath,
  'utf8',
)
if (!shell.includes(ROOT_MARKER)) {
  throw new Error(
    'Prerender: no empty #root to fill in dist/index.html or dist/app.html.',
  )
}

await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: ssrDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})

try {
  const entry = fs.readdirSync(ssrDir).find((name) => /^entry-server\.m?js$/.test(name))
  if (!entry) throw new Error('Prerender: server bundle not found in dist-ssr/')
  const server = await import(pathToFileURL(path.join(ssrDir, entry)).href)

  // The empty shell stays available for the parts of the app that are not prerendered.
  fs.writeFileSync(appShellPath, shell)

  for (const page of server.prerenderPages) {
    const html = buildPage(shell, await server.render(page.path), page.path)
    const file =
      page.path === '/'
        ? shellPath
        : path.join(dist, 'prerender', `${page.path.replace(/^\/+/, '')}.html`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, html)
  }

  fs.writeFileSync(
    path.join(dist, '404.html'),
    buildPage(shell, await server.render(server.notFoundPath), server.notFoundPath),
  )

  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    buildSitemap(server.siteUrl, server.prerenderPages),
  )

  // Tell Apache which clean URLs have a prerendered file.
  const htaccessPath = path.join(dist, '.htaccess')
  const htaccess = fs.readFileSync(htaccessPath, 'utf8')
  if (!htaccess.includes(ROUTES_MARKER)) {
    throw new Error(`Prerender: "${ROUTES_MARKER}" not found in dist/.htaccess`)
  }
  const routePattern = server.prerenderPages
    .map((page) => page.path.replace(/^\/+/, ''))
    .filter(Boolean)
    .map((route) => route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  fs.writeFileSync(
    htaccessPath,
    htaccess.replace(
      ROUTES_MARKER,
      `RewriteRule ^(${routePattern})$ /prerender/$1.html [L]`,
    ),
  )

  console.log(
    `prerender: ${server.prerenderPages.length} pages + 404.html + sitemap.xml`,
  )
} finally {
  fs.rmSync(ssrDir, { recursive: true, force: true })
}
