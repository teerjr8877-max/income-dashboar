import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (!existsSync('dist')) {
  console.error('dist/ was not found. Run "npm run build" before deploy.')
  process.exit(1)
}

try {
  const origin = execSync('git remote get-url origin', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  console.log(`Deploy target detected: ${origin}`)
  console.log('dist/ is ready for GitHub Pages publishing with base "/income-dashboar/".')
  console.log('Automated push is skipped in this environment; connect an origin-enabled workflow or publish dist/ to gh-pages.')
} catch {
  console.log('No git origin remote is configured in this environment.')
  console.log('dist/ is ready for GitHub Pages publishing with base "/income-dashboar/".')
  console.log('Automated push is skipped because deployment credentials/remotes are unavailable here.')
}
