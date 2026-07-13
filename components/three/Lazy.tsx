'use client'

import dynamic from 'next/dynamic'

export const LazyHeroScene = dynamic(() => import('./scenes/HeroStream'), { ssr: false })
export const LazyProjectsScene = dynamic(() => import('./scenes/ServiceGraph'), { ssr: false })
export const LazyLostPacketScene = dynamic(() => import('./scenes/LostPacket'), { ssr: false })

export function preloadHeroScene(): void {
  void import('./scenes/HeroStream')
}

export function preloadProjectsScene(): void {
  void import('./scenes/ServiceGraph')
}

export function preloadLostPacketScene(): void {
  void import('./scenes/LostPacket')
}
