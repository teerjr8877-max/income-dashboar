import { readdirSync, readFileSync } from 'node:fs'
import { resolve, extname, relative } from 'node:path'
import { createDemoAppData, normalizeAppData, APP_DATA_VERSION } from '../src/data/appData.js'

const root = process.cwd()
const srcDir = resolve(root, 'src')
const jsonFiles = [resolve(root, 'package.json'), resolve(root, 'public/manifest.json')]

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const nextPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(nextPath))
    } else {
      files.push(nextPath)
    }
  }

  return files
}

function fail(message) {
  console.error(`❌ ${message}`)
  process.exitCode = 1
}

function pass(message) {
  console.log(`✅ ${message}`)
}

const sourceFiles = walk(srcDir).filter((filePath) => ['.js', '.jsx', '.mjs', '.css', '.html'].includes(extname(filePath)))
const sourceTexts = sourceFiles.map((filePath) => ({ filePath, content: readFileSync(filePath, 'utf8') }))

for (const { filePath, content } of sourceTexts) {
  if (/^<<<<<<<|^=======|^>>>>>>>/m.test(content)) {
    fail(`Merge conflict marker found in ${relative(root, filePath)}.`)
  }
}

if (!process.exitCode) {
  pass('No merge conflict markers found in src/.')
}

const createRootHits = sourceTexts
  .filter(({ content }) => content.includes('createRoot('))
  .map(({ filePath }) => relative(root, filePath))

if (createRootHits.length !== 1 || createRootHits[0] !== 'src/main.jsx') {
  fail(`Expected one app entry using createRoot in src/main.jsx, found: ${createRootHits.join(', ') || 'none'}.`)
} else {
  pass('Single app entry confirmed at src/main.jsx.')
}

const appShell = readFileSync(resolve(root, 'src/App.jsx'), 'utf8')
if (!appShell.includes('Sidebar') || !appShell.includes('BottomNav')) {
  fail('App shell check failed: src/App.jsx must continue composing Sidebar and BottomNav.')
} else {
  pass('App shell composition check passed.')
}

const storeFiles = sourceFiles
  .map((filePath) => relative(root, filePath))
  .filter((filePath) => /store/i.test(filePath))

if (storeFiles.length !== 1 || storeFiles[0] !== 'src/data/appStore.js') {
  fail(`Expected only src/data/appStore.js as store file, found: ${storeFiles.join(', ') || 'none'}.`)
} else {
  pass('Single shared store file confirmed.')
}

const localStorageAdapterMentions = sourceTexts
  .map(({ filePath, content }) => ({ filePath: relative(root, filePath), count: (content.match(/createLocalStorageAdapter/g) ?? []).length }))
  .filter(({ count }) => count > 0)

if (localStorageAdapterMentions.length !== 1 || localStorageAdapterMentions[0].filePath !== 'src/data/appStore.js') {
  fail('Persistence guardrail failed: createLocalStorageAdapter must only be declared/used in src/data/appStore.js.')
} else {
  pass('Single localStorage persistence adapter confirmed.')
}

for (const filePath of jsonFiles) {
  try {
    JSON.parse(readFileSync(filePath, 'utf8'))
    pass(`Valid JSON: ${relative(root, filePath)}.`)
  } catch (error) {
    fail(`Invalid JSON in ${relative(root, filePath)}: ${error.message}`)
  }
}

const demoData = createDemoAppData()
const normalizedData = normalizeAppData({})

if (demoData.version !== APP_DATA_VERSION || normalizedData.version !== APP_DATA_VERSION) {
  fail('App data version invariant failed.')
} else {
  pass('App data version invariant passed.')
}

if (!Array.isArray(demoData.accounts) || !Array.isArray(demoData.goals) || !Array.isArray(demoData.cashFlow?.income) || !Array.isArray(demoData.cashFlow?.expenses)) {
  fail('Demo data shape invariant failed for accounts/cashFlow/goals arrays.')
} else {
  pass('Demo data top-level shape invariant passed.')
}

const invalidAccounts = demoData.accounts.filter((account) => {
  if (typeof account?.id !== 'number') {
    return true
  }

  if (!Array.isArray(account?.holdings)) {
    return true
  }

  return account.holdings.some((holding) => typeof holding?.id !== 'number' || typeof holding?.holdingName !== 'string')
})

if (invalidAccounts.length > 0) {
  fail('Account/Holding normalized shape invariant failed (id + holdings shape required).')
} else {
  pass('Account/Holding normalized shape invariant passed.')
}

if (process.exitCode) {
  console.error('\nGuardrail checks failed.')
  process.exit(process.exitCode)
}

console.log('\nAll architecture guardrails passed.')
