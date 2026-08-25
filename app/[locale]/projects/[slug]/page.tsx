import 'css/prism.css'
import { Metadata } from 'next'
import { components } from '@/components/mdxcomponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import Link from '@/components/mdxcomponents/Link'
import { genPageMetadata } from 'app/[locale]/seo'
import { notFound } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import { createTranslation } from '../../i18n/server'

interface PageProps {
  params: Promise<{
    slug: string
    locale: LocaleTypes
  }>
}

async function getProjectFromParams({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleTypes }>
}): Promise<Project | null> {
  const { slug, locale } = await params
  const dslug = decodeURI(slug)
  return (allProjects.find((p) => p.slug === dslug && p.language === locale) as Project) || null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata | undefined> {
  const { slug, locale } = await params
  const project = await getProjectFromParams({
    params: Promise.resolve({ slug: decodeURI(slug), locale }),
  })
  if (!project) return

  return genPageMetadata({
    title: project.title,
    description: project.goal,
    params: { locale },
  })
}

export const generateStaticParams = async () => {
  return allProjects.map((p) => ({ slug: p.slug }))
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug, locale } = await params
  const project = await getProjectFromParams({
    params: Promise.resolve({ slug: decodeURI(slug), locale }),
  })

  if (!project) return notFound()

  const { t } = await createTranslation(locale, 'projects')

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <header className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          {project.title}
        </h1>
        <p className="mt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">{project.goal}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="mt-4 text-lg leading-7 text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-primary-500">{t('love')}:</span> {project.love}
        </p>
      </header>

      <div className="pb-8 pt-8">
        <div className="prose max-w-none dark:prose-invert">
          <MDXLayoutRenderer code={project.body.code} components={components} />
        </div>

        <div className="mt-10 rounded-xl border border-primary-500/20 bg-primary-50/50 p-6 dark:bg-primary-900/20">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('wantMore')}</p>
          <Link
            href={project.href}
            className="mt-2 inline-flex items-center text-base font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            rel="noopener noreferrer"
          >
            {project.href} &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
