'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper, { usePerformanceProfile } from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'
const GREEN_LIGHT = '#4ade80'
const GREEN_GLOW = '#86efac'

interface NodeSpec {
  position: [number, number, number]
  radius: number
  ringRadius?: number
}

const NODES: NodeSpec[] = [
  { position: [-6, 1.5, 0], radius: 0.4, ringRadius: 0.72 },
  { position: [-6, -1.5, 0], radius: 0.4, ringRadius: 0.72 },
  { position: [0, 0, 0], radius: 0.6, ringRadius: 1.1 },
  { position: [6, 1.5, 0], radius: 0.4, ringRadius: 0.72 },
  { position: [6, -1.5, 0], radius: 0.4, ringRadius: 0.72 },
]

const CENTER_INDEX = 2
const OUTER_INDICES = [0, 1, 3, 4]

function Node({ spec, isCenter, opacity }: { spec: NodeSpec; isCenter: boolean; opacity: number }) {
  const shellRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!shellRef.current || !coreRef.current) return

    shellRef.current.rotation.y += delta * 0.15
    shellRef.current.rotation.x += delta * 0.08
    coreRef.current.rotation.y -= delta * 0.1

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.25
      ringRef.current.rotation.y += delta * 0.15
    }

    if (isCenter) {
      const t = state.clock.elapsedTime % 3
      if (t < 0.6) {
        const p = t / 0.6
        const scale = 1 + Math.sin(p * Math.PI) * 0.35
        coreRef.current.scale.setScalar(scale)
      } else if (coreRef.current.scale.x !== 1) {
        coreRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <group position={spec.position}>
      {/* outer wireframe shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[spec.radius, 1]} />
        <meshBasicMaterial color={GREEN} wireframe transparent opacity={opacity} />
      </mesh>
      {/* inner glow core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[spec.radius * 0.55, 2]} />
        <meshBasicMaterial
          color={GREEN_LIGHT}
          transparent
          opacity={opacity * 0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* soft halo */}
      <mesh>
        <sphereGeometry args={[spec.radius * 1.5, 24, 24]} />
        <meshBasicMaterial
          color={GREEN}
          transparent
          opacity={opacity * 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* orbital ring */}
      {spec.ringRadius && (
        <mesh ref={ringRef} rotation={[Math.random(), Math.random(), Math.random()]}>
          <torusGeometry args={[spec.ringRadius, 0.018, 8, 64]} />
          <meshBasicMaterial color={GREEN_GLOW} transparent opacity={opacity * 0.35} />
        </mesh>
      )}
    </group>
  )
}

function Paths({ curves, opacity }: { curves: THREE.CatmullRomCurve3[]; opacity: number }) {
  const lines = useMemo(
    () =>
      curves.map((curve) => {
        const points = curve.getPoints(96)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({
          color: GREEN,
          transparent: true,
          opacity: opacity * 0.1,
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
        speeds[i] = 0.06 + Math.random() * 0.14
        offsets[i * 3] = (Math.random() - 0.5) * 0.2
        offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.2
        offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.2
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
        sizeAttenuation
      />
    </points>
  )
}

function DataShards({ count, opacity }: { count: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const shards = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
        number,
        number,
        number,
      ],
      speed: 0.1 + Math.random() * 0.3,
      axis: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      scale: 0.06 + Math.random() * 0.08,
    }))
  }, [count])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const shard = shards[i]
      child.rotation.x += delta * shard.speed * shard.axis[0]
      child.rotation.y += delta * shard.speed * shard.axis[1]
      child.position.y += Math.sin(state.clock.elapsedTime * shard.speed + i) * 0.001
    })
  })

  return (
    <group ref={groupRef}>
      {shards.map((shard, i) => (
        <mesh key={i} position={shard.position} rotation={shard.rotation} scale={shard.scale}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={GREEN}
            transparent
            opacity={opacity * 0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function BackgroundDust({ count, opacity }: { count: number; opacity: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      speeds[i] = 0.2 + Math.random() * 0.5
    }
    return { positions, speeds }
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i) - speeds[i] * 0.003
      posAttr.setX(i, x < -15 ? 15 : x)
    }
    posAttr.needsUpdate = true
    pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.02
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
        size={0.04}
        color={GREEN}
        transparent
        opacity={opacity * 0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function StreamGroup() {
  const groupRef = useRef<THREE.Group>(null)
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.42
  const profile = usePerformanceProfile()
  const isMobile = profile?.lowEnd ?? false

  const curves = useMemo(() => {
    const center = NODES[CENTER_INDEX].position
    return OUTER_INDICES.map((idx, i) => {
      const outer = NODES[idx].position
      const zOffset = i % 2 === 0 ? 1.2 : -1.2
      const control = new THREE.Vector3(center[0], center[1], center[2] + zOffset)
      const start = new THREE.Vector3(...outer)
      const end = new THREE.Vector3(...center)
      return new THREE.CatmullRomCurve3([start, control, end])
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current || isMobile) return
    const targetY = state.pointer.x * 0.1
    const targetX = -state.pointer.y * 0.06
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.04
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04
  })

  const particleCount = isMobile ? 200 : 700
  const shardCount = isMobile ? 12 : 28
  const dustCount = isMobile ? 80 : 180

  return (
    <group ref={groupRef}>
      <BackgroundDust count={dustCount} opacity={opacity} />
      {NODES.map((spec, i) => (
        <Node key={i} spec={spec} isCenter={i === CENTER_INDEX} opacity={opacity} />
      ))}
      <Paths curves={curves} opacity={opacity} />
      <Particles curves={curves} count={particleCount} opacity={opacity} />
      <DataShards count={shardCount} opacity={opacity} />
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
