import { useEffect, useRef, useState } from 'react'
import Link from '../mdxcomponents/Link'
import { useParams } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useTranslation } from 'app/[locale]/i18n/client'
import { fadeUp, defaultTransition } from '@/lib/animations'

interface CardProps {
  title: string
  goal: string
  stack: string[]
  love: string
  slug: string
}

const Card: React.FC<CardProps> = ({ title, goal, stack, love, slug }) => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'projects')
  const resolvedHref = `/${locale}/projects/${slug}`

  const cardRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [canTilt, setCanTilt] = useState(false)

  useEffect(() => {
    setCanTilt(window.matchMedia('(hover: hover)').matches && !prefersReducedMotion)
  }, [prefersReducedMotion])

  // MotionConfig reducedMotion="user" (doc 02 task 2) only covers the `animate`
  // prop, not raw motion values driven from pointer handlers — hence the
  // explicit useReducedMotion() check above gating both `canTilt` and the
  // handlers themselves.
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  function onPointerMove(e: React.PointerEvent) {
    if (!canTilt || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * 8) // max 8deg
    rx.set(-py * 6) // max 6deg
  }
  function onPointerLeave() {
    rx.set(0)
    ry.set(0)
  }

  const content = (
    <motion.div
      ref={cardRef}
      style={canTilt ? { rotateX: rx, rotateY: ry, transformPerspective: 800 } : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-glow dark:border-gray-700/60 dark:bg-gray-800/80"
    >
      <div className="p-6">
        <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">{title}</h2>
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-primary-500">{t('goal')}:</span> {goal}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-primary-500">{t('stack')}:</span>
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-primary-500">{t('love')}:</span> {love}
          </p>
        </div>
        <span className="inline-flex items-center text-base font-medium leading-6 text-primary-500">
          {t('read')} &rarr;
        </span>
      </div>
    </motion.div>
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
