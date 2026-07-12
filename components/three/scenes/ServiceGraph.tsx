'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'
const GREEN_LIGHT = '#4ade80'
const MAX_CONCURRENT_PULSES = 3
const PULSE_INTERVAL = 2.5
const PULSE_DURATION = 1.2

// 14 fixed pseudo-random positions in a flat ellipsoid: x∈[-8,8], y∈[-4,4], z∈[-2,0].
// Hardcoded so the "constellation" layout is deterministic across renders/reloads.
const NODE_POSITIONS: [number, number, number][] = [
  [-7.2, 2.6, -0.4],
  [-5.8, -1.8, -1.2],
  [-4.5, 3.4, -1.8],
  [-3.6, 0.2, -0.6],
  [-2.1, -2.9, -1.4],
  [-0.8, 1.6, -0.2],
  [0.4, -0.6, -1.6],
  [1.6, 3.1, -0.8],
  [2.9, -3.2, -0.3],
  [3.8, 0.8, -1.9],
  [5.1, -1.4, -0.5],
  [6.0, 2.4, -1.1],
  [7.1, -2.6, -1.7],
  [7.6, 0.6, -0.2],
]

// Each node connected to its 2 nearest neighbors, precomputed from the fixed
// positions above (deterministic — the positions never change at runtime).
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>()
  const pairs: [number, number][] = []
  NODE_POSITIONS.forEach((pos, i) => {
    const distances = NODE_POSITIONS.map((other, j) => ({
      j,
      d: i === j ? Infinity : Math.hypot(pos[0] - other[0], pos[1] - other[1], pos[2] - other[2]),
    })).sort((a, b) => a.d - b.d)

    distances.slice(0, 2).forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!seen.has(key)) {
        seen.add(key)
        pairs.push(i < j ? [i, j] : [j, i])
      }
    })
  })
  return pairs
})()

function Nodes({ opacity }: { opacity: number }) {
  return (
    <>
      {NODE_POSITIONS.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={GREEN} transparent opacity={opacity * 0.5} />
        </mesh>
      ))}
    </>
  )
}

function Edges({ opacity }: { opacity: number }) {
  const lines = useMemo(
    () =>
      EDGES.map(([a, b]) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...NODE_POSITIONS[a]),
          new THREE.Vector3(...NODE_POSITIONS[b]),
        ])
        const material = new THREE.LineBasicMaterial({
          color: GREEN,
          transparent: true,
          opacity: opacity * 0.08,
        })
        return new THREE.Line(geometry, material)
      }),
    [opacity]
  )

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  )
}

interface Pulse {
  edge: [number, number]
  start: number
}

function Pulses() {
  const pulsesRef = useRef<Pulse[]>([])
  const nextSpawnRef = useRef(0)
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => new Float32Array(MAX_CONCURRENT_PULSES * 3), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime

    if (elapsed >= nextSpawnRef.current && pulsesRef.current.length < MAX_CONCURRENT_PULSES) {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
      pulsesRef.current.push({ edge, start: elapsed })
      nextSpawnRef.current = elapsed + PULSE_INTERVAL
    }

    pulsesRef.current = pulsesRef.current.filter((pulse) => elapsed - pulse.start < PULSE_DURATION)

    if (!pointsRef.current) return
    const geometry = pointsRef.current.geometry
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < MAX_CONCURRENT_PULSES; i++) {
      const pulse = pulsesRef.current[i]
      if (!pulse) {
        // park unused pulse slots far away rather than at the origin
        posAttr.setXYZ(i, 0, 0, -1000)
        continue
      }
      const t = Math.min((elapsed - pulse.start) / PULSE_DURATION, 1)
      const from = NODE_POSITIONS[pulse.edge[0]]
      const to = NODE_POSITIONS[pulse.edge[1]]
      scratch.set(from[0], from[1], from[2]).lerp(new THREE.Vector3(...to), t)
      posAttr.setXYZ(i, scratch.x, scratch.y, scratch.z)
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
        size={0.14}
        color={GREEN_LIGHT}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function GraphGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.45

  useFrame((state) => {
    if (!groupRef.current) return
    const elapsed = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(elapsed * 0.05) * 0.04
    groupRef.current.position.y = Math.sin(elapsed * 0.1) * 0.2
  })

  return (
    <group ref={groupRef}>
      <Nodes opacity={opacity} />
      <Edges opacity={opacity} />
      <Pulses />
    </group>
  )
}

export default function ServiceGraph() {
  return (
    <SceneWrapper className="h-full w-full">
      <GraphGroup />
    </SceneWrapper>
  )
}
