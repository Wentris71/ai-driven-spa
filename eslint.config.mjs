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
