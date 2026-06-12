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
