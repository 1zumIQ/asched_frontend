# Repository Guidelines

## Project Structure & Module Organization
The frontend is a Vue 3 + Vite app.
- `src/` application code: `App.vue`, `main.ts`, and feature folders like `components/`, `router/`, `stores/`, `types/`, `data/`, `mocks/`, and `__tests__/`.
- `public/` static assets and the MSW worker output.
- Root configs: `vite.config.ts`, `vitest.config.ts`, `eslint.config.ts`, `tsconfig*.json`, `.prettierrc.json`.

## Build, Test, and Development Commands
- `npm install` — install dependencies (Node 20.19+ or 22.12+).
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — type-check then build for production.
- `npm run build-only` — build without type-check.
- `npm run type-check` — run `vue-tsc`.
- `npm run preview` — serve the production build locally.
- `npm run test:unit` — run Vitest unit tests.
- `npm run lint` — run ESLint with auto-fix and cache.
- `npm run format` — run Prettier on `src/`.

## Coding Style & Naming Conventions
Use 2-space indentation, LF line endings, and a 100-char line width (`.editorconfig`). Prettier enforces single quotes and no semicolons. ESLint uses Vue + TypeScript recommended rules; keep formatting changes in Prettier. Name tests as `*.spec.ts` under `src/__tests__/` and follow existing file naming within each folder.

## Testing Guidelines
Unit tests live in `src/__tests__/` and run with Vitest (Vue Test Utils in devDependencies). No coverage thresholds are configured; add focused tests for new logic and UI behavior. Run `npm run test:unit` before opening a PR.

## Commit & Pull Request Guidelines
Commit history favors short, lowercase subjects such as `frontend` or `chore`; follow that lightweight style. For PRs, include a brief summary, test results (or “not run” with reason), and screenshots or GIFs for UI changes. Link related issues and call out breaking changes.
