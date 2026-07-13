'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneWrapper from '../SceneWrapper'
import { useIsDarkMode } from '../useIsDarkMode'

const GREEN = '#16a34a'

function Route({ opacity }: { opacity: number }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ])
    const material = new THREE.LineDashedMaterial({
      color: GREEN,
      dashSize: 0.2,
      gapSize: 0.15,
      transparent: true,
      opacity: opacity * 0.3,
    })
    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()
    return line
  }, [opacity])

  return <primitive object={line} />
}

function Packet({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const nextFlickerRef = useRef(1.5 + Math.random() * 1.5)
  const flickerUntilRef = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.3
    meshRef.current.rotation.y += delta * 0.2
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3

    const elapsed = state.clock.elapsedTime
    if (materialRef.current) {
      if (elapsed >= nextFlickerRef.current && flickerUntilRef.current === 0) {
        flickerUntilRef.current = elapsed + 0.1
        materialRef.current.opacity = opacity * 0.2
      } else if (flickerUntilRef.current !== 0 && elapsed >= flickerUntilRef.current) {
        materialRef.current.opacity = opacity
        flickerUntilRef.current = 0
        nextFlickerRef.current = elapsed + 1.5 + Math.random() * 1.5
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial ref={materialRef} color={GREEN} wireframe transparent opacity={opacity} />
    </mesh>
  )
}

function PacketGroup() {
  const isDark = useIsDarkMode()
  const opacity = isDark ? 1 : 0.45

  return (
    <group>
      <Route opacity={opacity} />
      <Packet opacity={opacity} />
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
