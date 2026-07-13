# Agent Guide — olucasandrade.com

This document summarizes the architecture, tooling, and conventions of this repository for AI coding agents. It is derived from the actual project files and a verified successful build.

## Project Overview

This is the personal website and blog of **Lucas Andrade** — a bilingual (English / Portuguese) portfolio and content site built with Next.js. The canonical domain is `https://olucasandrade.com`.

- **Framework:** Next.js 15 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 3 with custom green color scale, dark mode via CSS class
- **Content:** MDX blog posts and author pages processed by `contentlayer2`
- **Internationalization:** Custom `i18next` setup (`en` default at `/`, `pt` at `/pt/...`)
- **Package manager:** `bun@1.2.21` (declared in `packageManager`)
- **No automated test suite** currently exists; verification is done via lint and build.

## Repository Layout

```
app/                  Next.js App Router
  [locale]/           Locale-scoped routes and root layout
    i18n/             i18next settings, server/client init, JSON locales
    blog/             Blog listing page
    [...notfound]/    Catch-all 404 page
    about/[...authors]/  Author detail pages
    sitemap.ts        Dynamic sitemap generator
    seo.tsx           Shared page metadata helper
    tag-data.json     Generated tag frequency data
  api/                API routes (blog stats)
  og/route.tsx        Edge OG image generator
  robots.ts           robots.txt generator
components/           Feature-organized React components
  animations/         Framer Motion providers
  blog/               Blog list, cards, stats display
  comments/           Comment system wrappers
  formspree/          Contact form integration
  home/               Homepage sections
  locale/             Locale context/provider
  navigation/         Header / Footer
  search/             kbar search provider
  seo/                JSON-LD components
  terminal/           Interactive terminal page
  theme/              Theme provider/context
  three/              React Three Fiber scenes
  ui/                 Shared UI primitives
layouts/              Page-level layout components
  home/               Home page post list
  PostLayout.tsx      Blog post layout
  FeaturedLayout.tsx  Featured posts layout
  ...
data/                 Content and site data
  blog/<locale>/      MDX blog posts
  authors/<locale>/   MDX author pages
  siteMetadata.js     Site-wide config
  localeMetadata.ts   Per-locale SEO title/description
  projectsData.ts     Project showcase data
  experienceData.ts   Work experience data
  videosData.ts       YouTube video metadata
  headerNavLinks.ts   Navigation links
  references-data.bib Citation bibliography
lib/                  Utility modules
  blog-stats.ts       Upstash Redis REST view counter
  animations.ts       Shared Framer Motion variants
hooks/                Custom React hooks
  useBlogStats.ts     Client-side blog stats hook
css/                  Tailwind, Prism, Waline styles
scripts/              Build-time scripts
  postbuild.mjs       Runs after `next build`; generates RSS feeds
  rss.mjs             RSS feed generator
public/               Static assets, generated search.json and RSS feeds
```

## Technology Stack

Key runtime / UI dependencies:

- `next` 15, `react` 19, `react-dom` 19
- `contentlayer2` + `next-contentlayer2` — MDX type generation and build pipeline
- `pliny` — MDX remark/rehype plugins and content helpers
- `tailwindcss` 3 + `@tailwindcss/typography` + `@tailwindcss/forms`
- `framer-motion` — animations
- `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-resources-to-backend` — i18n
- `zustand` — client state
- `@react-three/fiber`, `@react-three/drei`, `three` — 3D scenes
- `@headlessui/react`, `@heroicons/react` — UI primitives and icons
- `@formspree/react` — contact form backend
- `@giscus/react` — comments (configured via env vars)
- `@waline/client` — optional comment provider

Development dependencies:

- `typescript` 5, `@typescript-eslint/*`
- `eslint` 9 with `eslint-config-next`, `eslint-config-prettier`, `eslint-plugin-prettier`, `jsx-a11y`
- `prettier` 3 + `prettier-plugin-tailwindcss`
- `husky` + `lint-staged` — pre-commit hooks

## Build, Dev, and Verification Commands

Use `bun` to run scripts:

```bash
# Development server
bun run dev
# or
bun run start

# Production build (runs `next build` then `scripts/postbuild.mjs`)
bun run build

# Start production server after building
bun run serve

# Lint with auto-fix (uses the deprecated but still-working `next lint`)
bun run lint

# Format app/components/layouts with Prettier
bun run format

# Bundle analysis
bun run analyze
```

