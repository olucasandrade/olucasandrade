'use client'

import { Canvas } from '@react-three/fiber'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface SceneWrapperProps {
  children: ReactNode
  className?: string
  /** stop rendering when scrolled offscreen (default true) */
  pauseOffscreen?: boolean
}

function useCanRender3D() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      const canvas = document.createElement('canvas')
      webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      webgl = false
    }
    // deviceMemory is Chrome-only; undefined counts as capable
    const lowEnd =
      (navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory < 4
    setOk(!reduced && webgl && !lowEnd)
  }, [])
  return ok
}

export default function SceneWrapper({
  children,
  className,
  pauseOffscreen = true,
}: SceneWrapperProps) {
  const canRender = useCanRender3D()
  const holderRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    if (!pauseOffscreen || !holderRef.current) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(holderRef.current)
    return () => observer.disconnect()
  }, [pauseOffscreen])

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (canRender === null || canRender === false) return null // fallback handled by parent

  return (
    <div ref={holderRef} className={className} aria-hidden="true" data-cursor="3d">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={inView && tabVisible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 12], fov: 45 }}
      >
        {children}
      </Canvas>
    </div>
  )
}
