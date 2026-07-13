'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'
const GREEN_LIGHT = '#4ade80'
const GREEN_GLOW = '#86efac'

function Route({ opacity }: { opacity: number }) {
  const lineRef = useRef<THREE.Line>(null)

  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ])
    const material = new THREE.LineDashedMaterial({
      color: GREEN,
      dashSize: 0.35,
      gapSize: 0.25,
      transparent: true,
      opacity: opacity * 0.35,
    })
    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()
    return line
  }, [opacity])

  useFrame((state) => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.LineDashedMaterial
    ;(mat as any).dashOffset = -state.clock.elapsedTime * 0.6
  })

  return <primitive ref={lineRef} object={line} />
}

function Packet({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const nextFlickerRef = useRef(1.5 + Math.random() * 1.5)
  const flickerUntilRef = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current || !coreRef.current) return
    meshRef.current.rotation.x += delta * 0.35
    meshRef.current.rotation.y += delta * 0.25
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.25

    coreRef.current.rotation.x -= delta * 0.15
    coreRef.current.rotation.z += delta * 0.1
    coreRef.current.position.y = meshRef.current.position.y

    if (glowRef.current) {
      glowRef.current.position.y = meshRef.current.position.y
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      glowRef.current.scale.setScalar(pulse)
    }

    const elapsed = state.clock.elapsedTime
    if (materialRef.current && coreMatRef.current) {
      if (elapsed >= nextFlickerRef.current && flickerUntilRef.current === 0) {
        flickerUntilRef.current = elapsed + 0.08 + Math.random() * 0.1
        materialRef.current.opacity = opacity * 0.15
        coreMatRef.current.opacity = opacity * 0.2
      } else if (flickerUntilRef.current !== 0 && elapsed >= flickerUntilRef.current) {
        materialRef.current.opacity = opacity
        coreMatRef.current.opacity = opacity * 0.85
        flickerUntilRef.current = 0
        nextFlickerRef.current = elapsed + 1.2 + Math.random() * 2.2
      }
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshBasicMaterial
          ref={materialRef}
          color={GREEN}
          wireframe
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={GREEN_LIGHT}
          transparent
          opacity={opacity * 0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial
          color={GREEN}
          transparent
          opacity={opacity * 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Debris({ count, opacity }: { count: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const debris = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
        number,
        number,
        number,
      ],
      drift: [
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.1,
      ] as [number, number, number],
      spin: [
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
      ] as [number, number, number],
      scale: 0.06 + Math.random() * 0.08,
    }))
  }, [count])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const d = debris[i]
      child.rotation.x += delta * d.spin[0]
      child.rotation.y += delta * d.spin[1]
      child.rotation.z += delta * d.spin[2]
      child.position.x += d.drift[0] * delta
      child.position.y += d.drift[1] * delta + Math.sin(t * 0.5 + i) * 0.001
      child.position.z += d.drift[2] * delta
      // wrap debris back toward center when it drifts too far
      if (child.position.length() > 3.5) {
        child.position.set(d.position[0], d.position[1], d.position[2])
      }
    })
  })

  return (
    <group ref={groupRef}>
      {debris.map((d, i) => (
        <mesh key={i} position={d.position} rotation={d.rotation} scale={d.scale}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={GREEN_GLOW}
            transparent
            opacity={opacity * 0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function ScanGrid({ opacity }: { opacity: number }) {
  const lines = useMemo(() => {
    const group = new THREE.Group()
    const material = new THREE.LineBasicMaterial({
      color: GREEN,
      transparent: true,
      opacity: opacity * 0.06,
    })
    for (let i = -6; i <= 6; i += 2) {
      const hGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, -3, -2),
        new THREE.Vector3(i, 3, -2),
      ])
      group.add(new THREE.Line(hGeometry, material))
      const vGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-8, i * 0.5, -2),
        new THREE.Vector3(2, i * 0.5, -2),
      ])
      group.add(new THREE.Line(vGeometry, material))
    }
    return group
  }, [opacity])

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.3
  })

  return <primitive ref={groupRef} object={lines} />
}

function PacketGroup() {
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.45

  return (
    <group>
      <ScanGrid opacity={opacity} />
      <Route opacity={opacity} />
      <Packet opacity={opacity} />
      <Debris count={18} opacity={opacity} />
    </group>
  )
}

export default function LostPacket() {
  return (
    <SceneWrapper className="h-64 w-full">
      <PacketGroup />
    </SceneWrapper>
  )
}
