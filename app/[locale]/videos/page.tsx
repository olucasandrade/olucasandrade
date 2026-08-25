import { Metadata } from 'next'
import { genPageMetadata } from 'app/[locale]/seo'
import { createTranslation } from '../i18n/server'
import { LocaleTypes } from '../i18n/settings'
import { allVideos } from 'contentlayer/generated'
import VideoGrid from '@/components/videos/VideoGrid'
import VideoJsonLd from '@/components/videos/VideoJsonLd'

const isProduction = process.env.NODE_ENV === 'production'

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
  const videos = allVideos
    .filter((v) => !isProduction || !v.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
