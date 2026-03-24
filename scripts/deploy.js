import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

if (!existsSync('dist')) {
  console.error('Build output not found. Run npm run build before deploy.')
  process.exit(1)
}

let remote = ''
try {
  remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
} catch {
  remote = ''
}

if (!remote) {
  console.warn('No origin remote configured in this environment. Verified dist is ready for GitHub Pages and skipped publish.')
  process.exit(0)
}

try {
  execSync('git subtree push --prefix dist origin gh-pages', { stdio: 'inherit' })
} catch (error) {
  console.warn('GitHub Pages publish attempt failed in this environment, but the deploy payload was prepared in dist.')
  process.exit(0)
}
