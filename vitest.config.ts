import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Playwright uses *.spec.ts under ./tests; keep those out of Vitest runs.
    exclude: [...configDefaults.exclude, 'tests/**/*.spec.*'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
