# CLAUDE.md

## Project Overview

Flames (`YunYouJun/flames`) is an unofficial, non-commercial real-time visual interpretation of the fictional 异火榜.

- **Purpose**: Procedural Three.js flame engine and Nuxt visual experience
- **Architecture**: pnpm workspaces with catalog dependencies
- **Web**: Nuxt 4 static generation + Nuxt Content
- **Docs**: VitePress + TypeDoc auto-generated API docs
- **Build**: tsdown
- **Test**: vitest
- **Lint**: @antfu/eslint-config (flat config)

## Commands

```bash
pnpm build          # Build all packages
pnpm dev            # Start the Nuxt experience
pnpm generate       # Generate the static EdgeOne artifact
pnpm test           # Run tests
pnpm e2e            # Run desktop and mobile browser tests
pnpm lint           # Lint (eslint --cache)
pnpm typecheck      # Type check (tsc --noEmit)
pnpm docs:dev       # Dev documentation site
pnpm docs:build     # Build documentation (typedoc + vitepress)
pnpm release        # bumpp -r && publish
```

## Conventions

- Use `catalog:` in package.json for shared dependency versions (defined in `pnpm-workspace.yaml`)
- Use `@antfu/ni` commands (`nr`, `nci`) in scripts and CI
- ESM only (`"type": "module"`)
- Strict TypeScript
- Each package in `packages/` has its own `tsdown.config.ts`, `src/`, `test/`

## Adding a New Package

1. Create `packages/<name>/` with: `src/index.ts`, `test/index.test.ts`, `tsdown.config.ts`, `package.json`
2. Update `tsconfig.json` paths
3. Update `typedoc.json` entryPoints
4. Use tsdown `exports.devExports` so workspaces resolve source while publish exports resolve `dist`

## Code Style

- Follows @antfu/eslint-config defaults (no prettier, no semicolons, single quotes)
- Type-first: prefer explicit types on exports
- JSDoc comments on public APIs (TypeDoc will generate docs from them)
- Do not add official novel, animation, or game assets; setting copy must be independently paraphrased
