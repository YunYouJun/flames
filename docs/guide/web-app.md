# Nuxt Web Experience

The Nuxt application lives in `apps/web`. It owns routing, copy, local progress, responsive layout, and accessibility controls. The `.client.vue` stage component is intentionally thin: it translates Vue props and pointer events into the framework-agnostic engine API.

Run it from the repository root:

```bash
pnpm dev
```

Generate the static EdgeOne Pages artifact with:

```bash
pnpm generate
```

The resulting site is located at `apps/web/.output/public`.
