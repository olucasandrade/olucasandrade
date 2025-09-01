'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/mdxcomponents/Link'
import Tag from '@/components/tag'
import { useTranslation } from 'app/[locale]/i18n/client'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import Image from 'next/image'
// Using a simple SVG icon instead of Heroicons to avoid dependency
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

interface InfiniteBlogListProps {
  posts: CoreContent<Blog>[]
  locale: LocaleTypes
  title: string
}

const POSTS_PER_LOAD = 6
const SEARCH_DEBOUNCE_MS = 300

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function InfiniteBlogList({ posts, locale, title }: InfiniteBlogListProps) {
  const { t } = useTranslation(locale, 'home')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [displayedPosts, setDisplayedPosts] = useState(POSTS_PER_LOAD)
  const [isLoading, setIsLoading] = useState(false)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  // Filter posts based on search term and selected tags
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchLower) ||
          post.summary?.toLowerCase().includes(searchLower) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post => 
        selectedTags.some(selectedTag => 
          post.tags?.includes(selectedTag)
        )
      )
    }

    return filtered
  }, [posts, searchTerm, selectedTags])

  // Get posts to display
  const postsToShow = filteredPosts.slice(0, displayedPosts)
  const hasMore = filteredPosts.length > displayedPosts

  // Load more posts
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedPosts((prev) => prev + POSTS_PER_LOAD)
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore])

  // Reset displayed posts when search or tags change
  useEffect(() => {
    setDisplayedPosts(POSTS_PER_LOAD)
  }, [searchTerm, selectedTags])

  // Handle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedTags([])
  }, [])

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search logic is handled in the filteredPosts memo
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {title}
            </h1>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder={t('searchposts')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tag Filter */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {(searchTerm || selectedTags.length > 0) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredPosts.length === 1 
                  ? `1 ${t('postfound')}` 
                  : `${filteredPosts.length} ${t('postsfound')}`
                }
                {selectedTags.length > 0 && (
                  <span className="ml-2">
                    {t('withtags')} {selectedTags.join(', ')}
                  </span>
                )}
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t('clearfilters')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {postsToShow.map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <motion.article
                key={slug}
                variants={item}
                className="group relative flex flex-col space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-500 transition-all duration-200 hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold leading-8 tracking-tight">
                      <Link
                        href={`/${locale}/blog/${slug}`}
                        className="text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                      >
                        {title}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags?.slice(0, 3).map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 line-clamp-3">
                    {summary}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <time
                    dateTime={date}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {formatDate(date, locale)}
                  </time>
                  <Link
                    href={`/${locale}/blog/${slug}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
                  >
                    {t('more')} &rarr;
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {/* No posts found */}
        {filteredPosts.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('noposts')}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('loading')}</span>
                </div>
              ) : (
                t('more')
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
