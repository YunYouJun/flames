import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../apps/web/.output/public/', import.meta.url))
const port = Number(process.env.FLAMES_PREVIEW_PORT || 3100)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
}

// Exercise the deployable SSG artifact, including a real 404 response, not an
// index.html rewrite that silently hydrates the home page at an unknown URL.
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`)
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`)
    if (path !== resolve(root) && !path.startsWith(`${resolve(root)}${sep}`))
      throw new Error('Outside public root')
    if ((await stat(path)).isDirectory())
      path = resolve(path, 'index.html')
    const body = await readFile(path)
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  }
  catch {
    const body = await readFile(resolve(root, '404.html')).catch(() => 'Not found')
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  }
})

server.listen(port, '127.0.0.1', () => console.log(`Static flame preview: http://127.0.0.1:${port}`))
