# ai-driven-spa — Boilerplate Design

**Date:** 2026-06-12
**Status:** Approved
**Repo:** `~/Documents/ai-driven-spa` → `git@github.com:Wentris71/ai-driven-spa.git`

## Purpose

Canonical, business-agnostic starter repo extracted from the architecture of
`vietnam.moto.tour`. Spinning up a new business idea = use-as-template/degit +
run the init script. Zero business artifacts by construction: built by fresh
scaffold + reviewed transplant of proven files, never by cloning and stripping.

Budget constraint: $0 while prototyping (local Supabase via Docker, nothing
hosted); $0 live path documented (Supabase free tier + existing VPS), paid
upgrades only when an idea earns.

## 1. Tech Stack

| Layer        | Tech                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Next.js (latest stable), **App Router**, RSC + server actions          |
| Language     | TypeScript strict, React 19                                            |
| Styling      | Tailwind CSS v4 (`@theme` tokens), `tailwind-variants`, `tailwind-merge` via `cn()`/`tv()` wrappers |
| Backend      | **Supabase full**: Postgres, Auth, Storage, RLS                        |
| Supabase SDK | `@supabase/supabase-js` + `@supabase/ssr` (cookie sessions)            |
| Data fetch   | RSC + server actions primary; TanStack Query for interactive admin views |
| Forms        | react-hook-form + Yup (`*.form-utils.ts` co-location pattern)          |
| i18n         | next-intl, DB-backed `translations` table                              |
| Testing      | Jest + RTL (unit/component), Playwright + `@axe-core/playwright` (e2e/a11y) |
| Lint/format  | ESLint 9 flat config + custom rules, Prettier, husky + lint-staged     |
| Pkg manager  | pnpm                                                                   |

Explicitly dropped from source architecture: Prisma, NextAuth, filesystem
upload pipeline, pino + DB `LogEntry`, pm2/VPS scripts in-repo, Stitch MCP
design pipeline, backup-media tar machinery.

## 2. Auth & Authorization

- **Admin-only** posture: email/password sign-in, **no public signup**.
  Admins seeded via `scripts/seed-admin.ts` (uses service-role key, local or
  CI context only).
- `user_roles` table (`user_id` → `role`). A **custom-claims auth hook**
  stamps `role` into the JWT so Next.js middleware can guard `/admin/*`
  without a DB round-trip.
- RLS policy pattern:
  - public: `SELECT` only on published content (`status = 'published'`).
  - admin (`role = 'admin'` claim): full CRUD.
- Service-role key used **only** in seed/backup scripts — never in app
  runtime code paths.
- Sign-in UI: login modal from public header (no dedicated sign-in page),
  matching source pattern.

## 3. Data Layer

- Schema = SQL migrations in `supabase/migrations/`. Local dev runs the full
  stack via `supabase start` (Docker).
- Generated types: `supabase gen types typescript` → `src/types/database.ts`
  (pnpm script `db:types`).
- **Domain mapper layer survives** from source: `src/domain/<entity>/`
  converts DB Row → app type (timestamps → ISO strings, JSON columns →
  typed shapes, explicit field enumeration — no blind spreads of rows
  across the server/client boundary).
- **Reference entity: `posts`** — the single example wired end-to-end:
  - columns: `id`, `slug` (unique, normalized lowercase), `title` (localized
    JSON), `body` (localized JSON), `status` enum (`draft|published|archived`),
    `image_url`, `order`, timestamps
  - migration + RLS policies + seed
  - domain mapper + Yup form-utils
  - admin CRUD pages (list with DataGrid, new/edit with tabs, ConfirmModal
    delete, image slot)
  - public list + detail pages (RSC)
  - Jest + Playwright coverage
  - serves as the copy-me reference; per new idea it is renamed or deleted.

## 4. Image Pipeline

- Client side transplants as-is (pure client code in source):
  `image-magic.ts` (magic-byte sniff), `image-transcode.ts` (OffscreenCanvas
  → WebP, preset bounds), `image-slot.ts` (slot state machine
  `empty|saved|pending-replace|pending-delete`), `submit-with-images.ts`
  (flush deltas after entity save).
- Server write: server action validates entity/slot combo, re-sniffs magic
  bytes (must be WebP), content-hashes (sha256, 8 hex chars), uploads to
  **Supabase Storage** bucket `media` at `<entity>/<id>/<slot>.<hash>.webp`,
  updates entity row, best-effort deletes prior object.
- Bucket: public read, RLS-guarded write (admin only). Hash in filename =
  free cache busting.

## 5. i18n

- next-intl with messages loaded server-side from a `translations` table
  (`namespace`, `key`, one value column per locale).
- Genericized: locales declared once in `site.config.ts`. Default `['en']`;
  second locale opt-in. `LocalizedText` = `Record<Locale, string>`.
- Conventions carried: no raw user-visible strings in JSX; one namespace per
  page/scope; `common.*` for shared labels; missing-message errors silenced.
- Tooling carried: translation seed script, `i18n:scan` duplicate-key audit.

## 6. Conventions Harness (full transplant)

- Custom ESLint rules: `component-export-const`, `one-component-per-file`,
  `cursor-pointer-interactive`, `no-classname-ternary` + AST bans
  (`interface`, `React.FC`, `JSX.Element` return type, inline `style`,
  non-null `!` outside tests).
