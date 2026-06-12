# Plan 1/5 — Foundation: Scaffold + Conventions Harness + Tokens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working Next.js App Router app in `~/Documents/ai-driven-spa` with the full convention harness (custom ESLint rules, lint-conventions, husky, Jest, Playwright) and neutral design-token system — lints, typechecks, tests, builds green.

**Architecture:** Fresh `create-next-app` scaffold merged into the existing repo, then reviewed transplants from `~/Documents/vietnam.moto.tour` (verbatim where business-agnostic, adapted where coupled). No Supabase yet (Plan 2), no UI kit (Plan 3), no posts entity (Plan 4), no i18n (Plan 5).

**Tech Stack:** Next.js latest (App Router, TS strict, Turbopack), Tailwind v4, tailwind-variants/tailwind-merge via `cn()`/`tv()`, Jest + ts-jest + RTL, Playwright + axe, ESLint 9 flat config + 8 custom rules, Prettier, husky + lint-staged, pnpm.

**Source repo for transplants:** `/Users/wentris/Documents/vietnam.moto.tour` (referred to as `$SRC` below; every `cp` shows the literal path).

**Deferred wiring (do NOT add in this plan):** `local/no-raw-content-text` + `local/no-feature-namespace-for-common` eslint wiring → Plan 5 (i18n). `local/no-raw-file-input` + admin override blocks → Plan 4. The rule *files* are copied now (they're self-contained and tested); only config wiring is deferred.

---

### Task 1: Scaffold Next.js and merge into repo

**Files:**
- Create: entire Next.js scaffold at repo root (src/app/, package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .gitignore, eslint.config.mjs)

- [ ] **Step 1: Scaffold into temp dir** (create-next-app refuses non-empty dirs — repo already has docs/)

```bash
pnpm dlx create-next-app@latest /tmp/ads-scaffold --typescript --app --tailwind --eslint --src-dir --import-alias "@/*" --use-pnpm --turbopack --yes
```

Expected: scaffold completes, `/tmp/ads-scaffold/src/app/page.tsx` exists.

- [ ] **Step 2: Merge into repo, excluding scaffold git + README**

```bash
rsync -a --exclude .git --exclude README.md /tmp/ads-scaffold/ /Users/wentris/Documents/ai-driven-spa/
rm -rf /tmp/ads-scaffold
```

- [ ] **Step 3: Fix package name**

In `/Users/wentris/Documents/ai-driven-spa/package.json` set:

```json
"name": "ai-driven-spa",
"version": "0.1.0",
"private": true
```

- [ ] **Step 4: Verify dev baseline**

```bash
cd /Users/wentris/Documents/ai-driven-spa && pnpm install && pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold next.js app router baseline"
```

---

### Task 2: Project config — site.config.ts, Prettier, tsconfig

**Files:**
- Create: `site.config.ts`, `.prettierrc`, `.prettierignore`
- Modify: `tsconfig.json`

- [ ] **Step 1: Write `site.config.ts`** (repo root — single personalization point; `scripts/init.ts` in Plan 5 rewrites it)

```ts
/**
 * Single personalization point for a new project instance.
 * scripts/init.ts rewrites this file; nothing else hardcodes identity.
 */
export const siteConfig = {
  /** package/repo slug */
  name: 'ai-driven-spa',
  /** Human-readable product name (metadata, header) */
  title: 'AI Driven SPA',
  description: 'Next.js + Supabase business starter',
  locales: ['en'],
  defaultLocale: 'en',
} as const;

export type Locale = (typeof siteConfig.locales)[number];
```

- [ ] **Step 2: Write `.prettierrc`**

```json
{
  "singleQuote": true,
  "bracketSpacing": false
}
```

- [ ] **Step 3: Write `.prettierignore`**

```
.next/
node_modules/
pnpm-lock.yaml
public/
coverage/
playwright-report/
test-results/
```

- [ ] **Step 4: Replace `tsconfig.json`** (scaffold version, hardened to source-repo settings)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "playwright.config.ts", "e2e"]
}
```

Note: unlike the source repo, `scripts/` stays INCLUDED so `tsc` checks them (no Prisma baggage forcing exclusion here).

- [ ] **Step 5: Format + commit**

```bash
pnpm dlx prettier --write site.config.ts tsconfig.json
git add -A && git commit -m "chore: add site.config, prettier, strict tsconfig"
```

---

### Task 3: Dependencies

**Files:**
- Modify: `package.json` (deps + scripts + lint-staged)

- [ ] **Step 1: Install runtime + dev deps**

```bash
pnpm add tailwind-variants tailwind-merge
pnpm add -D jest jest-environment-jsdom ts-jest @types/jest \
  @testing-library/jest-dom @testing-library/react @testing-library/user-event \
  @playwright/test @axe-core/playwright \
  prettier eslint-config-prettier husky lint-staged tsx
