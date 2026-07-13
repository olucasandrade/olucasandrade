# Work Doc 04 — Videos Section

> **Execution order:** after `01-issues.md` (CSP + image patterns) and ideally after `02-ux-ui-polish.md` (card recipe). Independent of doc 03.
> **Audience:** an implementation agent with no prior context.

## Product decisions (made with the owner — do not relitigate)

- Content: **short self-produced technical clips** (demos of his projects like Kaptanto/rsight, Postgres tips, systems-design explainers). No content exists yet — this ships the fully working section so the first upload lights it up.
- Hosting: **YouTube**, embedded via a **lite facade** (thumbnail + play button; the real iframe loads only on click, from `youtube-nocookie.com`). Free bandwidth + discoverability; zero iframes on initial load.
- Placement: **dedicated `/videos` page** with its own nav item. Nav link is **hidden while the video list is empty**, so this can merge to `main` immediately.
- Clips may be in either language; the page shows all clips with a language badge, and titles/descriptions are localized in the data file.
- Site context: Next.js 15 App Router, React 19, bilingual (`/` = EN, `/pt` = PT) via `app/[locale]/`, translations in `app/[locale]/i18n/locales/{en,pt}/*.json`, Prettier no-semicolons single-quotes, package manager bun.

## Prerequisites from doc 01 (verify before starting)

- `next.config.js` CSP `frame-src` includes `https://www.youtube-nocookie.com` (it already does in the current file) and `img-src` includes `https://i.ytimg.com` (doc 01 issue 18 adds it — if not done, add now).
- `next.config.js` `images.remotePatterns` includes `{ protocol: 'https', hostname: 'i.ytimg.com' }` (doc 01 issue 19 — add if missing).
- `data/siteMetadata.js` `siteUrl` is `https://olucasandrade.com`.

---

## Step 1 — Data model: `data/videosData.ts`

Follow the spirit of `data/projectsData.ts` but NOT its per-locale-array shape — a video is one entity with localized text, so use localized fields:

```ts
export type VideoFormat = 'landscape' | 'short' // 16:9 vs 9:16 (YouTube Shorts)

export type Video = {
  /** the 11-char YouTube video id, e.g. 'dQw4w9WgXcQ' */
  youtubeId: string
  title: { en: string; pt: string }
  description: { en: string; pt: string }
  /** ISO date YYYY-MM-DD */
  publishedAt: string
  /** display duration, e.g. '4:32' */
  duration: string
  /** spoken language of the clip */
  language: 'en' | 'pt'
  format: VideoFormat
  tags: string[]
  /** optional deep links to related content */
  relatedProject?: string // external URL, e.g. 'https://github.com/olucasandrade/kaptanto'
  relatedPost?: string // blog slug
}

const videosData: Video[] = []

export default videosData
```

Ship it **empty**. Add a comment block at the top explaining how to add a video (copy the field list with an example using a made-up id) — see Step 9.

## Step 2 — Lite YouTube embed: `components/videos/LiteYouTube.tsx`

A dependency-free facade:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LiteYouTubeProps {
  youtubeId: string
  title: string
  format?: 'landscape' | 'short'
}

