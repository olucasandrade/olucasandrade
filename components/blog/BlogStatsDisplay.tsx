'use client'

import { EyeIcon } from '@heroicons/react/24/outline'

interface BlogStatsDisplayProps {
  views: number
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export default function BlogStatsDisplay({
  views,
  isLoading = false,
  className = '',
  size = 'sm',
}: BlogStatsDisplayProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  // A public "0 views" undermines the technical-brand goal — once we
  // know the real count is zero, hide the row entirely.
  if (!isLoading && views <= 0) return null

  return (
    <div className={`flex items-center gap-4 text-gray-500 dark:text-gray-400 ${className}`}>
      {/* Views */}
      <div className="flex items-center gap-1.5">
        <EyeIcon className={iconSize} />
        {isLoading ? (
          <span className="inline-block h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <span className={`${textSize} font-medium`}>{views}</span>
        )}
      </div>
    </div>
  )
}
