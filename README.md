# ai-driven-spa

Canonical Next.js + Supabase business starter. Spin up a new business idea:
use this repo as a template, then run `pnpm tsx scripts/init.ts` (Plan 5)
to personalize name, locales, and accent color.

## Stack

Next.js (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
Supabase (Postgres / Auth / Storage / RLS) · Jest + RTL · Playwright + axe ·
ESLint 9 flat config with custom convention rules · pnpm

## Commands

| Command                 | What                             |
| ----------------------- | -------------------------------- |
| `pnpm dev`              | dev server                       |
| `pnpm build`            | production build                 |
| `pnpm lint`             | eslint (incl. custom rules)      |
| `pnpm lint:conventions` | form-utils co-location check     |
| `pnpm typecheck`        | `tsc --noEmit`                   |
| `pnpm test`             | jest                             |
| `pnpm test:e2e`         | playwright (builds + starts app) |
| `pnpm format`           | prettier                         |

## Architecture

See `ARCHITECTURE.md` (written in Plan 5) and the design spec at
`docs/superpowers/specs/2026-06-12-ai-driven-spa-boilerplate-design.md`.
