// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    pnpm: true,
    vue: true,
    ignores: [
      'docs/api/**',
      'apps/web/.nuxt/**',
      'apps/web/.output/**',
    ],
  },
)
