import videosData from '@/data/videosData'
import { createTranslation } from 'app/[locale]/i18n/server'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import Link from '@/components/mdxcomponents/Link'
import VideoCard from '@/components/videos/VideoCard'

const TEASER_MIN_VIDEOS = 3

interface VideosTeaserProps {
  locale: LocaleTypes
}

// Hidden while there are fewer than 3 videos: see data/videosData.ts.
export default async function VideosTeaser({ locale }: VideosTeaserProps) {
  if (videosData.length < TEASER_MIN_VIDEOS) return null

  const { t } = await createTranslation(locale, 'home')
  const latestVideos = [...videosData]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3)

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('latestVideos')}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latestVideos.map((video) => (
          <VideoCard key={video.youtubeId} video={video} locale={locale} />
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link
          href={`/${locale}/videos`}
          className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          {t('allVideos')} &rarr;
        </Link>
      </div>
    </section>
  )
}
