# Work Doc 02 — UX/UI Polish

> **Execution order:** after `01-issues.md`. Docs 03 (3D) and 04 (videos) build on top of this one.
> **Audience:** an implementation agent with no prior context.

## Design direction (decided with the owner — do not relitigate)

- The site's job is **technical brand**: authority in backend / Postgres / distributed systems. Content first; design serves reading.
- **Polish the current design — do NOT redesign the identity.** Keep: Space Grotesk, the green primary palette (`primary-500 #16a34a`), current page structure, card-based layouts, the terminal page, framer-motion animations.
- **The custom cursor stays but must be fixed** (task 1).
- Every change must work in both locales (`/` = EN, `/pt` = PT) and both themes (class-based dark mode).
- Style: Prettier (no semicolons, single quotes) + `prettier-plugin-tailwindcss`. Run `bun run format` after edits.

## Project map (files you will touch)

| Area | File |
|---|---|
| Custom cursor | `components/ui/CustomCursor.tsx` |
| Root layout / providers | `app/[locale]/layout.tsx` |
| Home hero | `components/home/HeroSection.tsx` |
| Home greeting header | `layouts/home/LayoutHeader.tsx`, `layouts/HomeLayout.tsx` |
| Home experience strip | `components/home/ExperienceSummary.tsx` |
| Blog list | `components/blog/InfiniteBlogList.tsx`, `components/blog/BlogStatsDisplay.tsx` |
| Project cards | `components/projectcard/index.tsx`, `app/[locale]/projects/page.tsx` |
| Experience timeline | `components/experience/Timeline.tsx` |
| Nav | `components/navigation/Header.tsx`, `components/navigation/MobileNav.tsx`, `components/navigation/Footer.tsx` |
| Theme tokens | `tailwind.config.js`, `css/tailwind.css` |
| Translations | `app/[locale]/i18n/locales/{en,pt}/*.json` |

---

## Task 1 — Fix the custom cursor (keep the identity, remove the harm)

**File:** `components/ui/CustomCursor.tsx`.

Current behavior: hides the native cursor **everywhere** via `* { cursor: none !important }`, replaces it with a spring dot+ring. Problems: text selection loses the I-beam, inputs lose context, it renders over iframes where the ring freezes (giscus, future YouTube embeds), and it ignores `prefers-reduced-motion`.

**Changes:**
1. **Respect reduced motion:** at the top of the effect:
   ```ts
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
   ```
   (leaves `visible` false → component renders nothing, native cursor untouched).
2. **Scope the cursor-hiding CSS.** Replace the global style with:
   ```css
   @media (hover: hover) and (pointer: fine) {
     body:not(:has(input:hover, textarea:hover, select:hover, iframe:hover, [contenteditable]:hover)) {
       cursor: none;
     }
     a, button, [role='button'] { cursor: none; }
   }
   ```
   Net effect: native cursor reappears over form fields, editable content, and iframes; custom cursor covers everything else. (`:has` is supported in all current browsers; equivalent fallback: toggle a class on `document.body` from the hover handler when the target matches `input, textarea, select, iframe, [contenteditable]`, and gate `cursor: none` on `body:not(.native-cursor)`.)
3. **Hide the custom cursor when the native one is showing:** in the same handler that detects interactive elements, also detect `input/textarea/select/iframe` and set a `suppressed` state; when suppressed, animate both dot and ring to `opacity: 0`.
4. **Hide on window leave:** add `mouseleave`/`mouseenter` listeners on `document.documentElement` that fade the cursor out/in, so it doesn't stick at the edge when the pointer leaves the window.
5. **Reduce event churn:** replace the `mouseover`/`mouseout` pair with a single `pointerover` listener using `target.closest('a, button, [role="button"], input, textarea, select, iframe')` to classify; `mouseout` firing on every element boundary causes hover-state flicker on nested elements (e.g. the icon inside a button).

**Acceptance:** select text in a blog post → I-beam visible; hover the newsletter input → native cursor; hover a giscus/YouTube iframe → native cursor, no frozen ring; enable "reduce motion" in OS settings → no custom cursor at all; move the mouse out of the window → cursor fades.

## Task 2 — Respect reduced motion globally

**File:** `app/[locale]/layout.tsx` (plus one tiny new client component).

All framer-motion animations (hero stagger, scroll reveals, page transitions) currently play regardless of OS motion preference. framer-motion has a one-line fix: `MotionConfig reducedMotion="user"`.