export default function LiteYouTube({ youtubeId, title, format = 'landscape' }: LiteYouTubeProps) {
  const [activated, setActivated] = useState(false)
  const aspect = format === 'short' ? 'aspect-[9/16]' : 'aspect-video'

  if (activated) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg ${aspect}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play: ${title}`}
      className={`group relative w-full overflow-hidden rounded-lg ${aspect} bg-gray-950`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {/* play button */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/90 shadow-primary-glow transition-transform duration-200 group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
```

Notes for the implementer:
- Thumbnail: `hqdefault.jpg` always exists; `maxresdefault.jpg` often 404s for fresh uploads — do not use it without a fallback.
- For `format='short'` thumbnails are still 16:9 letterboxed; `object-cover` on a 9/16 box crops acceptably.
- Autoplay-on-click works because activation is a user gesture.
- Custom cursor (doc 02): once activated, the iframe shows the native cursor automatically via the doc 02 task 1 iframe handling — nothing extra needed here.

## Step 3 — Translations

Create `app/[locale]/i18n/locales/en/videos.json`:
```json
{
  "title": "Videos",
  "description": "Short technical clips — project demos, Postgres tips, and systems design explainers.",
  "empty": "No videos yet. First clips are coming soon!",
  "playAria": "Play video: ",
  "languageBadge": "Language",
  "relatedProject": "Related project",
  "relatedPost": "Related article"
}
```
And `app/[locale]/i18n/locales/pt/videos.json`:
```json
{
  "title": "Vídeos",
  "description": "Clipes técnicos curtos — demos de projetos, dicas de Postgres e explicações de systems design.",
  "empty": "Nenhum vídeo ainda. Os primeiros clipes chegam em breve!",
  "playAria": "Reproduzir vídeo: ",
  "languageBadge": "Idioma",
  "relatedProject": "Projeto relacionado",
  "relatedPost": "Artigo relacionado"
}
```
Also add the nav label to `app/[locale]/i18n/locales/{en,pt}/common.json`: the Header renders `t(link.title.toLowerCase())`, so the key is `"videos"`: EN `"Videos"`, PT `"Vídeos"`. **Read `common.json` first** to confirm the existing key style (`home`, `blog`, `projects`, …) and match it.

## Step 4 — The page: `app/[locale]/videos/page.tsx`

Server component; copy the structure of `app/[locale]/projects/page.tsx` (metadata via `genPageMetadata`, translations via `createTranslation(locale, 'videos')`).

```tsx
import { Metadata } from 'next'
import { genPageMetadata } from 'app/[locale]/seo'
import { createTranslation } from '../i18n/server'
import { LocaleTypes } from '../i18n/settings'
import videosData from '@/data/videosData'
import VideoGrid from '@/components/videos/VideoGrid'
import VideoJsonLd from '@/components/videos/VideoJsonLd'

interface PageProps {
  params: Promise<{ locale: LocaleTypes }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'videos')
  return genPageMetadata({ title: t('title'), params: { locale } })
}

export default async function Videos({ params }: PageProps) {
  const { locale } = await params
  const { t } = await createTranslation(locale, 'videos')
  const videos = [...videosData].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {videos.length > 0 && <VideoJsonLd locale={locale} />}
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl">
          {t('title')}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t('description')}</p>
      </div>
      <div className="py-12">
        {videos.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('empty')}</p>
        ) : (
          <VideoGrid videos={videos} locale={locale} />
        )}
      </div>
    </div>
  )
}
```

## Step 5 — The grid: `components/videos/VideoGrid.tsx` (+ `VideoCard.tsx`)

Client component (needs the play interaction). Requirements:

1. Layout: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`. `format='short'` cards simply render taller inside their cell; do NOT masonry — keep it simple.
2. Extract the single card into `components/videos/VideoCard.tsx` (the home teaser in Step 8 reuses it). Each card uses the doc 02 card recipe: `rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80` + `transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-glow`, containing:
   - `<LiteYouTube youtubeId={v.youtubeId} title={v.title[locale]} format={v.format} />`
   - Below (padding `p-4`): localized title (`text-lg font-bold`), localized description (`line-clamp-2 text-sm text-gray-500 dark:text-gray-400`), then a meta row: duration (`font-mono text-xs`), publish date via `formatDate` from `pliny/utils/formatDate` (same util the blog list uses), and a **language badge** pill (`rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300`) reading `EN` or `PT` per `v.language`.
   - If `relatedPost` is set: a small link `→ {t('relatedPost')}` to `/${locale}/blog/${v.relatedPost}`; if `relatedProject`: same pattern, external URL.
3. Tag filter: reuse the pattern from `components/blog/InfiniteBlogList.tsx` (pill buttons toggling `selectedTags`, OR-matching) — render the filter row only when there are > 4 videos.
4. Entry animation: `staggerContainer`/`fadeUp` from `lib/animations.ts`.

## Step 6 — Navigation (hidden while empty)

**File:** `data/headerNavLinks.ts` — add `{ href: '/videos', title: 'Videos' }` after Projects.

**Files:** `components/navigation/Header.tsx` and `components/navigation/MobileNav.tsx` — both map over `headerNavLinks`. At the top of each:

```ts
import videosData from '@/data/videosData'

const visibleLinks = headerNavLinks.filter(
  (link) => link.href !== '/videos' || videosData.length > 0
)
```
Use `visibleLinks` in place of `headerNavLinks` in the render (keep Header's existing `link.href !== '/'` filter too).

**File:** `app/[locale]/sitemap.ts` (rewritten in doc 01 issue 4) — add `'/videos'` to the static routes array only when `videosData.length > 0` (import it; the sitemap runs at build time).

## Step 7 — SEO: VideoObject structured data

**File:** `components/videos/VideoJsonLd.tsx` (server component; look at the existing `components/seo/JsonLd.tsx` first and match its conventions if they differ):

```tsx
import videosData from '@/data/videosData'
import siteMetadata from '@/data/siteMetadata'

export default function VideoJsonLd({ locale }: { locale: 'en' | 'pt' }) {
  const items = videosData.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title[locale],
    description: v.description[locale],
    thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`],
    uploadDate: v.publishedAt,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
    inLanguage: v.language,
    author: { '@type': 'Person', name: siteMetadata.author, url: siteMetadata.siteUrl },
  }))
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(items) }} />
  )
}
```

## Step 8 — Home page teaser (only when content exists)

**File:** `app/[locale]/page.tsx`. Between `<ExperienceSummary />` and `<HomeLayout …>`, when `videosData.length >= 3`, render a "Latest videos" strip: the 3 newest videos in a 3-column grid of `VideoCard`s, a section heading (add `"latestVideos": "Latest videos"` / `"Vídeos recentes"` to `{en,pt}/home.json`), and an "all videos →" link to `/${locale}/videos` styled like the existing "see all" links (see `ExperienceSummary`). Guard entirely behind the length check so the empty state renders nothing.

## Step 9 — Publishing workflow (write this into the data file's top comment)

1. Upload the clip to YouTube (public or unlisted both work with the embed).
2. Copy the 11-char id from the URL.
3. Add an entry to `data/videosData.ts` with both EN and PT title/description, `publishedAt` (ISO `YYYY-MM-DD`), `duration`, `language`, `format` (`short` for vertical Shorts), tags, and optional related links.
4. `bun run build` → the /videos page, nav item, home teaser (at ≥3 videos), and sitemap entry all activate automatically.

---

## Acceptance checklist

With `videosData` empty (as merged):
- [ ] No "Videos" item in desktop or mobile nav; `/videos` and `/pt/videos` still render the empty-state message — direct visits don't 404.
- [ ] Sitemap contains no `/videos` URL. Build passes.

With 3+ test entries temporarily added (use real public YouTube ids, then revert):
- [ ] `/videos` and `/pt/videos` render the grid; titles/descriptions localized; language badges correct.
- [ ] No YouTube iframe in the initial HTML (view source) — iframes appear only after clicking a thumbnail; video then autoplays.
- [ ] No CSP violations in console (thumbnail from `i.ytimg.com`, iframe from `youtube-nocookie.com`).
- [ ] `short`-format card renders 9/16 without breaking the grid row.
- [ ] Tag filter appears (>4 videos) and filters correctly.
- [ ] Home teaser shows the 3 newest; "all videos" link works.
- [ ] JSON-LD validates in Google's Rich Results test.
- [ ] Keyboard: thumbnail button focusable, Enter activates, visible focus ring.
- [ ] Lighthouse on `/videos`: performance ≥ 90 mobile — and zero requests to `youtube.com`/`youtube-nocookie.com` before any click (the facade is the whole point).
