'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LiteYouTubeProps {
  youtubeId: string
  title: string
  format?: 'landscape' | 'short'
}

export default function LiteYouTube({ youtubeId, title, format = 'landscape' }: LiteYouTubeProps) {
  const [activated, setActivated] = useState(false)
  const aspect = format === 'short' ? 'aspect-[9/16]' : 'aspect-video'

  if (activated) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg ${aspect}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play: ${title}`}
      className={`group relative w-full overflow-hidden rounded-lg ${aspect} bg-gray-950`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {/* play button */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/90 shadow-primary-glow transition-transform duration-200 group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-6 w-6" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
