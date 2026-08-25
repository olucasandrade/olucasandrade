import { allVideos } from 'contentlayer/generated'
import { createTranslation } from 'app/[locale]/i18n/server'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import Link from '@/components/mdxcomponents/Link'
import PostList from '@/layouts/home/PostList'
import VideoCard from '@/components/videos/VideoCard'

interface Post {
  slug: string
  date: string
  title: string
  summary?: string | undefined
  tags: string[]
  language: string
  draft?: boolean
}

interface ContentSplitProps {
  posts: Post[]
  locale: LocaleTypes
}

const MAX_POSTS = 5
const MAX_VIDEOS = 3
const isProduction = process.env.NODE_ENV === 'production'

export default async function ContentSplit({ posts, locale }: ContentSplitProps) {
  const { t } = await createTranslation(locale, 'home')

  const videos = allVideos
    .filter((v) => !isProduction || !v.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_VIDEOS)

  const hasVideos = videos.length > 0

  return (
    <section className="py-8">
      <div className={hasVideos ? 'lg:grid lg:grid-cols-2 lg:gap-12' : ''}>
        <div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t('latestPosts')}
          </h2>
          <PostList posts={posts} locale={locale} maxDisplay={MAX_POSTS} compact />
          {posts.length > MAX_POSTS && (
            <div className="mt-4 flex justify-end text-base font-medium leading-6">
              <Link
                href={`/${locale}/blog`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={t('all')}
              >
                {t('all')} &rarr;
              </Link>
            </div>
          )}
        </div>

        {hasVideos && (
          <div className="mt-12 lg:mt-0">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {t('latestVideos')}
            </h2>
            <div className="grid gap-6">
              {videos.map((video) => (
                <VideoCard key={video.slug} video={video} locale={locale} />
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
          </div>
        )}
      </div>
    </section>
  )
}
