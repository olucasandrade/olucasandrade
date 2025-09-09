'use client'

import { useState, useEffect } from 'react'
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

interface BlogStatsProps {
  slug: string
  locale: string
  className?: string
  showLabels?: boolean
}

interface StatsData {
  likes: number
  views: number
  isLiked: boolean
}

export default function BlogStats({ 
  slug, 
  locale, 
  className = '', 
  showLabels = true 
}: BlogStatsProps) {
  const [stats, setStats] = useState<StatsData>({ likes: 0, views: 0, isLiked: false })
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)

  // Fetch initial stats and record view
  useEffect(() => {
    const fetchStatsAndRecordView = async () => {
      try {
        // First, record the view
        await fetch(`/api/blog/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
        })

        // Then fetch the updated stats
        const response = await fetch(`/api/blog/${encodeURIComponent(slug)}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching blog stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatsAndRecordView()
  }, [slug, locale])

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    
    // Optimistic update
    const previousStats = stats
    setStats(prev => ({
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked,
    }))

    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(slug)}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Revert optimistic update on error
        setStats(previousStats)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update on error
      setStats(previousStats)
    } finally {
      setIsLiking(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-1">
          <HeartIcon className="h-5 w-5 text-gray-400 animate-pulse" />
          <span className="text-sm text-gray-500">--</span>
        </div>
        <div className="flex items-center gap-1">
          <EyeIcon className="h-5 w-5 text-gray-400 animate-pulse" />
          <span className="text-sm text-gray-500">--</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`group flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
          isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/20'
        } ${stats.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
        aria-label={stats.isLiked ? 'Unlike post' : 'Like post'}
      >
        {stats.isLiked ? (
          <HeartIconSolid className="h-5 w-5 transition-transform group-hover:scale-110" />
        ) : (
          <HeartIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
        )}
        <span className="text-sm font-medium">{stats.likes}</span>
        {showLabels && (
          <span className="text-sm hidden sm:inline">
            {stats.likes === 1 ? 'Like' : 'Likes'}
          </span>
        )}
      </button>

      {/* Views Counter */}
      <div className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400">
        <EyeIcon className="h-5 w-5" />
        <span className="text-sm font-medium">{stats.views}</span>
        {showLabels && (
          <span className="text-sm hidden sm:inline">
            {stats.views === 1 ? 'View' : 'Views'}
          </span>
        )}
      </div>
    </div>
  )
}
