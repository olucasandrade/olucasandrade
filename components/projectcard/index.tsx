import Image from '../mdxcomponents/Image'
import Link from '../mdxcomponents/Link'
import { useParams } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'

import { motion } from 'framer-motion'
import { useTranslation } from 'app/[locale]/i18n/client'
import { fadeUp, defaultTransition } from '@/lib/animations'

interface CardProps {
  title: string
  description: string
  imgSrc?: string
  href?: string
}

const ExternalLinkIcon = () => (
  <svg
    className="ml-1 h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
)

const Card: React.FC<CardProps> = ({ title, description, imgSrc, href }) => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'projects')
  const isExternal = href?.startsWith('http')
  const resolvedHref = href ? (isExternal ? href : `/${locale}${href}`) : undefined

  const content = (
    <div className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-glow dark:border-gray-700/60 dark:bg-gray-800/80">
      {imgSrc && (
        <div className="flex h-40 items-center justify-center bg-gray-50 p-6 dark:bg-gray-900/40">
          <Image
            alt={title}
            title={title}
            src={imgSrc}
            width={200}
            height={112}
            className="max-h-full w-auto object-contain"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">{title}</h2>
        <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
        {href && (
          <span className="inline-flex items-center text-base font-medium leading-6 text-primary-500">
            {isExternal ? t('visit') : t('read')} &rarr;
            {isExternal && <ExternalLinkIcon />}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      transition={defaultTransition}
      className="md max-w-[544px] p-4 md:w-1/2"
    >
      {resolvedHref ? (
        <Link href={resolvedHref} aria-label={`${t('linkto')}${title}`} className="block h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  )
}
export default Card
