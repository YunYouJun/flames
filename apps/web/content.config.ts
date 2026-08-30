import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    flames: defineCollection({
      type: 'page',
      source: 'flames/*.md',
    }),
  },
})
