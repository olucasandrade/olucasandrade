# Work Doc 01 — Bug Fixes & Repo Hygiene

> **Execution order:** Do this document FIRST, before 02 (UX polish), 03 (3D), and 04 (videos).
> **Audience:** an implementation agent with no prior context. Everything needed is in this file.

## Project context (read once)

- Next.js 15 App Router + React 19 + TypeScript + Tailwind 3, based on the `tailwind-nextjs-starter-blog-i18n` template.
- Bilingual site (`en` default at `/`, `pt` at `/pt/...`) via a custom i18next setup in `app/[locale]/i18n/`. `middleware.ts` redirects `/en/*` → `/*` and rewrites `/*` → `/en/*` internally.
- Blog content: MDX via contentlayer2 (`data/blog/`, `data/authors/`).
- Blog view counters: Upstash Redis REST API called from `lib/blog-stats.ts`, exposed through routes in `app/api/blog/`.
- Code style: Prettier (no semicolons, single quotes), enforced by `prettier-plugin-tailwindcss`. After edits run: `npx prettier -w <files>` or `bun run format`.
- Owner facts (confirmed with the owner, do not second-guess):
  - **Canonical domain is `https://olucasandrade.com`**; `olucasandrade.dev` 301-redirects to it.
  - Owner now works at **Percona** as **Fullstack Engineer** (since Jul 2026). SCALIS is a past job.
  - Package manager going forward is **bun** (there is a recent commit "Update bun lockfile").
- Verification baseline: `bun install && bun run build` must pass at the end. Note `lib/blog-stats.ts` currently **throws at import time** if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are unset — issue 1 fixes that; until then, export dummy values to build locally.

---

## Issue 1 — `lib/blog-stats.ts` crashes the whole app when env vars are missing

**File:** `lib/blog-stats.ts` lines 7–14.

