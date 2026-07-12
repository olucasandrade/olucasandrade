/**
 * Videos data — powers the `/videos` page, the header nav item, the
 * home-page "Latest videos" teaser, and the VideoObject JSON-LD.
 *
 * The whole section activates automatically once this array is non-empty:
 * - The nav link (desktop + mobile) and the sitemap `/videos` entry appear.
 * - The home-page teaser renders once there are >= 3 entries.
 *
 * How to publish a new clip:
 * 1. Upload the clip to YouTube (public or unlisted both work with the
 *    lite embed).
 * 2. Copy the 11-char video id from the URL, e.g. `dQw4w9WgXcQ`.
 * 3. Add an entry below with both EN and PT title/description,
 *    `publishedAt` (ISO `YYYY-MM-DD`), `duration`, `language`, `format`
 *    (`short` for vertical YouTube Shorts, `landscape` for standard 16:9),
 *    `tags`, and optional `relatedProject` / `relatedPost` deep links.
 * 4. Run `bun run build` — the /videos page, nav item, home teaser
 *    (once there are 3+ videos), and sitemap entry all activate
 *    automatically, no other code changes required.
 *
 * Example entry:
 * {
 *   youtubeId: 'dQw4w9WgXcQ',
 *   title: {
 *     en: 'Postgres LISTEN/NOTIFY in 5 minutes',
 *     pt: 'Postgres LISTEN/NOTIFY em 5 minutos',
 *   },
 *   description: {
 *     en: 'A quick tour of building realtime features on plain Postgres.',
 *     pt: 'Um tour rápido sobre como construir recursos em tempo real usando Postgres puro.',
 *   },
 *   publishedAt: '2026-07-01',
 *   duration: '4:32',
 *   language: 'en',
 *   format: 'landscape',
 *   tags: ['postgres', 'realtime'],
 *   relatedPost: 'real-time-database-changes',
 * }
 */

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
