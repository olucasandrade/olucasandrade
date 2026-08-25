'use client'

import { allProjects } from 'contentlayer/generated'
import Card from '@/components/projectcard'
import { LocaleTypes } from '../i18n/settings'
import { useParams } from 'next/navigation'

const isProduction = process.env.NODE_ENV === 'production'

const Project = () => {
  const locale = useParams()?.locale as LocaleTypes
  const projectArray = allProjects
    .filter((p) => p.language === locale && (!isProduction || !p.draft))
    .sort((a, b) => Number(a.order) - Number(b.order))

  return (
    <>
      {projectArray.map((project) => (
        <Card
          key={project.slug}
          title={project.title}
          goal={project.goal}
          stack={project.stack}
          love={project.love}
          slug={project.slug}
        />
      ))}
    </>
  )
}

export default Project
