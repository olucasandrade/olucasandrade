import { allVideos } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

const isProduction = process.env.NODE_ENV === 'production'

interface VideoJsonLdProps {
  locale: 'en' | 'pt'
}

// Note: JSON.stringify produces safe output for script tags - it escapes
// special characters like </script> and HTML entities, making it safe for
// embedding in <script type="application/ld+json"> without additional
// sanitization. All input data comes from trusted internal sources
// (allVideos, siteMetadata). Mirrors the convention in
// components/seo/JsonLd.tsx.
export default function VideoJsonLd({ locale }: VideoJsonLdProps) {
  const items = allVideos
    .filter((v) => !isProduction || !v.draft)
    .map((v) => ({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.summary,
      thumbnailUrl: v.poster ? [siteMetadata.siteUrl + v.poster] : undefined,
      uploadDate: v.date,
      contentUrl: siteMetadata.siteUrl + v.videoSrc,
      inLanguage: v.language,
      author: { '@type': 'Person', name: siteMetadata.author, url: siteMetadata.siteUrl },
    }))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(items) }}
    />
  )
}