Verification baseline: `bun run lint` and `bun run build` should both pass.

### Build-time pipeline

1. `contentlayer2` scans `data/blog/**/*.mdx` and `data/authors/**/*.mdx`, generates typed documents in `.contentlayer/generated/`.
2. On success it writes:
   - `app/[locale]/tag-data.json` — tag counts split by locale
   - `public/search.json` — documents for the kbar search provider
3. `next build` prerenders static pages (home, blog, posts, projects, experience, terminal, videos, sitemap, robots).
4. `postbuild.mjs` imports `rss.mjs` and writes RSS feeds to `public/<locale>/feed.xml` and `public/<locale>/tags/<tag>/feed.xml`.

## Content Model

### Blog MDX (`data/blog/<locale>/<slug>.mdx`)

Frontmatter fields used by `contentlayer.config.ts`:

- `title` (required)
- `date` (required, ISO date)
- `language` (required, `en` or `pt`)
- `tags` (list of strings)
- `authors` (required, list of author slugs)
- `summary`
- `images` (list of image paths)
- `lastmod`
- `draft` (boolean; drafts are excluded from production lists)
- `featured` (boolean; shown in `FeaturedLayout`)
- `series` (`{ title, order }`)
- `layout`, `bibliography`, `canonicalUrl`

Computed fields include `slug`, `path`, `readingTime`, `toc`, and JSON-LD `structuredData`.

### Authors MDX (`data/authors/<locale>/<slug>.mdx`)

- `name` (required), `language` (required)
- `default`, `avatar`, `occupation`, `company`, `email`, `twitter`, `linkedin`, `github`, `layout`

### Site data

- `data/siteMetadata.js` — site title, description, social links, analytics/comments/newsletter/search config.
- `data/localeMetadata.ts` — locale-specific `<title>` and meta description.
- `data/projectsData.ts` — bilingual project cards for `/projects`.
- `data/experienceData.ts` — bilingual work experience for `/experience`.
- `data/videosData.ts` — YouTube video metadata. The `/videos` section is gated: it only appears in the nav, homepage, and sitemap once this array has entries.
- `data/headerNavLinks.ts` — top-level navigation.

## Internationalization

- Supported locales: `en` (fallback) and `pt`.
- `app/[locale]/i18n/settings.ts` defines `locales`, `LocaleTypes`, and `getOptions`.
- `app/[locale]/i18n/locales.js` defines `fallbackLng` (`en`) and `secondLng` (`pt`).
- Server-side translations: `createTranslation(locale, namespace)` from `app/[locale]/i18n/server`.
- Client-side translations: `useTranslation(locale, namespace)` from `app/[locale]/i18n/client`.
- Translation JSON files live at `app/[locale]/i18n/locales/<lang>/<namespace>.json` (namespaces: `common`, `home`, `hero`, `footer`, `about`, `experience`, `projects`, `terminal`, `videos`, `newsletter`, `notfound`, `SEO`).
- `middleware.ts`:
  - Redirects `/en/*` → `/*` so the default locale has clean URLs.
  - Rewrites locale-less paths internally to `/en/*` so Next.js routing resolves correctly.
  - Skips `api`, `static`, `track`, `data`, `css`, `scripts`, `og`, `_next`, and files with extensions.

## Runtime Architecture

- **Static generation:** Most pages are prerendered at build time (`generateStaticParams` for `[locale]` routes).
- **Dynamic routes:**
  - `app/api/blog/[slug]/stats` — GET post view/like stats
  - `app/api/blog/[slug]/view` — POST to increment view count
  - `app/api/blog/stats` — GET all posts stats
  - `app/og/route.tsx` — edge OG image generation
- **Blog stats backend:** `lib/blog-stats.ts` talks to Upstash Redis REST when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. If unset, helpers return zeros and do not throw, so local builds work without Redis.
- **Middleware:** runs on the edge for locale handling.
- **CSP / security headers:** configured in `next.config.js` (`ContentSecurityPolicy`, `Referrer-Policy`, `Strict-Transport-Security`, etc.). If you add an analytics provider or external script, extend the CSP accordingly.

## Code Style Guidelines

Prettier configuration (`prettier.config.js`):

- `semi: false`
- `singleQuote: true`
- `printWidth: 100`
- `tabWidth: 2`
- `trailingComma: 'es5'`
- `prettier-plugin-tailwindcss` class sorting enabled

