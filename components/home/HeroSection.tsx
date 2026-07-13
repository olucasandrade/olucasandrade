'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from '@/components/mdxcomponents/Link'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import { useParams } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useTranslation } from 'app/[locale]/i18n/client'
import { useContactModal } from '@/components/formspree/store'
import { fadeUp, staggerContainer, defaultTransition } from '@/lib/animations'
import { LazyHeroScene } from '@/components/three/Lazy'

const keywords = ['TypeScript', 'Go', 'PostgreSQL', 'React', 'Python']

export default function HeroSection() {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'hero')
  const contactModal = useContactModal()
  const [currentKeyword, setCurrentKeyword] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setCurrentKeyword((prev) => (prev + 1) % keywords.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col items-center gap-8 pb-8 pt-6 md:flex-row md:gap-12 md:pb-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <LazyHeroScene />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-gray-900 dark:via-gray-900/70" />
      <motion.div variants={fadeUp} transition={defaultTransition} className="flex-shrink-0">
        <div className="relative h-32 w-32 md:h-40 md:w-40">
          <Image
            src="/static/images/avatar.png"
            alt="Lucas Andrade"
            fill
            className="rounded-full object-cover ring-2 ring-primary-500/20"
            priority
          />
        </div>
      </motion.div>

      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <motion.h1
          variants={fadeUp}
          transition={defaultTransition}
          className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl"
        >
          Lucas Andrade
        </motion.h1>

        <motion.div
          variants={fadeUp}
          transition={defaultTransition}
          className="mt-3 flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300 md:text-xl"
        >
          <span>{t('subtitle')}</span>
          <span className="relative inline-grid text-left">
            {/* invisible sizer: longest keyword pins the width */}
            <span className="invisible font-semibold [grid-area:1/1]">PostgreSQL</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={keywords[currentKeyword]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="inline-block font-semibold text-primary-500 [grid-area:1/1]"
              >
                {keywords[currentKeyword]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          transition={defaultTransition}
          className="mt-4 max-w-lg text-gray-500 dark:text-gray-400"
        >
          {t('description')}
        </motion.p>

        <motion.div variants={fadeUp} transition={defaultTransition} className="mt-6 flex gap-4">
          <Link
            href={`/${locale}/blog`}
            className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            {t('readBlog')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:text-primary-500"
          >
            {t('viewProjects')}
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={defaultTransition}
          className="mt-6 flex items-center space-x-3"
        >
          {siteMetadata.formspree ? (
            <button
              className="flex items-center focus:outline-none"
              onClick={() => contactModal.onOpen()}
            >
              <SocialIcon kind="mail" size={5} />
            </button>
          ) : (
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
          )}
          <SocialIcon kind="github" href={siteMetadata.github} size={5} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={5} />
        </motion.div>
      </div>
    </motion.section>
  )
}
