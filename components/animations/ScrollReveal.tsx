'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeUp, slideInLeft, slideInRight, fadeIn } from '@/lib/animations'

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'left' | 'right' | 'fade'
  delay?: number
  duration?: number
  className?: string
}

const directionVariants = {
  up: fadeUp,
  left: slideInLeft,
  right: slideInRight,
  fade: fadeIn,
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.35,
  className,
}: ScrollRevealProps) {
  const variants = directionVariants[direction]

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
