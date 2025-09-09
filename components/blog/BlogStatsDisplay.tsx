'use client'

import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline'

interface BlogStatsDisplayProps {
  likes: number
  views: number
  className?: string
  size?: 'sm' | 'md'
}

export default function BlogStatsDisplay({ 
  likes, 
  views, 
  className = '', 
  size = 'sm' 
}: BlogStatsDisplayProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={`flex items-center gap-4 text-gray-500 dark:text-gray-400 ${className}`}>
      {/* Likes */}
      <div className="flex items-center gap-1.5">
        <HeartIcon className={iconSize} />
        <span className={`${textSize} font-medium`}>{likes}</span>
      </div>

      {/* Views */}
      <div className="flex items-center gap-1.5">
        <EyeIcon className={iconSize} />
        <span className={`${textSize} font-medium`}>{views}</span>
      </div>
    </div>
  )
}
