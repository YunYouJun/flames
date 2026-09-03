import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const publicDirectory = new URL('../apps/web/.output/public/', import.meta.url)
const assetDirectory = new URL('_nuxt/', publicDirectory)

const budgets = {
  clientJavaScriptGzip: 300 * 1024,
  clientCssGzip: 15 * 1024,
  largestJavaScriptRaw: 800 * 1024,
  publicOutputRaw: 3 * 1024 * 1024,
}

const warnings = {
  largestJavaScriptRaw: 600 * 1024,
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory.pathname, entry.name)
    if (entry.isDirectory())
      files.push(...await collectFiles(new URL(`${entry.name}/`, directory)))
    else
      files.push(path)
  }

  return files
}

function kibibytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

const publicFiles = await collectFiles(publicDirectory)
const assetFiles = await collectFiles(assetDirectory)
const javascriptFiles = assetFiles.filter(file => extname(file) === '.js')
const cssFiles = assetFiles.filter(file => extname(file) === '.css')

const javascript = await Promise.all(javascriptFiles.map(async path => ({
  path,
  contents: await readFile(path),
})))
const css = await Promise.all(cssFiles.map(async path => await readFile(path)))
const publicStats = await Promise.all(publicFiles.map(path => stat(path)))

const largestJavaScript = javascript.reduce((largest, file) => (
  file.contents.length > largest.contents.length ? file : largest
))
const measurements = {
  clientJavaScriptGzip: javascript.reduce((total, file) => total + gzipSync(file.contents).length, 0),
  clientCssGzip: css.reduce((total, file) => total + gzipSync(file).length, 0),
  largestJavaScriptRaw: largestJavaScript.contents.length,
  publicOutputRaw: publicStats.reduce((total, file) => total + file.size, 0),
}

let failed = false
for (const [name, value] of Object.entries(measurements)) {
  const limit = budgets[name]
  const warning = warnings[name]
  const marker = value > limit ? 'FAIL' : warning && value > warning ? 'WARN' : 'PASS'
  const threshold = warning
    ? `warn ${kibibytes(warning)} / hard ${kibibytes(limit)}`
    : kibibytes(limit)
  console.log(`${marker} ${name}: ${kibibytes(value)} / ${threshold}`)
  failed ||= value > limit
}

console.log(`Largest JavaScript chunk: ${relative(assetDirectory.pathname, largestJavaScript.path)}`)

if (failed)
  process.exitCode = 1
