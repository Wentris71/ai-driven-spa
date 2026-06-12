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
