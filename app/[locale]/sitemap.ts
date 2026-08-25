import { MetadataRoute } from 'next'
import { allBlogs, allAuthors, allProjects, allVideos } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { fallbackLng, secondLng } from './i18n/locales'

// Default locale (en) lives at the root path; middleware redirects /en/* to /*.
const localePath = (locale: string, path: string) => {
  const prefix = locale === fallbackLng ? '' : `/${locale}`
  return `${siteMetadata.siteUrl}${prefix}${path}`.replace(/\/$/, '') || siteMetadata.siteUrl
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split('T')[0]

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: localePath(post.language, `/blog/${post.slug}`),
      lastModified: post.lastmod || post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const authorRoutes = allAuthors.map((author) => ({
    url: localePath(author.language, `/about/${author.slug}`),
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const projectRoutes = allProjects
    .filter((project) => !project.draft)
    .map((project) => ({
      url: localePath(project.language, `/projects/${project.slug}`),
      lastModified: today,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const staticRoutes = [
    '',
    '/blog',
    '/projects',
    // Hidden while empty: only listed once the first video is published.
    ...(allVideos.length > 0 ? ['/videos'] : []),
    '/experience',
    '/terminal',
  ].flatMap((route) =>
    [fallbackLng, secondLng].map((locale) => ({
      url: localePath(locale, route),
      lastModified: today,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.8,
    }))
  )

  return [...staticRoutes, ...blogRoutes, ...authorRoutes, ...projectRoutes]
}
