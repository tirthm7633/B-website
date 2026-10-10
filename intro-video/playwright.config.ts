// Phase 2 test matrix for the website's intro overlay (src/components/IntroVideo.tsx).
// Runs against the production build: `npm run build && npm run preview -- --port 4173` in the
// website, then `npx playwright test` here. Uses the installed Microsoft Edge (no browser download).
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  timeout: 40_000,
  workers: 3,
  reporter: [['list'], ['json', { outputFile: 'out/review/intro-tests.json' }]],
  use: {
    baseURL: process.env.SITE_URL ?? 'http://localhost:4173',
    channel: 'msedge',
    headless: true,
  },
})