`MotionConfig` must live in a client component. Create `components/animations/MotionProvider.tsx`:
```tsx
'use client'

import { MotionConfig } from 'framer-motion'
import { ReactNode } from 'react'

export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
```
In `app/[locale]/layout.tsx`, wrap the app content with `<MotionProvider>` (inside `ThemeProvider`, outside `SectionContainer`).

**Acceptance:** with OS reduce-motion enabled, home loads without slide/stagger animations (opacity-only is framer's reduced behavior and is fine); with it off, animations unchanged.

## Task 3 — Fix failing color contrast on the home greeting

**Files:** `layouts/home/LayoutHeader.tsx` line 22, `components/navigation/Header.tsx` line 58, `tailwind.config.js` (reference).

`text-heading-400` is `#10b981`, ≈ 2.5:1 on white — fails WCAG AA even for large text (needs 3:1). In dark mode `#10b981` on `gray-900` passes.

**Fix:** in `LayoutHeader.tsx` use a split classname: `text-heading-50 dark:text-heading-400` (`heading-50` = `#064e3b`, ~9:1 on white). Then audit every `text-heading-*` usage: `grep -rn "text-heading" app components layouts` — apply the same pattern (dark shade in light mode, light shade in dark mode) everywhere, including the nav active state `text-heading-500` (`#34d399`, also fails on white → `text-heading-100 dark:text-heading-500`).

**Acceptance:** Lighthouse accessibility on home in light mode → no contrast failures for headings/nav.

## Task 4 — One avatar, one brand

**Files:** `components/home/HeroSection.tsx` (uses `/static/images/avatar.png`), `app/[locale]/projects/page.tsx` (uses the pixel-art portrait), `layouts/home/LayoutHeader.tsx` (uses `avatar.png` again).

Two different portraits read as two different people. Decision rule: **the photo avatar (`avatar.png`) is the brand image**, shown once.

**Changes:**
1. `app/[locale]/projects/page.tsx`: remove the `<Image>` block (lines 31–38). The projects page doesn't need a portrait; title + description carry it. Keep the layout for title/description.
2. `layouts/home/LayoutHeader.tsx`: home repeats the avatar right below the hero (which already shows it at 160px). Remove the `<Image>` from `LayoutHeader`; keep the title/description rendering.
3. Demote the `h2` in `LayoutHeader`: `md:text-6xl` competes with the hero `h1`. Use `text-2xl font-bold sm:text-3xl` to match `ExperienceSummary`'s section-heading scale.

**Acceptance:** home shows exactly one portrait (hero); projects page shows none; heading hierarchy on home: hero name largest, section headings uniform.

## Task 5 — Hero keyword rotator: stop clipping, stop layout jitter

**File:** `components/home/HeroSection.tsx` lines 74–87.

The rotating keyword sits in a fixed `w-32` (128px) span. "Typescript" at `text-lg/xl` semibold is ~110–125px — borderline, and longer keywords (e.g. "PostgreSQL") will clip.

**Fix:**
1. Replace `w-32` with an auto-sizing grid that reserves the width of the longest keyword (prevents clipping AND jitter):
   ```tsx
   <span className="relative inline-grid text-left">
     {/* invisible sizer: longest keyword pins the width */}
     <span className="invisible font-semibold [grid-area:1/1]">PostgreSQL</span>
     <AnimatePresence mode="wait">
       <motion.span key={keywords[currentKeyword]} className="[grid-area:1/1] …existing motion props…">
         {keywords[currentKeyword]}
       </motion.span>
     </AnimatePresence>
   </span>
   ```
   The sizer text must be whichever keyword in the array is longest.
2. Update the keywords to the current stack story (see `data/experienceData.ts` Percona entry): `['TypeScript', 'Go', 'PostgreSQL', 'React', 'Python']` (correct casing of "TypeScript").
3. Pause rotation when the tab is hidden: skip the state update when `document.visibilityState !== 'visible'`.

**Acceptance:** no keyword visually cut at any viewport ≥ 320px; the subtitle text does not shift horizontally as keywords rotate.

## Task 6 — Unify the card system

**Files:** `components/projectcard/index.tsx`, `components/blog/InfiniteBlogList.tsx` (article cards), `components/home/ExperienceSummary.tsx`, `components/experience/Timeline.tsx`.

Three near-identical but different card recipes exist (border-2 vs border, `rounded-xl` vs `rounded-lg`, three hover treatments). Apply ONE recipe in all four files:

- container: `rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80`
- hover: `transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-glow`
- Never `border-2` (projectcard has it), never `rounded-lg` on cards (blog articles have it), never plain `hover:shadow-lg` (blog articles have it).

**Project card specifics (`components/projectcard/index.tsx`):**
1. Logos are cropped by `object-cover` into a 544×306 window — logos must never crop. Replace the image area with a contained logo panel:
   ```tsx
   <div className="flex h-40 items-center justify-center bg-gray-50 p-6 dark:bg-gray-900/40">
     <Image alt={title} src={imgSrc} width={200} height={112} className="max-h-full w-auto object-contain" />
   </div>
   ```
2. Make the whole card one link (currently three separate `<Link>`s to the same URL — noisy for screen readers): wrap the card content in a single `<Link>`, remove the inner image/title links, keep "Visit →" as styled text inside it.
3. External links get a small external-link SVG icon (`h-4 w-4`) after the "Visit" text.

**Acceptance:** all four surfaces show identical border/radius/hover; project logos fully visible in both themes; each project card is a single tab stop.

## Task 7 — Blog cards: add reading time, fix the stats placeholder

**Files:** `components/blog/InfiniteBlogList.tsx`, `components/blog/BlogStatsDisplay.tsx`.

1. **Reading time** is already computed by contentlayer (`readingTime` on every post — verify with `grep -n readingTime .contentlayer/generated/types.d.ts`). Render next to the date: `· {Math.ceil(post.readingTime.minutes)} min` (needs no translation), or add keys `readingtime` to `{en,pt}/home.json` if a labeled form is preferred.
2. **Views placeholder:** cards render `0` views until `/api/blog/stats` responds, then jump. The `useBlogStats` hook already exposes `isLoading` — pass it down; while loading render a pulse skeleton (`<span className="inline-block h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />`) instead of `0`. When loaded and the count is genuinely 0, hide the views row entirely (a public "0 views" undermines the technical-brand goal).

**Acceptance:** cards show "· N min"; on a throttled connection cards show a skeleton, never a fake `0`; zero-view posts show no views row.

## Task 8 — Load More → infinite scroll with sentinel

**File:** `components/blog/InfiniteBlogList.tsx` (after doc 01 issue 12 removed the fake delay).

Add an `IntersectionObserver` sentinel; keep the button as fallback:
```tsx
const sentinelRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  const el = sentinelRef.current
  if (!el || !hasMore) return
  const observer = new IntersectionObserver(
    (entries) => entries[0].isIntersecting && setDisplayedPosts((p) => p + POSTS_PER_LOAD),
    { rootMargin: '400px' }
  )
  observer.observe(el)
  return () => observer.disconnect()
}, [hasMore])
```
Render `<div ref={sentinelRef} aria-hidden="true" />` just above the button; the button stays functional.

**Acceptance:** scrolling the blog list auto-appends the next 6 posts ~400px before the end; the button still works when clicked.

## Task 9 — Navigation & footer improvements

**Files:** `components/navigation/Header.tsx`, `MobileNav.tsx`, `Footer.tsx`.

1. **Sticky header:** the header scrolls away; long posts leave the reader without nav. On the `<header>`: `sticky top-0 z-40 bg-white/75 backdrop-blur dark:bg-gray-900/75`; change the inner div `py-10` → `py-6`. Verify the kbar search modal and mobile nav overlay layer above (`z-50`).
2. **Mobile nav scroll-lock leak:** `MobileNav.tsx` sets `document.body.style.overflow = 'hidden'` on open; navigating from a menu link unmounts it without restoring overflow. Add `useEffect(() => () => { document.body.style.overflow = 'auto' }, [])` and close the menu (restore overflow) in each link's `onClick`. Read the full file first — the links are past line 60.
3. **Footer** (read `components/navigation/Footer.tsx` first): ensure it contains social icons (mail, GitHub, LinkedIn — same set as hero), computed copyright year, and a terminal easter-egg hint: `$ try the terminal →` linking to `/${locale}/terminal`, styled `font-mono text-xs text-gray-400 hover:text-primary-500`. Add keys to `{en,pt}/footer.json`: `"terminalHint": "try the terminal"` / `"terminalHint": "experimente o terminal"`.
4. **Skip link**, first child of `<body>` in `app/[locale]/layout.tsx`:
   ```tsx
   <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary-500 focus:px-3 focus:py-2 focus:text-white">
     Skip to content
   </a>
   ```
   with `id="main-content"` on `<main>`.

**Acceptance:** header visible while scrolling a long post, content readable through the blur; mobile nav never leaves the page scroll-locked after navigating; Tab on fresh load reveals the skip link; footer shows the terminal hint in both locales.

## Task 10 — Page-level UX details

1. **Terminal first-run hint:** edit the initial `lines` state in `components/terminal/Terminal.tsx` to append `\n\nTry: help · projects · snake` (PT: `Experimente: help · projects · snake`).
2. **Terminal on mobile:** add `autoFocus`, `inputMode="text"`, `autoCapitalize="none"`, `autoCorrect="off"` to the `<input>` so iOS reliably shows a sane keyboard.
3. **404 page:** read `app/[locale]/not-found.tsx` and `components/notfound/*`. Ensure: a link home AND a link to the blog, translated copy from `notfound.json`, and a marked comment `{/* 3D slot: dropped-packet scene, see docs/plans/03-3d-animations.md */}` where a visual would go.
4. **Newsletter form** (`components/newletter/NewsletterForm.tsx` — folder name has a typo, `newletter`; renaming is optional and only worth it via `git mv` + updating all imports in one commit): verify loading, success, and error states render as inline text near the input (not only toasts); add any missing state using `react-hot-toast` (already a dependency) plus an inline message.
5. **External link security:** read `components/mdxcomponents/Link.tsx`; confirm external links get `target="_blank"` and `rel="noopener noreferrer"`; add for `href.startsWith('http')` if missing.

**Acceptance:** each sub-item verified manually in both locales.

## Task 11 — Motion consistency pass

Standardize on the tokens already in `lib/animations.ts` (`fadeUp`, `staggerContainer`, `defaultTransition`, `springTransition`):

1. `components/projectcard/index.tsx`: local `variants` uses `y: -25` and `transition={{ type: 'linear' }}` — replace with `fadeUp` + `defaultTransition`; keep `whileHover={{ y: -4 }}`.
2. `components/blog/InfiniteBlogList.tsx`: local `container`/`item` duplicate `staggerContainer`/`fadeUp` — import the shared ones.
3. `components/home/HeroSection.tsx`: local `containerVariants`/`itemVariants` — same replacement.
4. Grep the rest: `grep -rn "hidden: { opacity: 0" components layouts` and consolidate remaining duplicates.

**Acceptance:** `lib/animations.ts` is the single source of entry-animation variants; visual behavior effectively unchanged (small y-offset differences fine).

## Task 12 — Metadata & social polish

1. **Dynamic OG images:** `public/static/images/twitter-card.png` is the one OG image for every page. Create `app/og/route.tsx` using `ImageResponse` from `next/og`: 1200×630, dark background `#0a0a0a`, "Lucas Andrade" bold white, the `?title=` query param rendered large in `#16a34a`, domain `olucasandrade.com` bottom-left. Wire into `app/[locale]/seo.tsx`'s `genPageMetadata`: `images: [\`/og?title=${encodeURIComponent(title)}\`]`. Keep the static banner as the root-layout fallback. Note: the route must be excluded from the locale middleware — check `middleware.ts` matcher; `/og` contains no dot and isn't in the exclusion list, so add `og` to the matcher's exclusion group (`api|static|og|...`).
2. **hreflang x-default:** in `app/[locale]/layout.tsx` `alternates.languages`, add `'x-default': siteMetadata.siteUrl` alongside `en`/`pt`.

**Acceptance:** `curl -I "localhost:3000/og?title=Test"` returns `image/png` (not a 307 to `/en/og`); a page's `og:image` meta points at the dynamic route; page source shows the `x-default` hreflang link.

---

## Final verification

```bash
npx tsc --noEmit && bun run lint && bun run build
```
Then manually, in both locales and both themes: home, blog list (scroll auto-load), one post (select text — cursor check), projects (logo containment, single-tab-stop cards), experience, terminal (mobile viewport too), 404, newsletter submit, mobile nav open→navigate. Finish with Lighthouse (mobile) on home and one post: accessibility ≥ 95, no contrast failures.
