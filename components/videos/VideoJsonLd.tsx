import videosData from '@/data/videosData'
import siteMetadata from '@/data/siteMetadata'

interface VideoJsonLdProps {
  locale: 'en' | 'pt'
}

// Note: JSON.stringify produces safe output for script tags - it escapes
// special characters like </script> and HTML entities, making it safe for
// embedding in <script type="application/ld+json"> without additional
// sanitization. All input data comes from trusted internal sources
// (videosData, siteMetadata). Mirrors the convention in
// components/seo/JsonLd.tsx.
export default function VideoJsonLd({ locale }: VideoJsonLdProps) {
  const items = videosData.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title[locale],
    description: v.description[locale],
    thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`],
    uploadDate: v.publishedAt,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
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
