'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [suppressed, setSuppressed] = useState(false)
  const [windowVisible, setWindowVisible] = useState(true)

  const springConfig = { damping: 40, stiffness: 800, mass: 0.2 }
  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === 'undefined' || 'ontouchstart' in window) return

    // Respect OS-level reduced motion: leave `visible` false so this
    // component renders nothing and the native cursor is untouched.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setVisible(true)

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest('a, button, [role="button"]')
      const nativeCursorTarget = target.closest(
        'input, textarea, select, iframe, [contenteditable]'
      )

      setHovered(Boolean(interactive))
      setSuppressed(Boolean(nativeCursorTarget))
    }

    const handleMouseLeave = () => setWindowVisible(false)
    const handleMouseEnter = () => setWindowVisible(true)

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('pointerover', handlePointerOver)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('pointerover', handlePointerOver)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY])

  if (!visible) return null

  const dimmed = suppressed || !windowVisible

  return (
    <>
      <style jsx global>{`
        @media (hover: hover) and (pointer: fine) {
          body:not(
            :has(input:hover, textarea:hover, select:hover, iframe:hover, [contenteditable]:hover)
          ) {
            cursor: none;
          }
          a,
          button,
          [role='button'] {
            cursor: none;
          }
        }
      `}</style>
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-primary-500"
        style={{
          x: cursorX,
          y: cursorY,
          width: 8,
          height: 8,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: dimmed ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border-2 border-primary-500/50"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovered ? 48 : 32,
          height: hovered ? 48 : 32,
          borderColor: hovered ? 'rgba(22, 163, 74, 0.8)' : 'rgba(22, 163, 74, 0.3)',
          opacity: dimmed ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
