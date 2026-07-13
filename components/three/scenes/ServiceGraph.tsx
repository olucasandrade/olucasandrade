'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper, { usePerformanceProfile } from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'
const GREEN_LIGHT = '#4ade80'
const GREEN_GLOW = '#86efac'

const MAX_CONCURRENT_PULSES = 5
const PULSE_INTERVAL = 1.4
const PULSE_DURATION = 1.0

// 24 nodes arranged in three loose clusters.
const NODE_POSITIONS: [number, number, number][] = [
  // cluster A (left)
  [-7.2, 2.4, -0.4],
  [-6.1, 1.1, -1.1],
  [-6.6, -0.6, -0.2],
  [-5.4, -2.2, -1.4],
  [-7.8, -1.0, -1.8],
  [-4.7, 2.8, -0.8],
  [-4.2, 0.2, -1.6],
  // cluster B (center)
  [-1.4, 2.6, -0.3],
  [-0.6, 0.8, -1.2],
  [0.4, -0.7, -0.5],
  [1.2, -2.4, -1.6],
  [-1.8, -1.6, -1.0],
  [0.9, 1.7, -1.9],
  // cluster C (right)
  [4.4, 2.5, -0.6],
  [5.6, 1.0, -1.3],
  [6.4, -0.8, -0.4],
  [5.0, -2.2, -1.5],
  [7.4, -1.4, -1.1],
  [3.8, 0.2, -1.7],
  [6.8, 2.0, -1.9],
  // bridge nodes
  [2.6, 3.2, -0.2],
  [3.0, -3.2, -0.9],
  [-2.8, -3.0, -1.2],
  [-3.2, 3.0, -1.5],
]

const EDGES: [number, number][] = (() => {
  const seen = new Set<string>()
  const pairs: [number, number][] = []
  NODE_POSITIONS.forEach((pos, i) => {
    const distances = NODE_POSITIONS.map((other, j) => ({
      j,
      d: i === j ? Infinity : Math.hypot(pos[0] - other[0], pos[1] - other[1], pos[2] - other[2]),
    })).sort((a, b) => a.d - b.d)

    distances.slice(0, 3).forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!seen.has(key)) {
        seen.add(key)
        pairs.push(i < j ? [i, j] : [j, i])
      }
    })
  })
  return pairs
})()

function Nodes({
  opacity,
  activeNodesRef,
}: {
  opacity: number
  activeNodesRef: MutableRefObject<ActiveNodeRegistry>
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const active = activeNodesRef.current.active
    groupRef.current.children.forEach((child, i) => {
      const isActive = active.has(i)
      const core = child.children[0] as THREE.Mesh | undefined
      const halo = child.children[1] as THREE.Mesh | undefined
      if (core && halo) {
        const targetScale = isActive ? 1.6 : 1
        core.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12)
        const haloMat = halo.material as THREE.MeshBasicMaterial
        haloMat.opacity += ((isActive ? opacity * 0.22 : opacity * 0.06) - haloMat.opacity) * 0.12
      }
    })
  })

  return (
    <group ref={groupRef}>
      {NODE_POSITIONS.map((position, i) => (
        <group key={i} position={position}>
          <mesh>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshBasicMaterial color={GREEN_LIGHT} transparent opacity={opacity} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.32, 20, 20]} />
            <meshBasicMaterial
              color={GREEN}
              transparent
              opacity={opacity * 0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
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
          opacity: opacity * 0.07,
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

function Pulses({ onPulseArrival }: { onPulseArrival?: (node: number) => void }) {
  const pulsesRef = useRef<Pulse[]>([])
  const nextSpawnRef = useRef(0)
  const pointsRef = useRef<THREE.Points>(null)
  const trailRefs = useRef<THREE.Points[]>([])

  const positions = useMemo(() => new Float32Array(MAX_CONCURRENT_PULSES * 3), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime

    if (elapsed >= nextSpawnRef.current && pulsesRef.current.length < MAX_CONCURRENT_PULSES) {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
      pulsesRef.current.push({ edge, start: elapsed })
      nextSpawnRef.current = elapsed + PULSE_INTERVAL * (0.7 + Math.random() * 0.6)
    }

    const arrived = new Set<number>()
    pulsesRef.current = pulsesRef.current.filter((pulse) => {
      const finished = elapsed - pulse.start >= PULSE_DURATION
      if (finished) {
        arrived.add(pulse.edge[1])
      }
      return !finished
    })

    arrived.forEach((node) => onPulseArrival?.(node))

    if (!pointsRef.current) return
    const geometry = pointsRef.current.geometry
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < MAX_CONCURRENT_PULSES; i++) {
      const pulse = pulsesRef.current[i]
      if (!pulse) {
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
        size={0.18}
        color={GREEN_GLOW}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function AmbientParticles({ count, opacity }: { count: number; opacity: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, phases }
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i) + Math.sin(t * 0.5 + phases[i]) * 0.002
      posAttr.setY(i, y)
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
        size={0.05}
        color={GREEN}
        transparent
        opacity={opacity * 0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

interface ActiveNodeRegistry {
  active: Set<number>
}

function GraphGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.4
  const profile = usePerformanceProfile()
  const isMobile = profile?.lowEnd ?? false
  const activeRef = useRef<ActiveNodeRegistry>({ active: new Set() })

  useFrame((state) => {
    if (!groupRef.current) return
    const elapsed = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(elapsed * 0.04) * 0.03
    groupRef.current.position.y = Math.sin(elapsed * 0.08) * 0.15
    groupRef.current.rotation.y = Math.sin(elapsed * 0.015) * 0.04
  })

  const handlePulseArrival = (node: number) => {
    activeRef.current.active.add(node)
    setTimeout(() => {
      activeRef.current.active.delete(node)
    }, 350)
  }

  return (
    <group ref={groupRef}>
      <AmbientParticles count={isMobile ? 60 : 140} opacity={opacity} />
      <Nodes opacity={opacity} activeNodesRef={activeRef} />
      <Edges opacity={opacity} />
      <Pulses onPulseArrival={handlePulseArrival} />
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
