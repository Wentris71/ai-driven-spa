/**
 * Normalizes an entity slug before persistence: trimmed and always lowercase.
 * Apply at every save site.
 */
export const normalizeSlug = (slug: string): string =>
  slug.trim().toLowerCase();
