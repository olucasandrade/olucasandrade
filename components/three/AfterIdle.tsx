'use client'

import { ReactNode, useEffect, useState } from 'react'

export default function AfterIdle({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const ric = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
    const id = ric(() => setReady(true))
    return () => ((window as any).cancelIdleCallback ?? clearTimeout)(id)
  }, [])
  return ready ? <>{children}</> : null
}