```

- [ ] **Step 2: Set scripts block in `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "lint:conventions": "tsx scripts/lint-conventions.ts",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "prepare": "husky"
}
```

- [ ] **Step 3: Add lint-staged block to `package.json`** (top level, sibling of scripts)

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "jest --bail --findRelatedTests --passWithNoTests"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: add tooling dependencies and scripts"
```

---

### Task 4: Jest infrastructure

**Files:**
- Create: `jest.config.ts`, `tsconfig.jest.json`, `src/__mocks__/styleMock.ts`, `src/__mocks__/fileMock.ts`
- Copy: `jest.setup.ts` from source

- [ ] **Step 1: Write `jest.config.ts`** (source version minus swiper/three/framer mappers and NextAuth transform exceptions — those deps don't exist yet; Plan 3 re-adds the framer-motion mapper)

```ts
import type {Config} from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/__mocks__/fileMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.spec.{ts,tsx}',
    '<rootDir>/__tests__/**/*.spec.{ts,tsx}',
    '<rootDir>/scripts/**/*.spec.{ts,tsx}',
    '<rootDir>/tools/**/*.spec.{ts,tsx}',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.worktrees/',
    '<rootDir>/.claude/worktrees/',
  ],
};

export default config;
```

- [ ] **Step 2: Copy jest setup + tsconfig.jest verbatim** (setup polyfills — matchMedia, Blob.arrayBuffer, OffscreenCanvas, fetch, webcrypto — are business-agnostic; Plan 4's image pipeline tests need them)

```bash
cp /Users/wentris/Documents/vietnam.moto.tour/jest.setup.ts /Users/wentris/Documents/ai-driven-spa/jest.setup.ts
cp /Users/wentris/Documents/vietnam.moto.tour/tsconfig.jest.json /Users/wentris/Documents/ai-driven-spa/tsconfig.jest.json
```

- [ ] **Step 3: Write `src/__mocks__/styleMock.ts`**

```ts
export default {};
```

- [ ] **Step 4: Write `src/__mocks__/fileMock.ts`**

```ts
const stub = {
  src: 'test-file-stub.svg',
  width: 1216,
  height: 896,
  blurDataURL: '',
  blurWidth: 0,
  blurHeight: 0,
};

export default stub;
```

- [ ] **Step 5: Verify jest runs (no tests yet is OK)**

```bash
pnpm test --passWithNoTests
```

Expected: exits 0, "No tests found" tolerated.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "test: add jest + ts-jest infrastructure"
```

---

### Task 5: Utils — `cn`/`tv` and `normalizeSlug` (TDD)

**Files:**
- Create: `src/utils/cn.ts`, `src/utils/cn.spec.ts`, `src/utils/index.ts`, `src/utils/index.spec.ts`

- [ ] **Step 1: Write failing test `src/utils/cn.spec.ts`**

```ts
import {cn, tv} from './cn';

describe('cn', () => {
  it('joins conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('resolves conflicts between custom color tokens', () => {
    expect(cn('bg-surface', 'bg-surface-alt')).toBe('bg-surface-alt');
  });

  it('resolves conflicts between type-* utilities', () => {
    expect(cn('type-body-md', 'type-title-lg')).toBe('type-title-lg');
  });
});

describe('tv', () => {
  it('builds variants with project merge config', () => {
    const button = tv({
      base: 'bg-surface',
      variants: {tone: {primary: 'bg-primary'}},
    });
    expect(button({tone: 'primary'})).toBe('bg-primary');
  });
});
```

- [ ] **Step 2: Run, verify fails**

```bash
pnpm test src/utils/cn.spec.ts
```

Expected: FAIL — cannot find module './cn'.

- [ ] **Step 3: Write `src/utils/cn.ts`** (source file with token list swapped to the neutral palette of Task 7 — the two lists MUST stay in sync with globals.css)

```ts
import {createTV, cx, type TV} from 'tailwind-variants';
import {extendTailwindMerge} from 'tailwind-merge';

/**
 * Project tailwind-merge config. tailwind-merge does not know this app's
 * Tailwind v4 `@theme` color tokens (src/styles/globals.css) or its custom
 * `type-*` typography utilities, so conflict resolution mis-groups them
 * without this. Registering them makes "last class wins" correct for both.
 *
 * Keep in sync with the @theme tokens and `@utility type-*` declarations in
 * src/styles/globals.css.
 */
const twMergeConfig = {
  theme: {
    color: [
      'primary',
      'primary-hover',
      'on-primary',
      'danger',
      'danger-hover',
      'on-danger',
      'surface',
      'surface-deep',
      'surface-alt',
      'surface-elevated',
      'surface-inverse',
      'on-surface',
      'on-surface-secondary',
      'on-surface-tertiary',
      'on-surface-inverse',
      'border',
      'border-subtle',
      'overlay',
    ],
  },
  classGroups: {
    typography: [
      {
        type: [
          'display-lg',
          'display-md',
          'headline-lg',
          'headline-md',
          'headline-sm',
          'title-lg',
          'title-md',
          'title-sm',
          'body-lg',
          'body-md',
          'body-sm',
          'label-lg',
          'label-sm',
          'mono-label',
          'mono-data',
        ],
      },
    ],
  },
};

/** Configured variant builder — import this, never `tailwind-variants` directly. */
export const tv: TV = createTV({twMerge: true, twMergeConfig});

/**
 * A merge instance configured with the project's tokens. tailwind-variants'
 * `cnMerge` ignores a per-call `twMergeConfig` (it reads global state set by
 * `createTV`), so `cn` is built directly on tailwind-merge here.
 */
const twMerge = extendTailwindMerge<'typography'>({
  extend: {theme: twMergeConfig.theme, classGroups: twMergeConfig.classGroups},
});

/** Ad-hoc conditional join with project-aware conflict resolution. */
export function cn(...inputs: Parameters<typeof cx>): string {
  return twMerge(cx(...inputs));
}
```

- [ ] **Step 4: Run, verify passes**

```bash
pnpm test src/utils/cn.spec.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Write failing test `src/utils/index.spec.ts`**

```ts
import {normalizeSlug} from './index';

describe('normalizeSlug', () => {
  it('trims and lowercases', () => {
    expect(normalizeSlug('  Hello-World ')).toBe('hello-world');
  });

  it('leaves a clean slug untouched', () => {
    expect(normalizeSlug('clean-slug')).toBe('clean-slug');
  });
});
```

- [ ] **Step 6: Run, verify fails**

```bash
pnpm test src/utils/index.spec.ts
```

Expected: FAIL — cannot find module './index'.

- [ ] **Step 7: Write `src/utils/index.ts`** (NO business constants — the source file's contactInfo/exchange-rate/TripAdvisor exports stay behind)

```ts
/**
 * Normalizes an entity slug before persistence: trimmed and always lowercase.
 * Apply at every save site.
 */
export const normalizeSlug = (slug: string): string =>
  slug.trim().toLowerCase();
```

- [ ] **Step 8: Run, verify passes**

```bash
pnpm test src/utils
```

Expected: PASS (6 tests total).

- [ ] **Step 9: Commit**

```bash
git add src/utils && git commit -m "feat: add cn/tv wrappers and normalizeSlug with tests"
```

---

### Task 6: Custom ESLint rules + flat config

**Files:**
- Copy: entire `tools/eslint-rules/` dir (8 rules + index.js + 8 spec files) from source
- Replace: `eslint.config.mjs`

- [ ] **Step 1: Copy rules verbatim** (all 8 rules are business-agnostic AST logic; each ships with its own RuleTester spec)

```bash
mkdir -p /Users/wentris/Documents/ai-driven-spa/tools
cp -R /Users/wentris/Documents/vietnam.moto.tour/tools/eslint-rules /Users/wentris/Documents/ai-driven-spa/tools/eslint-rules
```

- [ ] **Step 2: Run the copied rule specs**

```bash
pnpm test tools/eslint-rules
```

Expected: PASS — all 8 spec files. If any spec imports something repo-specific, fix the import path, nothing else.

- [ ] **Step 3: Replace `eslint.config.mjs`** (source config adapted: Pages-Router/admin/i18n/image blocks removed — deferred per header note)

```js
import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import localRules from './tools/eslint-rules/index.js';

// Code-style AST bans (carried from vietnam.moto.tour conventions).
const noInterface = {
  selector: 'TSInterfaceDeclaration',
  message: 'Use `type`, not `interface` (CLAUDE.md Code Style).',
};
const noReactFC = {
  selector:
    "TSTypeReference[typeName.right.name=/^(FC|FunctionComponent)$/], TSTypeReference[typeName.name=/^(FC|FunctionComponent)$/]",
  message: 'Do not type components as React.FC / FunctionComponent.',
};
const noJsxElementReturn = {
  selector:
    "TSTypeReference[typeName.left.name='JSX'][typeName.right.name='Element']",
  message: 'Do not annotate a `: JSX.Element` return type — let TS infer it.',
};
const noInlineStyle = {
  selector: "JSXAttribute[name.name='style']",
  message:
    'No inline style — use Tailwind. For a dynamic/motion value, add `// eslint-disable-next-line no-restricted-syntax -- <reason>`.',
};
const noNonNull = {
  selector: 'TSNonNullExpression',
  message:
    'No non-null assertion `!` — use `?.`, a guard, or throw (CLAUDE.md Code Style).',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  prettierConfig,
  {
    rules: {
      'no-nested-ternary': 'error',
      'no-restricted-syntax': [
        'error',
        noInterface,
        noReactFC,
        noJsxElementReturn,
        noInlineStyle,
        noNonNull,
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-restricted-syntax': ['error', noReactFC, noJsxElementReturn],
    },
  },
  {
    // Tests and mocks may use non-null assertions (querySelector/getBy results);
    // every other code-style ban still applies here.
    files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}', 'src/__mocks__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noInterface,
        noReactFC,
        noJsxElementReturn,
        noInlineStyle,
      ],
    },
  },
  {
    // Local code-style rules requiring real AST logic.
    // Wired in later plans: no-raw-content-text + no-feature-namespace-for-common
    // (Plan 5, i18n), no-raw-file-input + admin overrides (Plan 4).
    files: ['src/**/*.tsx'],
    ignores: ['src/__mocks__/**', '**/*.spec.tsx', '**/*.test.tsx'],
    plugins: {local: localRules},
    rules: {
      'local/component-export-const': 'error',
      'local/one-component-per-file': 'error',
      'local/cursor-pointer-interactive': 'error',
      'local/no-classname-ternary': 'error',
      'local/no-destructive-button-style': 'error',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'public/**',
    'next-env.d.ts',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    '.worktrees/**',
    '.claude/worktrees/**',
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

Expected: exits 0 (scaffold page/layout may need minor fixes — e.g. scaffold sometimes ships inline style or `<a>`; fix violations in src, never relax rules).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: transplant custom eslint rules and flat config"
```

---

### Task 7: Design tokens + fonts + root layout + home page

**Files:**
- Replace: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Delete: scaffold assets `src/app/favicon.ico` stays; remove scaffold SVGs in `public/` (`vercel.svg`, `next.svg`, `globe.svg`, `file.svg`, `window.svg` — whatever exists)

- [ ] **Step 1: Replace `src/app/globals.css`** (neutral palette; token names MUST match `src/utils/cn.ts` twMergeConfig)

```css
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

:root {
  --surface: #fafafa;
  --surface-deep: #f0f0f1;
  --surface-alt: #ffffff;
  --surface-elevated: #ffffff;
  --surface-inverse: #18181b;
  --on-surface: #18181b;
  --on-surface-secondary: #52525b;
  --on-surface-tertiary: #a1a1aa;
  --on-surface-inverse: #fafafa;
  --border: #d4d4d8;
  --border-subtle: #e4e4e7;
  --overlay: rgb(0 0 0 / 0.5);
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --on-primary: #ffffff;
  --danger: #dc2626;
  --danger-hover: #b91c1c;
  --on-danger: #ffffff;
}

[data-theme='dark'] {
  --surface: #131316;
  --surface-deep: #0b0b0d;
  --surface-alt: #1b1b1f;
  --surface-elevated: #222227;
  --surface-inverse: #fafafa;
  --on-surface: #f4f4f5;
  --on-surface-secondary: #a1a1aa;
  --on-surface-tertiary: #71717a;
  --on-surface-inverse: #18181b;
  --border: #3f3f46;
  --border-subtle: #27272a;
  --overlay: rgb(0 0 0 / 0.7);
  --primary: #818cf8;
  --primary-hover: #a5b4fc;
  --on-primary: #1e1b4b;
}

@theme inline {
  --color-surface: var(--surface);
  --color-surface-deep: var(--surface-deep);
  --color-surface-alt: var(--surface-alt);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-inverse: var(--surface-inverse);
  --color-on-surface: var(--on-surface);
  --color-on-surface-secondary: var(--on-surface-secondary);
  --color-on-surface-tertiary: var(--on-surface-tertiary);
  --color-on-surface-inverse: var(--on-surface-inverse);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
  --color-overlay: var(--overlay);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-on-primary: var(--on-primary);
  --color-danger: var(--danger);
  --color-danger-hover: var(--danger-hover);
  --color-on-danger: var(--on-danger);
  --font-sans: var(--font-sans-stack), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono-stack), ui-monospace, monospace;
}

body {
  background-color: var(--surface);
  color: var(--on-surface);
}

/* Type scale — use these, never raw text-Npx. Keep list in sync with cn.ts. */
@utility type-display-lg {
  font-size: 3.5rem;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.02em;
}
@utility type-display-md {
  font-size: 2.75rem;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.015em;
}
@utility type-headline-lg {
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 600;
}
@utility type-headline-md {
  font-size: 1.5rem;
  line-height: 1.25;
  font-weight: 600;
}
@utility type-headline-sm {
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
}
@utility type-title-lg {
  font-size: 1.125rem;
  line-height: 1.4;
  font-weight: 600;
}
@utility type-title-md {
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 600;
}
@utility type-title-sm {
  font-size: 0.875rem;
  line-height: 1.4;
  font-weight: 600;
}
@utility type-body-lg {
  font-size: 1.125rem;
  line-height: 1.6;
  font-weight: 400;
}
@utility type-body-md {
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
}
@utility type-body-sm {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 400;
}
@utility type-label-lg {
  font-size: 0.875rem;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0.01em;
}
@utility type-label-sm {
  font-size: 0.75rem;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0.02em;
}
@utility type-mono-label {
  font-family: var(--font-mono-stack), ui-monospace, monospace;
  font-size: 0.75rem;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
@utility type-mono-data {
  font-family: var(--font-mono-stack), ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  font-weight: 400;
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type {Metadata} from 'next';
import {Inter, JetBrains_Mono} from 'next/font/google';
import {cn} from '@/utils/cn';
import {siteConfig} from '../../site.config';
import './globals.css';

const sans = Inter({subsets: ['latin'], variable: '--font-sans-stack'});
const mono = JetBrains_Mono({subsets: ['latin'], variable: '--font-mono-stack'});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang={siteConfig.defaultLocale} data-theme="light">
      <body className={cn(sans.variable, mono.variable, 'font-sans antialiased')}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx`** (placeholder; raw strings allowed until Plan 5 wires i18n + no-raw-content-text)

```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="type-mono-label text-on-surface-tertiary">ai-driven-spa</p>
      <h1 className="type-display-lg text-on-surface">Ready to build.</h1>
      <p className="type-body-md text-on-surface-secondary">
        Next.js App Router · Supabase · Tailwind v4
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Remove scaffold SVG assets**

```bash
cd /Users/wentris/Documents/ai-driven-spa && rm -f public/next.svg public/vercel.svg public/globe.svg public/file.svg public/window.svg
```

- [ ] **Step 5: Verify lint + build**

```bash
pnpm lint && pnpm build
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: neutral design tokens, fonts, root layout, placeholder home"
```

---

### Task 8: lint-conventions script (TDD)

**Files:**
- Create: `scripts/lint-conventions.ts`, `scripts/lint-conventions.spec.ts`

- [ ] **Step 1: Write failing test `scripts/lint-conventions.spec.ts`**

```ts
import {findMissingFormUtils} from './lint-conventions';

describe('findMissingFormUtils', () => {
  const exists = (present: string[]) => (f: string) => present.includes(f);

  it('flags a form component without a co-located form-utils sibling', () => {
    const files = ['src/components/Contact/ContactForm.tsx'];
    const read = () => `const {register} = useForm();`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual(files);
  });

  it('passes when the sibling form-utils file exists', () => {
    const files = ['src/components/Contact/ContactForm.tsx'];
    const read = () => `<form onSubmit={onSubmit}>`;
    const sibling = 'src/components/Contact/ContactForm.form-utils.ts';
    expect(findMissingFormUtils(files, read, exists([sibling]))).toEqual([]);
  });

  it('passes when the file imports a shared form-utils module', () => {
    const files = ['src/components/Contact/ContactEditor.tsx'];
    const read = () =>
      `import {schema} from './ContactForm.form-utils';\nconst f = useForm();`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual([]);
  });

  it('ignores files without forms', () => {
    const files = ['src/components/Card/Card.tsx'];
    const read = () => `export const Card = () => <div />;`;
    expect(findMissingFormUtils(files, read, exists([]))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, verify fails**

```bash
pnpm test scripts/lint-conventions.spec.ts
```

Expected: FAIL — cannot find module './lint-conventions'.

- [ ] **Step 3: Write `scripts/lint-conventions.ts`** (source version minus the `pnpm lint:md` chaining — markdown lint not carried)

```ts
import {readFileSync, readdirSync, existsSync, type Dirent} from 'node:fs';
import {join, extname, dirname, basename} from 'node:path';

const ROOT = process.cwd();

/**
 * A .tsx containing a form must keep its schema/defaults/handler in a
 * form-utils module — not inline. It satisfies the convention by either
 * (a) having a co-located `<Name>.form-utils.ts` sibling, or
 * (b) importing from a `*form-utils*` module (covers shared schemas, e.g.
 * an editor reusing another form's schema). Inline form logic is flagged.
 * Returns the files that violate this.
 */
export function findMissingFormUtils(
  files: string[],
  read: (f: string) => string,
  exists: (f: string) => boolean,
): string[] {
  const missing: string[] = [];
  for (const file of files) {
    const src = read(file);
    const hasForm = /useForm[(<]/.test(src) || /<form[\s>]/.test(src);
    if (!hasForm) continue;
    const importsFormUtils = /from\s+['"][^'"]*form-utils['"]/.test(src);
    if (importsFormUtils) continue;
    const name = basename(file, '.tsx');
    const sibling = join(dirname(file), `${name}.form-utils.ts`);
    if (!exists(sibling)) missing.push(file);
  }
  return missing;
}

function walk(dir: string, out: string[]): void {
  let entries: Dirent<string>[];
  try {
    entries = readdirSync(join(ROOT, dir), {withFileTypes: true});
  } catch {
    return;
  }
  for (const entry of entries) {
    const child = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(child, out);
    } else if (
      entry.isFile() &&
      extname(entry.name) === '.tsx' &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      out.push(child);
    }
  }
}

function main(): void {
  const files: string[] = [];
  walk('src', files);
  const missing = findMissingFormUtils(
    files,
    (f) => readFileSync(join(ROOT, f), 'utf8'),
    (f) => existsSync(join(ROOT, f)),
  );
  if (missing.length > 0) {
    console.error(
      `\n[lint-conventions] FAIL: missing co-located *.form-utils.ts:\n${missing.join('\n')}`,
    );
    process.exit(1);
  }
  console.log('[lint-conventions] PASS');
}

if (require.main === module) main();
```

- [ ] **Step 4: Run tests + the script itself**

```bash
pnpm test scripts/lint-conventions.spec.ts && pnpm lint:conventions
```

Expected: tests PASS; script prints `[lint-conventions] PASS`.

- [ ] **Step 5: Commit**

```bash
git add scripts && git commit -m "feat: add lint-conventions form-utils checker"
```

---

### Task 9: Husky + lint-staged hooks

**Files:**
- Create: `.husky/pre-commit`, `.husky/pre-push`

- [ ] **Step 1: Init husky**

```bash
pnpm exec husky init
```

- [ ] **Step 2: Write `.husky/pre-commit`**

```
pnpm lint-staged
```

- [ ] **Step 3: Write `.husky/pre-push`**

```
pnpm run typecheck
pnpm lint:conventions
pnpm test
```

(Source repo runs typecheck + lint:conventions on push; tests added here because lint-staged only runs related tests on commit.)

- [ ] **Step 4: Verify hook fires**

```bash
git add -A && git commit -m "chore: add husky pre-commit and pre-push hooks"
```

Expected: commit succeeds AND lint-staged output visible in commit log output.

---

### Task 10: Playwright e2e + a11y smoke

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`** (source version verbatim — already generic)

```ts
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],

  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write `e2e/smoke.spec.ts`**

```ts
import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home renders heading', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});

test('home has no serious a11y violations', async ({page}) => {
  await page.goto('/');
  const results = await new AxeBuilder({page}).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious).toEqual([]);
});
```

- [ ] **Step 3: Install chromium + run**

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test: add playwright smoke and a11y e2e"
```

---

### Task 11: README + full verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# ai-driven-spa

Canonical Next.js + Supabase business starter. Spin up a new business idea:
use this repo as a template, then run `pnpm tsx scripts/init.ts` (Plan 5)
to personalize name, locales, and accent color.

## Stack

Next.js (App Router) · React 19 · TypeScript strict · Tailwind v4 ·
Supabase (Postgres / Auth / Storage / RLS) · Jest + RTL · Playwright + axe ·
ESLint 9 flat config with custom convention rules · pnpm

## Commands

| Command                 | What                                  |
| ----------------------- | ------------------------------------- |
| `pnpm dev`              | dev server                            |
| `pnpm build`            | production build                      |
| `pnpm lint`             | eslint (incl. custom rules)           |
| `pnpm lint:conventions` | form-utils co-location check          |
| `pnpm typecheck`        | `tsc --noEmit`                        |
| `pnpm test`             | jest                                  |
| `pnpm test:e2e`         | playwright (builds + starts app)      |
| `pnpm format`           | prettier                              |

## Architecture

See `ARCHITECTURE.md` (written in Plan 5) and the design spec at
`docs/superpowers/specs/2026-06-12-ai-driven-spa-boilerplate-design.md`.
```

- [ ] **Step 2: Full verification suite**

```bash
pnpm lint && pnpm lint:conventions && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
```

Expected: every command exits 0.

- [ ] **Step 3: Commit + push**

```bash
git add -A && git commit -m "docs: add README"
git push -u origin main
```

Expected: branch `main` pushed to `github.com:Wentris71/ai-driven-spa`.