**Problem:** The module throws a `TypeError` at import time when `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is unset. Any route that imports it (all of `app/api/blog/**`) — and therefore the build itself — dies. A missing analytics counter must never take the site down.

**Fix:**
1. Delete the module-level `if (!REST_URL || !REST_TOKEN) throw` block.
2. Add a helper at the top:
   ```ts
   function upstashConfigured(): boolean {
     return Boolean(REST_URL && REST_TOKEN)
   }
   ```
3. In `upstashGet`: if not configured, return `null`.
4. In `upstashSet`: if not configured, return silently (no-op).
5. In `upstashScan`: if not configured, return `{ cursor: '0', keys: [] }`.
6. `upstashMGet` already early-returns on empty keys; also early-return `[]` if not configured.
7. Result: with no env vars, all stats read as 0 and writes are dropped — site fully functional.

**Acceptance:** `unset UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN; bun run build` succeeds; `curl localhost:3000/api/blog/stats` returns `{}` (HTTP 200), not 500.

## Issue 2 — View counter arithmetic on `undefined` (NaN corruption)

**File:** `lib/blog-stats.ts`, `getBlogStatsBySlug` (lines 96–99) and `incrementViews` (lines 116–126).

**Problem:** `getBlogStatsBySlug` does:
```ts
const data = (await upstashGet(`blog-stats:${slug}`)) || '{}'
return JSON.parse(data) || { likes: 0, views: 0, likedBy: [] }
```
`JSON.parse('{}')` is `{}` — truthy — so the fallback **never** applies. For a new slug, `stats.views` is `undefined`, and `incrementViews` computes `undefined + 1 = NaN`, which `JSON.stringify` serializes as `null`. Counts start corrupted.

**Fix:** Make `getBlogStatsBySlug` normalize fields explicitly:
```ts
export async function getBlogStatsBySlug(slug: string): Promise<BlogStats> {
  const data = await upstashGet(`blog-stats:${slug}`)
  let parsed: Partial<BlogStats> = {}
  if (data) {
    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = {}
    }
  }
  return {
    likes: typeof parsed.likes === 'number' ? parsed.likes : 0,
    views: typeof parsed.views === 'number' ? parsed.views : 0,
    likedBy: Array.isArray(parsed.likedBy) ? parsed.likedBy : [],
  }
}
```
The `typeof === 'number'` checks also heal any already-corrupted `null`/`NaN` values in Redis on next write.

**Acceptance:** increment a brand-new slug via `curl -X POST localhost:3000/api/blog/test-slug/view` twice → responses show `views: 1` then `views: 2`.

## Issue 3 — Lost updates: non-atomic read-modify-write on views

**File:** `lib/blog-stats.ts` (`incrementViews`), `app/api/blog/[slug]/view/route.ts`.

**Problem:** `incrementViews` GETs the JSON blob, `+= 1`, SETs it back. Two concurrent views lose one count. Upstash supports atomic `INCR`.

**Fix (restructure keys):**
1. Store views as their own integer key: `blog-stats:{slug}:views`, incremented with the Upstash REST `INCR` endpoint:
   ```ts
   async function upstashIncr(key: string): Promise<number> {
     if (!upstashConfigured()) return 0
     const res = await fetch(`${REST_URL}/incr/${encodeURIComponent(key)}`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${REST_TOKEN}` },
     })
     if (!res.ok) throw new Error(`Upstash INCR failed: ${res.status}`)
     const body = (await res.json()) as { result: number }
     return body.result
   }
   ```
2. `incrementViews(slug)` becomes: `const views = await upstashIncr(\`blog-stats:${slug}:views\`); return { likes: 0, views }`.
3. **One-time migration concern:** existing counts live inside the JSON blob under `blog-stats:{slug}`. In `getPostStats`, read BOTH the new integer key and the legacy blob, and return `legacy.views + newCounter` so history is preserved without a migration script. Document this in a code comment: `// legacy blob holds pre-2026 counts; integer key holds increments since`.
4. Update `getAllPostsStats` / `getAllKeysAndValues` to scan `blog-stats:*` and merge: keys ending in `:views` contribute the integer; plain keys contribute the legacy blob's `views`. The returned shape must stay `Record<string, { views: number }>` keyed by `blog-stats:{slug}` because `components/blog/InfiniteBlogList.tsx` line 269 reads `blogStats[\`blog-stats:${slug}\`]?.views`.

**Acceptance:** fire 10 parallel `curl -X POST .../view` requests (`for i in $(seq 10); do curl -s -X POST ... & done; wait`) → final count increases by exactly 10.

## Issue 4 — Sitemap emits redirecting URLs, a 404 route, and junk duplicates

**File:** `app/[locale]/sitemap.ts` (entire file).

**Problems (all confirmed in code):**
1. Every "main" URL is built as `${siteUrl}/${fallbackLng}/...` (e.g. `https://…/en/blog/x`) — but `middleware.ts` 301-redirects `/en/*` to `/*`. Search engines are handed redirect URLs.
2. The static routes list includes `'tags'` (line 57) but **no `app/[locale]/tags` page exists** — that sitemap URL 404s.
3. The `alternateUrls` logic compares a route name to a locale (`if (route !== fallbackLng)`), which is always true, generating duplicates papered over by the dedup at line 82.
4. Alternate entries are pushed as `{ url, lang }` — `lang` is not a valid sitemap field, and those entries lack `lastModified`/`priority`.

**Fix — rewrite the file:**
```ts
import { MetadataRoute } from 'next'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { fallbackLng, secondLng } from './i18n/locales'

// Default locale (en) lives at the root path; middleware redirects /en/* to /*.
const localePath = (locale: string, path: string) => {
  const prefix = locale === fallbackLng ? '' : `/${locale}`
  return `${siteMetadata.siteUrl}${prefix}${path}`.replace(/\/$/, '') || siteMetadata.siteUrl
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split('T')[0]

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: localePath(post.language, `/blog/${post.slug}`),
      lastModified: post.lastmod || post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const authorRoutes = allAuthors.map((author) => ({
    url: localePath(author.language, `/about/${author.slug}`),
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const staticRoutes = ['', '/blog', '/projects', '/experience', '/terminal'].flatMap((route) =>
    [fallbackLng, secondLng].map((locale) => ({
      url: localePath(locale, route),
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.8,
    }))
  )

  return [...staticRoutes, ...blogRoutes, ...authorRoutes]
}
```
Note: each post exists in ONE language (`post.language`), so emit exactly one URL per post — do not fabricate alternate-language URLs for content that doesn't exist (the old code did, producing more soft-404s).

**Acceptance:** `bun run build && bun run serve`, then `curl localhost:3000/sitemap.xml`: no URL contains `/en/`, no `/tags` URL, and spot-checked URLs return 200 (not 301/404).

## Issue 5 — Canonical domain: update `siteUrl` to `.com`

**File:** `data/siteMetadata.js` line 9.

**Fix:** `siteUrl: 'https://olucasandrade.com'`. This propagates to `metadataBase`, OG tags, alternates, sitemap, and RSS (`scripts/rss.mjs` reads siteMetadata — verify it does; if it hardcodes a domain, fix it too). Grep for other literal `.dev` references: `grep -rn "olucasandrade.dev" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.mdx" --include="*.json" app components data layouts lib scripts` and update each to `.com`.

**Acceptance:** grep returns zero hits for `olucasandrade.dev` in source files.

## Issue 6 — Stale job metadata (SCALIS → Percona)

**Files & exact changes:**
1. `data/siteMetadata.js` line 6: description mentions "Senior Backend Engineer at SCALIS". Change to: `'Fullstack Engineer at Percona sharing insights about Python, Go, React, PostgreSQL, and system design'` (mirror the already-updated tone in `data/localeMetadata.ts`).
2. `data/authors/en/lucas-andrade.mdx` and `data/authors/pt/lucas-andrade.mdx` frontmatter: `occupation` and `company: SCALIS` are stale — set company to `Percona`, occupation to `Fullstack Engineer` (EN) / `Engenheiro Fullstack` (PT). Also re-read the body prose of both files and update any "SCALIS"/"Senior Backend" sentences.
3. `components/terminal/commands/portfolio.ts`: read the whole file; the `about` and `experience` command texts likely still describe SCALIS as current. Make them match `data/experienceData.ts` (Percona = current, SCALIS = Dec 2025–Jul 2026).
4. `data/experienceData.ts`: fix typo `'Bulding'` → `'Building'` (EN Percona description); remove trailing whitespace after `company: 'Percona', `; EN description grammar: `'Building global, impactful products that support our mission of creating a great open-source observability environment'`.

**Acceptance:** `grep -rni "scalis" data components` shows only the historical experience-timeline entries (those are correct to keep).

## Issue 7 — Header nav active-state false positives

**File:** `components/navigation/Header.tsx` line 48.

**Problem:** `const isSelected = pathname!.includes(link.href as string)` — a blog post at `/blog/why-i-love-projects` highlights **Projects**; any path containing the substring matches.

**Fix:** match on path segments:
```ts
const segments = pathname?.split('/').filter(Boolean) ?? []
// segments[0] may be the locale ('pt'); strip it
const pathWithoutLocale = '/' + segments.filter((s) => s !== locale).join('/')
const isSelected =
  pathWithoutLocale === link.href || pathWithoutLocale.startsWith(link.href + '/')
```
Also add `aria-current={isSelected ? 'page' : undefined}` on the `Link`.

**Acceptance:** visit `/blog/<any-post>` → only Blog highlighted; `/pt/projects` → only Projects; `/experience` → only Experience.

## Issue 8 — Terminal scanline overlay covers the entire viewport

**File:** `components/terminal/Terminal.tsx` lines 314–332.

**Problem:** The scanline `<div>` (line 332) uses `absolute inset-0`, but no ancestor inside the terminal is positioned — the overlay anchors to the viewport/body and paints faint green lines over the whole page.

**Fix:** add `relative` to the scrollable content container (line 329): `className="relative h-[400px] overflow-y-auto p-4 font-mono text-sm md:h-[500px]"`. (The content div is the right scope — the title bar shouldn't have scanlines.)

**Acceptance:** on `/terminal`, DevTools-inspect the scanline div — its bounding box equals the terminal content box, not the page.

## Issue 9 — Next 15 typing lie in root layout `generateMetadata`

**File:** `app/[locale]/layout.tsx` lines 32–37.

**Problem:** `params` is declared as `{ locale: LocaleTypes }` but Next 15 passes a `Promise`, and the code already does `(await params)`. Works at runtime; wrong type.

**Fix:** change the signature to `{ params }: { params: Promise<{ locale: LocaleTypes }> }` (matching `RootLayout` below it, which is already correct).

**Acceptance:** `npx tsc --noEmit` produces no NEW errors relative to before the change.

## Issue 10 — `<link>`/`<meta>` tags rendered as direct children of `<html>`

**File:** `app/[locale]/layout.tsx` lines 103–110.

**Problem:** favicon/manifest/theme-color tags sit between `<html>` and `<body>`. React 19 hoists them, but this bypasses the Metadata API and is invalid JSX structure prone to hydration warnings.

**Fix:** delete those lines and express them via the Metadata API:
```ts
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#000' },
  ],
}
```
and inside the object returned by `generateMetadata` add:
```ts
icons: {
  icon: [
    { url: '/static/favicons/favicon.ico' },
    { url: '/static/favicons/favicon.png', type: 'image/png' },
  ],
  other: [{ rel: 'mask-icon', url: '/static/favicons/safari-pinned-tab.svg', color: '#16a34a' }],
},
manifest: '/static/favicons/site.webmanifest',
```
The RSS `<link rel="alternate">` is already covered by `alternates.types`. The `msapplication-TileColor` meta can be dropped (legacy IE11).

**Acceptance:** view page source → favicon/manifest/theme-color tags appear inside `<head>`; no console hydration warnings.

## Issue 11 — Catch-all directory named with a space: `app/[locale]/[...not found]`

**Problem:** the segment param is literally `not found` (with a space). It works as a catch-all but is fragile and confusing.

**Fix:** `git mv 'app/[locale]/[...not found]' 'app/[locale]/[...notfound]'`. Read the `page.tsx` inside first — if it references the param name, update it.

**Acceptance:** `bun run build` passes; visiting `/some/garbage/path` still renders the custom not-found UI.

## Issue 12 — Dead code and fake behavior in `InfiniteBlogList`

**File:** `components/blog/InfiniteBlogList.tsx`.

**Fixes:**
1. Lines 133–140: the "Debounced search handler" `useEffect` is a no-op (empty timer). Delete it and the `SEARCH_DEBOUNCE_MS` constant.
2. Lines 107–116 (`loadMore`): remove the artificial `setTimeout(300)` — call `setDisplayedPosts((prev) => prev + POSTS_PER_LOAD)` synchronously and drop the `isLoading` state plus the spinner branch of the button (the operation is instant; fake spinners erode trust).

**Acceptance:** searching filters instantly; Load More appends instantly with no spinner flash; `grep -n "Simulate loading" components/blog/InfiniteBlogList.tsx` returns nothing.

## Issue 13 — View counting is inflated (every mount, double-fire, bots)

**Files:** `components/blog/BlogStats.tsx` (lines 27–49).

**Problems:** a POST fires on every component mount — React StrictMode double-fires it in dev, every revisit and locale flip counts again, and JS-executing bots count too.

**Fix (client-side dedup, keep it simple):** in `BlogStats.tsx`, guard with `sessionStorage`:
```ts
const viewedKey = `viewed:${slug}`
if (!sessionStorage.getItem(viewedKey)) {
  sessionStorage.setItem(viewedKey, '1')
  await fetch(`/api/blog/${encodeURIComponent(slug)}/view`, { method: 'POST' })
}
// always fetch current stats afterwards
```
Remove `locale` from the effect dependency array (slug is enough; a locale flip should not re-count).

**Acceptance:** open a post, reload → only one POST in the network tab per browser session; count increases by 1 total.

## Issue 14 — Truly dead code: likes system

**File:** `lib/blog-stats.ts` (`toggleLike`, `hasUserLiked`, `likedBy` field).

**Problem:** no route or component calls `toggleLike`/`hasUserLiked` (verified by grep — only `incrementViews` is used). The `likedBy` array would also store user IDs/IPs in plaintext (LGPD concern) if ever wired up.

**Fix:** delete `toggleLike`, `hasUserLiked`, and the `likedBy` field from the `BlogStats` interface. If likes are wanted later, that's a new feature with hashed identifiers — out of scope.

**Acceptance:** `grep -rn "toggleLike\|hasUserLiked\|likedBy" --include="*.ts*" app components lib` returns nothing; build passes.

## Issue 15 — Stats endpoint SCANs all of Redis on every request, uncached

**Files:** `app/api/blog/stats/route.ts`, `lib/blog-stats.ts` line 88.

**Fixes:**
1. Remove the stray `console.log(keys, values[0])` (blog-stats.ts line 88).
2. Add caching so each blog-list page load doesn't trigger a full SCAN: in `app/api/blog/stats/route.ts` return with `headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }`.

**Acceptance:** response headers include the cache-control value; no console output on stats requests.

## Issue 16 — Three lockfiles, wrong `packageManager` field, template `name`

**Files:** repo root, `package.json`.

**Problem:** `yarn.lock`, `package-lock.json`, and `bun.lockb` all exist; `packageManager` says `yarn@4.0.2`; recent commit history says "Update bun lockfile". Installers and CI can pick the wrong manager nondeterministically.

**Fix:**
1. `git rm yarn.lock package-lock.json` (bun is the chosen manager).
2. In `package.json`: remove `"packageManager": "yarn@4.0.2"` (or set it to `"bun@<output of bun --version>"`).
3. Change `"name"` from `tailwind-nextjs-starter-blog-i18n` to `"olucasandrade"`.
4. Run `bun install` to refresh `bun.lockb`.

**Acceptance:** only `bun.lockb` remains; `bun install && bun run build` passes.

## Issue 17 — Unused dependencies

**File:** `package.json`.

**Verified findings:**
- `redis` (^5.8.2): zero imports anywhere (blog-stats uses raw fetch to the Upstash REST API). **Remove.**
- `react-spring` (^9.7.5): used ONLY in `components/theme/DarkModeSwitch.tsx` (`@react-spring/web` import). Migrate that one component to `framer-motion` (already a dependency): read the file first, reproduce its exact animated behavior with `motion` components + `transition={{ type: 'spring' }}`, then **remove `react-spring`**.

Before removing anything, re-confirm: `grep -rn "<pkg>" app components layouts lib scripts`. Then `bun remove redis react-spring`.

**Acceptance:** build passes; dark-mode toggle still animates.

## Issue 18 — CSP loosened to the point of uselessness

**File:** `next.config.js` lines 8–17.

**Problems:** `img-src * blob: data:`, `connect-src *`, and plaintext `http://www.youtube.com` in `script-src`.

**Fix (tighten while keeping current features + upcoming videos, doc 04):**
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https://i.ytimg.com https://avatars.githubusercontent.com;
media-src 'self' *.s3.amazonaws.com;
connect-src 'self' https://formspree.io https://api.buttondown.email;
font-src 'self';
frame-src giscus.app https://www.youtube-nocookie.com;
```
Notes: `'unsafe-eval'/'unsafe-inline'` stay (Next.js requirement without nonce plumbing); keep `giscus.app` (comments configured, currently disabled); `i.ytimg.com` + `youtube-nocookie.com` are required by doc 04 (videos); Upstash is called server-side so it doesn't need `connect-src`. After deploying, click through every page with the DevTools console open and add any legitimately blocked origin back deliberately.

**Acceptance:** no CSP violations in the console on: home, blog list, a blog post, projects, experience, terminal (play snake briefly), contact modal open, newsletter form, language switch, theme switch.

## Issue 19 — Unused image remote pattern

**File:** `next.config.js` lines 63–71. `picsum.photos` is allowed but never used (`grep -rn "picsum" app components layouts data` → empty). Replace the entry with `{ protocol: 'https', hostname: 'i.ytimg.com' }` (needed by doc 04).

**Acceptance:** build passes; no `next/image` errors on any page.

## Issue 20 — Rename embarrassing asset filename

**File:** `public/static/images/Pixel_Art_Portrait_of_Stylish_Youth-removebg-preview.png`, referenced at `app/[locale]/projects/page.tsx` line 33.

**Fix:** `git mv` to `public/static/images/avatar-pixel.png`; update the reference. (Whether this image should be used at all is doc 02's decision — here we only fix the name.)

**Acceptance:** projects page renders the image; grep for the old filename returns nothing.

---

## Final verification (run all)

```bash
bun install
npx tsc --noEmit
bun run lint
bun run build
bun run serve   # then click through every page in both locales
```

Commit strategy: one commit per issue number (e.g. `fix: sitemap emits canonical URLs (issue 4)`), so each is independently revertable.
