import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  exports: {
    devExports: true,
    customExports(exports) {
      exports['./package.json'] = './package.json'
      return exports
    },
  },
  deps: {
    neverBundle: ['three'],
  },
  publint: true,
})