- `scripts/lint-conventions.ts` custom checker.
- Route registry `src/routes/registry.ts` — `routes.*.path()`, never
  hardcoded URLs. Typed-result data helpers for client-side fetches where
  server actions don't fit.
- `cn()` / `tv()` from `@/utils/cn` only — never import tailwind-merge or
  tailwind-variants directly.
- Form pattern: co-located `*.form-utils.ts` (Yup schema, inferred type,
  defaults, submit handler).
- husky: pre-commit = lint-staged (eslint --fix, prettier, related Jest);
  pre-push = tests + typecheck.
- `.claude/` rulebook + `CLAUDE.md` + `ARCHITECTURE.md` rewritten for this
  stack. `PRODUCT.md` / `DESIGN.md` ship as placeholder templates the init
  script personalizes.

## 7. UI

- Full `src/components/ui/` primitive kit transplanted (Button, Modal,
  ConfirmModal, Select, Tabs, TextInput, Textarea, NumberInput,
  SegmentedControl, FormField, ImageUpload, LocaleSwitcher, Badge, Callout,
  Avatar, …) with `ComponentName/{index.ts, ComponentName.tsx,
  ComponentName.variants.ts, ComponentName.spec.tsx}` folder pattern.
- Admin shell: AdminLayout (sidebar nav groups + entity-count stat pills),
  AdminPageShell (fixed header / scrollable body / detached-pill footer),
  AdminBreadcrumbs, DataGrid, StatusPicker.
- Public chrome: Header (nav, locale toggle, theme toggle, login button),
  Footer, mobile drawer, ScrollToTop, ThemeProvider (dark/light,
  `[data-theme]`, no-flash init script).
- Design tokens: **neutral palette** — gray surface scale + single accent
  custom property set in one place; Tailwind v4 `@theme` block; type-scale
  utilities pattern carried. All Stitch-specific wiring removed.
- Motion: framer-motion variants file + `MotionConfig reducedMotion="user"`.

## 8. Repository Layout

```
.
├── supabase/
│   ├── migrations/            SQL migrations (single source of schema truth)
│   ├── seed.sql               baseline seed
│   └── config.toml            supabase CLI config
├── src/
│   ├── app/                   App Router
│   │   ├── (public)/          public pages — home, posts list/detail
│   │   ├── admin/             admin panel (guarded)
│   │   └── api/               only where server actions don't fit
│   ├── components/{ui,admin,layout,…}
│   ├── domain/<entity>/       Row → app-type mappers + types
│   ├── data/                  server-only Supabase query helpers
│   ├── lib/                   supabase clients (browser/server/middleware),
│   │                          image pipeline, auth guards
│   ├── routes/                route registry
│   ├── styles/                globals.css (@theme tokens)
│   ├── types/database.ts      generated Supabase types
│   ├── utils/                 cn, tv, normalizeSlug, motion-variants
│   └── middleware.ts          session refresh + /admin guard
├── scripts/                   init.ts, seed-admin.ts, backup-db.ts,
│                              lint-conventions.ts, i18n tooling
├── tools/eslint-rules/        custom rules
├── e2e/                       Playwright
├── docs/
│   ├── superpowers/specs/     this file
│   └── deploy-vps.md          zero-budget live recipe
├── site.config.ts             name, locales, accent — single personalization point
├── CLAUDE.md · ARCHITECTURE.md · PRODUCT.md (template) · DESIGN.md (template)
└── .github/workflows/ci.yml   lint + typecheck + test + build
```

## 9. Init & Ops

- `scripts/init.ts` — interactive: project name, locale set, accent color →
  rewrites `package.json` name, `site.config.ts`, README title, resets
  PRODUCT.md/DESIGN.md placeholders.
- `scripts/backup-db.ts` — `pg_dump` against Supabase connection pooler
  (free tier has no automated backups).
- Deploy: **Vercel zero-config default**. `docs/deploy-vps.md` carries the
  genericized VPS recipe (Node via nvm, pm2, nginx, GitHub Action SSH) as
  the zero-budget commercial path.
- CI: GitHub Action runs lint, lint:conventions, typecheck, test, build.
  No deploy step baked in.
- Audit logging: lightweight `audit_log` table written by admin mutations
  (server actions), replacing source's pino + LogEntry system.

## 10. Build Approach

Fresh scaffold + transplant:

1. `create-next-app` (App Router, TS, Tailwind) + `supabase init`.
2. Transplant in reviewed slices from `~/Documents/vietnam.moto.tour`:
   configs → eslint rules → utils → ui kit → tokens → layout chrome →
   supabase clients/auth → domain/posts vertical → admin shell → i18n →
   scripts/docs.
3. Each transplant genericized at copy time (no vi/en literals, no VN
   business constants, no Stitch ids).
4. Verify: `pnpm lint && pnpm lint:conventions && pnpm typecheck &&
   pnpm test && pnpm build` + Playwright smoke against `supabase start`.

## Out of Scope

- Public user accounts / signup flows (add per idea when needed)
- Payments, email sending, analytics
- Stitch/design-sync tooling
- Multi-tenant anything
- CLI generator packaging (template repo only; revisit if project count grows)
