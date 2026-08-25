'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'

interface WeeklyPoint {
  date: string
  count: number
}

interface GitHubStats {
  totalStars: number
  totalContributions: number
  weekly: WeeklyPoint[]
  unavailable: boolean
}

interface GitHubActivityProps {
  locale: LocaleTypes
}

export default function GitHubActivity({ locale }: GitHubActivityProps) {
  const { t } = useTranslation(locale, 'home')
  const [stats, setStats] = useState<GitHubStats | null>(null)

  useEffect(() => {
    fetch('/api/github/stats')
      .then((res) => res.json())
      .then((data: GitHubActivityProps extends never ? never : GitHubStats) => setStats(data))
      .catch(() => setStats({ unavailable: true } as GitHubStats))
  }, [])

  if (!stats || stats.unavailable) return null

  const { totalStars, totalContributions, weekly } = stats
  const max = Math.max(1, ...weekly.map((w) => w.count))

  const points = weekly.map((w, i) => {
    const x = (i / (weekly.length - 1 || 1)) * 100
    const y = 40 - (w.count / max) * 34
    return `${x},${y}`
  })

  const areaPath = `M0,40 ${points.map((p) => `L${p}`).join(' ')} L100,40 Z`
  const linePath = `M${points.join(' L')}`

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-200/60 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('githubActivity')}
        </h2>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
              {totalStars.toLocaleString(locale)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('stars')}</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
              {totalContributions.toLocaleString(locale)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('contributionsYear')}</p>
          </div>
        </div>
        <div className="relative h-24 w-full">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="gh-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} className="text-primary-500" fill="url(#gh-area)" />
            <path
              d={linePath}
              className="text-primary-500"
              fill="none"
              strokeWidth="0.6"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="mt-2 text-right text-xs text-gray-400 dark:text-gray-500">
          {weekly[0]?.date} &ndash; {weekly[weekly.length - 1]?.date}
        </p>
      </div>
    </section>
  )
}
