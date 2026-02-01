# Repository Guidelines

## Project Structure & Module Organization
- `src/` is the Rust backend. Key areas: `server/` (Axum HTTP handlers), `orm/` (DB access), `entity/` (SeaORM models), `llm/` (LLM parsing), `bpi_rs_ext/` (Bilibili API extensions), plus `main.rs` and shared utilities.
- `frontend/` is the Vue 3 SPA. App code is in `frontend/src/` and static assets in `frontend/public/`.
- `db/` contains SQL migrations and `compose.yaml` for local Postgres.
- `static/` holds files served by the backend; `logs/` is runtime output; `target/` is build artifacts.

## Build, Test, and Development Commands
Backend (repo root):
- `cargo build` / `cargo run` for local builds and dev runs.
- `cargo build --release` / `cargo run --release` for production builds.

Frontend:
- `cd frontend && npm install` to install dependencies.
- `npm run dev` to start the Vite dev server.
- `npm run build` for production builds; `npm run preview` to serve the build.
- `npm run type-check`, `npm run lint`, `npm run format`, `npm run test:unit` for quality checks.

Database:
- `cd db && docker compose up -d` to start Postgres.
- `sea-orm-cli generate entity --output-dir ./src/entity --with-serde both --entity-format dense` to regenerate entities.

## Coding Style & Naming Conventions
- Rust edition 2024; rustfmt defaults with 4-space indentation; `snake_case` for modules/functions and `PascalCase` for types.
- Frontend uses `.editorconfig`: 2-space indentation, LF line endings, and 100-char lines.
- Format with Prettier and lint with ESLint.
- Match existing naming patterns (for example, `live_records.rs`, `server/handler.rs`).

## Testing Guidelines
- Frontend uses Vitest. Run `npm run test:unit`; place tests near components or in `frontend/src/**/__tests__`.
- Backend tests are currently minimal; add Rust unit or integration tests and run `cargo test`.

## Commit & Pull Request Guidelines
- Commit history favors short version-style messages for releases (for example, `0.7.10`). Otherwise use brief, descriptive messages.
- PRs should include a summary, test commands run (and results), and screenshots for UI changes.

## Security & Configuration Tips
- Never commit secrets. Keep `config.toml`, `account.toml`, and `.env` local.
- Document local config overrides in PR descriptions without exposing credentials.
