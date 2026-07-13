'use client'

import { Canvas } from '@react-three/fiber'
import { ReactNode, useEffect, useRef, useState } from 'react'

export interface PerformanceProfile {
  /** max device pixel ratio */
  dpr: number
  /** whether the device should get a lighter scene */
  lowEnd: boolean
  /** whether pointer-driven effects should be skipped */
  reducedMotion: boolean
}

interface SceneWrapperProps {
  children: ReactNode
  className?: string
  /** stop rendering when scrolled offscreen (default true) */
  pauseOffscreen?: boolean
  /** camera starting position (default [0,0,12]) */
  cameraPosition?: [number, number, number]
  /** vertical field of view (default 45) */
  fov?: number
  /** override performance detection */
  profile?: PerformanceProfile
}

function getPerformanceProfile(): PerformanceProfile {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let webgl = false
  try {
    const canvas = document.createElement('canvas')
    webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    webgl = false
  }

  const memory = (navigator as any).deviceMemory
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const lowEnd =
    !webgl ||
    reduced ||
    (memory !== undefined && memory < 4) ||
    hardwareConcurrency < 4 ||
    window.innerWidth < 768

  // Cap DPR on low-end and very high-density screens to keep fragment cost sane.
  const dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)

  return { dpr, lowEnd, reducedMotion: reduced }
}

export function usePerformanceProfile(): PerformanceProfile | null {
  const [profile, setProfile] = useState<PerformanceProfile | null>(null)

  useEffect(() => {
    setProfile(getPerformanceProfile())
  }, [])

  return profile
}

export default function SceneWrapper({
  children,
  className,
  pauseOffscreen = true,
  cameraPosition = [0, 0, 12],
  fov = 45,
  profile: profileProp,
}: SceneWrapperProps) {
  const detectedProfile = usePerformanceProfile()
  const profile = profileProp ?? detectedProfile
  const holderRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    if (!pauseOffscreen || !holderRef.current) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '200px',
    })
    observer.observe(holderRef.current)
    return () => observer.disconnect()
  }, [pauseOffscreen])

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!profile) return null
  if (profile.reducedMotion || profile.dpr === 0) return null

  return (
    <div ref={holderRef} className={className} aria-hidden="true" data-cursor="3d">
      <Canvas
        dpr={profile.dpr}
        frameloop={inView && tabVisible ? 'always' : 'never'}
        gl={{ antialias: !profile.lowEnd, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: cameraPosition, fov }}
      >
        {children}
      </Canvas>
    </div>
  )
}
