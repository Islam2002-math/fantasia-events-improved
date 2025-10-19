import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3002', // Correct port for Next.js dev server
    headless: true,
  },
})