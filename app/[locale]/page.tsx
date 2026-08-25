import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import FeaturedLayout from '@/layouts/FeaturedLayout'
import HeroSection from '@/components/home/HeroSection'
import GitHubActivity from '@/components/home/GitHubActivity'
import ExperienceSummary from '@/components/home/ExperienceSummary'
import ContentSplit from '@/components/home/ContentSplit'
import { LocaleTypes } from './i18n/settings'

interface PageProps {
  params: Promise<{
    locale: LocaleTypes
  }>
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params

  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const filteredPosts = posts.filter((p) => p.language === locale)
  const hasFeaturedPosts = filteredPosts.filter((p) => p.featured === true)

  return (
    <>
      <HeroSection />
      <GitHubActivity locale={locale} />
      {hasFeaturedPosts.length > 0 && (
        <FeaturedLayout posts={hasFeaturedPosts} params={{ locale }} />
      )}
      <ExperienceSummary />
      <ContentSplit posts={filteredPosts} locale={locale} />
    </>
  )
}