ESLint (`.eslintrc.js`) extends Next.js core web vitals, TypeScript, jsx-a11y, and Prettier. Notable rule overrides:

- `react/react-in-jsx-scope: off`
- `@typescript-eslint/no-unused-vars: off`
- `@typescript-eslint/no-explicit-any: off`
- `react/no-unescaped-entities: off`

Pre-commit (`lint-staged`):

- JS/TS files: `eslint --fix`
- JS/TS/JSON/CSS/MD/MDX files: `prettier --write`

After manual edits, run `bun run format` or `npx prettier -w <files>` to keep Tailwind classes sorted.

## Path Aliases

Both `tsconfig.json` and `jsconfig.json` define aliases under `baseUrl: "."`:

- `@/components/*`
- `@/data/*`
- `@/layouts/*`
- `@/css/*`
- `@/hooks/*`
- `@/lib/*`
- `@/app/*`
- `contentlayer/generated` → `./.contentlayer/generated`

Import generated content types like: `import { allBlogs } from 'contentlayer/generated'`.

## Testing Instructions

There is currently no test framework configured (no Jest, Vitest, or Playwright). Verification is manual:

1. `bun run lint` — must report no ESLint warnings or errors.
2. `bun run build` — must complete without errors and prerender all expected pages.
3. `bun run serve` — optional local smoke test of the production build.

If you add tests, prefer keeping them co-located or under a `__tests__` directory and update this section.

## Environment Variables

Copy `.env.example` to `.env` and fill values for the services you enable. None are strictly required for a local build because `lib/blog-stats.ts` degrades gracefully when Redis is absent.

- **Giscus comments:** `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPOSITORY_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- **Analytics:** `NEXT_UMAMI_ID` (and matching CSP entry if enabled)
- **Newsletter:** one of Mailchimp / Buttondown / ConvertKit / Klaviyo / Revue / EmailOctopus keys, depending on `siteMetadata.newsletter.provider`
- **Blog stats:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Disqus / Utterances:** optional comment provider env vars

Never commit `.env` files. They are gitignored.

## Security Considerations

- `next.config.js` sets a strict CSP and HTTP security headers. Update the `ContentSecurityPolicy` string when adding new external scripts, frames, images, or connect endpoints.
- The `Permissions-Policy` disables camera, microphone, and geolocation by default.
- `robots.ts` and `sitemap.ts` expose public routes only.
- API routes do not perform authentication; blog stats are public counters.
- Keep `framer-motion`, `three`, and other client libraries up to date to avoid known vulnerabilities.

## Deployment

The project is designed to deploy on **Vercel** (Next.js native, `.vercel` is gitignored). There is no Dockerfile. The build command is `bun run build`, output goes to `.next/`. Because the site uses `next/image` and edge OG images, ensure the platform supports Node.js and Edge runtimes.

## Common Tasks for Agents

- **Add a blog post:** Create `data/blog/en/<slug>.mdx` and optionally `data/blog/pt/<slug>.mdx` with matching `slug` logic. Set `language`, `date`, `tags`, `authors`, `summary`, `images`. Run `bun run build`.
- **Update projects/experience:** Edit `data/projectsData.ts` or `data/experienceData.ts`; maintain both `en` and `pt` entries.
- **Publish a video:** Add an entry to `data/videosData.ts` following the documented shape. Once the array is non-empty, the nav link, homepage teaser, and sitemap entry activate automatically.
- **Change SEO metadata:** Update `data/localeMetadata.ts` or `data/siteMetadata.js`.
- **Add a new translation namespace:** Add JSON files under `app/[locale]/i18n/locales/<lang>/`, then import via `createTranslation` or `useTranslation`.
- **Add external integrations:** Update both `data/siteMetadata.js` and the CSP in `next.config.js`, plus environment variables.
- **Fix styling:** Prefer Tailwind utilities. Custom animations and colors are in `tailwind.config.js`. Global styles are in `css/tailwind.css`.

## Notes

- `next lint` is deprecated and will be removed in Next.js 16; the project still uses it today.
- `.yarnrc.yml` exists historically but `packageManager: "bun@1.2.21"` is the source of truth.
- A top-level `package-lock.json` outside this repo may trigger a Next.js workspace-root warning; it does not affect builds.
- The `blog/[...slug]` route renders individual posts using `layouts/PostLayout.tsx` (or `PostSimple.tsx` / `PostBanner.tsx` when a post specifies a `layout` frontmatter value).
