# Nuxt Web Experience

The Nuxt application lives in `apps/web`. It owns routing, copy, local progress, responsive layout, and accessibility controls. `FlameStage.vue` translates Vue props and pointer events into the framework-agnostic engine API. WebGL initialization waits for Nuxt to restore the prerendered route's query parameters and reduced-motion preferences.

Run it from the repository root:

```bash
pnpm dev
```

Generate the static EdgeOne Pages artifact with:

```bash
pnpm generate
```

The resulting site is located at `apps/web/.output/public`.

Run `pnpm preview:web` to inspect this artifact at `http://127.0.0.1:3100`.
After generation, `FLAMES_E2E_STATIC=1 pnpm e2e --workers=1` runs the same static-site acceptance used in CI. Set `FLAMES_E2E_SOFTWARE=1` to reproduce software-WebGL conditions explicitly; this is not a real-device performance gate.

All 23 flame routes are prerendered. Unknown URLs must serve `404.html` with HTTP 404, not rewrite to the SSR home page. The build intentionally omits the `200.html` SPA-success fallback.
