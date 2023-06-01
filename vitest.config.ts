import { defineVitestConfig } from 'nuxt-vitest/config'

export default defineVitestConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'cobertura']
    }
  }
})
