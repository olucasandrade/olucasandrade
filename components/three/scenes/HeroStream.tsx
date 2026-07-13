'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'
const GREEN_LIGHT = '#4ade80'

interface NodeSpec {
  position: [number, number, number]
  radius: number
}

const NODES: NodeSpec[] = [
  { position: [-6, 1.5, 0], radius: 0.4 },
  { position: [-6, -1.5, 0], radius: 0.4 },
  { position: [0, 0, 0], radius: 0.6 },
  { position: [6, 1.5, 0], radius: 0.4 },
  { position: [6, -1.5, 0], radius: 0.4 },
]

const CENTER_INDEX = 2
const OUTER_INDICES = [0, 1, 3, 4]

function Node({ spec, isCenter, opacity }: { spec: NodeSpec; isCenter: boolean; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.15

    if (isCenter) {
      const t = state.clock.elapsedTime % 4
      if (t < 0.6) {
        // ease in/out scale pulse 1 -> 1.25 -> 1 across 0.6s
        const p = t / 0.6
        const scale = 1 + Math.sin(p * Math.PI) * 0.25
        ref.current.scale.setScalar(scale)
      } else if (ref.current.scale.x !== 1) {
        ref.current.scale.setScalar(1)
      }
    }
  })

  return (
    <mesh ref={ref} position={spec.position}>
      <icosahedronGeometry args={[spec.radius, 1]} />
      <meshBasicMaterial color={GREEN} wireframe transparent opacity={opacity} />
    </mesh>
  )
}

function Paths({ curves, opacity }: { curves: THREE.CatmullRomCurve3[]; opacity: number }) {
  // Build real THREE.Line objects (not the JSX `<line>` intrinsic, which TS
  // resolves to the SVG element type when merged with DOM typings) and
  // mount them via `primitive`.
  const lines = useMemo(
    () =>
      curves.map((curve) => {
        const points = curve.getPoints(64)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({
          color: GREEN,
          transparent: true,
          opacity: opacity * 0.12,
        })
        return new THREE.Line(geometry, material)
      }),
    [curves, opacity]
  )

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  )
}

function Particles({
  curves,
  count,
  opacity,
}: {
  curves: THREE.CatmullRomCurve3[]
  count: number
  opacity: number
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const perCurve = Math.floor(count / curves.length)

  const { positions, progresses, speeds, offsets, curveIndex } = useMemo(() => {
    const total = perCurve * curves.length
    const positions = new Float32Array(total * 3)
    const progresses = new Float32Array(total)
    const speeds = new Float32Array(total)
    const offsets = new Float32Array(total * 3)
    const curveIndex = new Int32Array(total)

    let i = 0
    for (let c = 0; c < curves.length; c++) {
      for (let p = 0; p < perCurve; p++) {
        progresses[i] = Math.random()
        speeds[i] = 0.05 + Math.random() * 0.1
        offsets[i * 3] = (Math.random() - 0.5) * 0.16
        offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.16
        offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.16
        curveIndex[i] = c
        i++
      }
    }
    return { positions, progresses, speeds, offsets, curveIndex }
  }, [curves, perCurve])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const geometry = pointsRef.current.geometry
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < progresses.length; i++) {
      progresses[i] += delta * speeds[i]
      if (progresses[i] >= 1) progresses[i] -= 1

      const curve = curves[curveIndex[i]]
      const point = curve.getPointAt(progresses[i])
      posAttr.setXYZ(
        i,
        point.x + offsets[i * 3],
        point.y + offsets[i * 3 + 1],
        point.z + offsets[i * 3 + 2]
      )
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={GREEN_LIGHT}
        transparent
        opacity={opacity * 0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function StreamGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.45
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  const curves = useMemo(() => {
    const center = NODES[CENTER_INDEX].position
    return OUTER_INDICES.map((idx, i) => {
      const outer = NODES[idx].position
      const zOffset = i % 2 === 0 ? 1 : -1
      const control = new THREE.Vector3(center[0], center[1], center[2] + zOffset)
      const start = new THREE.Vector3(...outer)
      const end = new THREE.Vector3(...center)
      return new THREE.CatmullRomCurve3([start, control, end])
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current || isMobile) return
    const targetY = state.pointer.x * 0.08
    const targetX = -state.pointer.y * 0.05
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05
  })

  return (
    <group ref={groupRef}>
      {NODES.map((spec, i) => (
        <Node key={i} spec={spec} isCenter={i === CENTER_INDEX} opacity={opacity} />
      ))}
      <Paths curves={curves} opacity={opacity} />
      <Particles curves={curves} count={isMobile ? 250 : 600} opacity={opacity} />
    </group>
  )
}

export default function HeroStream() {
  return (
    <SceneWrapper className="h-full w-full">
      <StreamGroup />
    </SceneWrapper>
  )
}
