import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'

const root = process.cwd()
const dist = resolve(root, 'dist')
const src = resolve(root, 'src')

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true })
}

mkdirSync(dist, { recursive: true })
cpSync(src, resolve(dist, 'src'), { recursive: true })

const indexHtmlPath = resolve(root, 'index.html')
const distIndexHtmlPath = resolve(dist, 'index.html')
const rawIndexHtml = readFileSync(indexHtmlPath, 'utf8')
const normalizedIndexHtml = rawIndexHtml
  .replace('./src/main.jsx', './src/main.js')
  .replace('./src/main.tsx', './src/main.js')
writeFileSync(distIndexHtmlPath, normalizedIndexHtml)

function walk(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    files.push(fullPath)
  }

  return files
}

const distSrc = resolve(dist, 'src')
const files = walk(distSrc)

for (const filePath of files) {
  if (extname(filePath) !== '.jsx') {
    if (extname(filePath) === '.js') {
      const content = readFileSync(filePath, 'utf8')
      const normalized = content.replaceAll('.jsx', '.js')
      if (normalized !== content) {
        writeFileSync(filePath, normalized)
      }
    }
    continue
  }

  const content = readFileSync(filePath, 'utf8')
  const normalized = content.replaceAll('.jsx', '.js')
  const jsPath = filePath.replace(/\.jsx$/, '.js')

  mkdirSync(dirname(jsPath), { recursive: true })
  writeFileSync(jsPath, normalized)
  rmSync(filePath)

  console.log(`Transformed ${relative(dist, filePath)} -> ${relative(dist, jsPath)}`)
}

console.log('Static app copied to dist/ with browser-safe module extensions.')
