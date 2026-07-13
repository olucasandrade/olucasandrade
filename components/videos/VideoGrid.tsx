'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { staggerContainer } from '@/lib/animations'
import type { Video } from '@/data/videosData'
import VideoCard from './VideoCard'

interface VideoGridProps {
  videos: Video[]
  locale: LocaleTypes
}

const TAG_FILTER_THRESHOLD = 4

export default function VideoGrid({ videos, locale }: VideoGridProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    videos.forEach((video) => video.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [videos])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const filteredVideos = useMemo(() => {
    if (selectedTags.length === 0) return videos
    return videos.filter((video) => selectedTags.some((tag) => video.tags.includes(tag)))
  }, [videos, selectedTags])

  return (
    <div className="space-y-6">
      {videos.length > TAG_FILTER_THRESHOLD && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={selectedTags.includes(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredVideos.map((video) => (
          <VideoCard key={video.youtubeId} video={video} locale={locale} />
        ))}
      </motion.div>
    </div>
  )
}
