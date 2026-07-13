'use client'

import { motion } from 'framer-motion'
import { formatDate } from 'pliny/utils/formatDate'
import Link from '@/components/mdxcomponents/Link'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { fadeUp } from '@/lib/animations'
import type { Video } from '@/data/videosData'
import LiteYouTube from './LiteYouTube'

interface VideoCardProps {
  video: Video
  locale: LocaleTypes
}

export default function VideoCard({ video, locale }: VideoCardProps) {
  const { t } = useTranslation(locale, 'videos')

  return (
    <motion.article
      variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-glow dark:border-gray-700/60 dark:bg-gray-800/80"
    >
      <LiteYouTube youtubeId={video.youtubeId} title={video.title[locale]} format={video.format} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {video.title[locale]}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {video.description[locale]}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {video.duration}
          </span>
          <span aria-hidden="true" className="text-xs text-gray-400 dark:text-gray-500">
            &middot;
          </span>
          <time dateTime={video.publishedAt} className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(video.publishedAt, locale)}
          </time>
          <span className="ml-auto rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <span className="sr-only">{t('languageBadge')}: </span>
            {video.language.toUpperCase()}
          </span>
        </div>
        {(video.relatedPost || video.relatedProject) && (
          <div className="mt-1 flex flex-col gap-1">
            {video.relatedPost && (
              <Link
                href={`/${locale}/blog/${video.relatedPost}`}
                className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                &rarr; {t('relatedPost')}
              </Link>
            )}
            {video.relatedProject && (
              <Link
                href={video.relatedProject}
                className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                &rarr; {t('relatedProject')}
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
