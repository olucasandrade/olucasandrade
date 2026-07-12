'use client'

import AfterIdle from './AfterIdle'
import { LazyProjectsScene } from './Lazy'

export default function ProjectsBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <AfterIdle>
        <LazyProjectsScene />
      </AfterIdle>
    </div>
  )
}
