# Work Doc 03 — 3D Animations: the "Data-Systems World"

> **Execution order:** after `01-issues.md` and `02-ux-ui-polish.md` (it relies on the reduced-motion provider and cursor fixes from doc 02).
> **Audience:** an implementation agent with no prior context.

## Creative direction (decided with the owner — do not relitigate)

- The owner chose to **go big on WebGL**: multiple three.js scenes, not just accents.
- **Motif: distributed data systems.** Every scene visualizes something the owner actually works on (CDC event streams — his project Kaptanto; Postgres; service graphs). No generic floating blobs.
- The site's purpose is technical brand, and the visual design is otherwise being *polished, not redesigned* (doc 02) — so the 3D must sit **behind and around the existing layout**, in the existing green palette, never obstructing text.
- Palette (from `tailwind.config.js`): primary green `#16a34a`, lighter `#4ade80`, glow `rgba(22,163,74,…)`. Scenes use ONLY greens + white/gray. Dark mode is the "native habitat"; light mode gets reduced-opacity variants.
- Hard rule: **content is never blocked by 3D**. Scenes are `aria-hidden`, decorative, and every one has a static fallback.

## Stack & installation

The project is Next.js 15 App Router + React 19 + TypeScript, package manager **bun**.

```bash
bun add three @react-three/fiber @react-three/drei
bun add -d @types/three
```

Version constraints (important): React 19 requires **@react-three/fiber v9** and **@react-three/drei v10** (older majors peer-depend on React 18). If bun resolves fiber v8, pin explicitly: `bun add @react-three/fiber@^9 @react-three/drei@^10`. Do NOT add `@react-three/postprocessing` — glow is achieved with additive blending, saving ~100KB.

## Architecture — build this first

All 3D code lives in `components/three/`. Nothing imports three.js statically from page code; every scene loads via `next/dynamic` with `ssr: false` so the base bundle stays clean.

### File: `components/three/SceneWrapper.tsx` (the foundation)

A client component wrapping `<Canvas>` with all guardrails. Every scene uses it.

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface SceneWrapperProps {
  children: ReactNode
  className?: string
  /** stop rendering when scrolled offscreen (default true) */
  pauseOffscreen?: boolean
}

function useCanRender3D() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      const canvas = document.createElement('canvas')
      webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      webgl = false
    }
    // deviceMemory is Chrome-only; undefined counts as capable
    const lowEnd = (navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory < 4
    setOk(!reduced && webgl && !lowEnd)
  }, [])
  return ok
}

export default function SceneWrapper({ children, className, pauseOffscreen = true }: SceneWrapperProps) {
  const canRender = useCanRender3D()
  const holderRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    if (!pauseOffscreen || !holderRef.current) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(holderRef.current)
    return () => observer.disconnect()
  }, [pauseOffscreen])

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (canRender === null || canRender === false) return null // fallback handled by parent

  return (
    <div ref={holderRef} className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={inView && tabVisible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 12], fov: 45 }}
      >
        {children}
      </Canvas>
    </div>
  )
}
```

Key decisions encoded above (do not remove): DPR clamped at 1.75; `frameloop="never"` when offscreen or tab hidden (GPU cost → 0); transparent canvas (`alpha: true`) so pages keep their normal background; `aria-hidden` on the holder.

### File: `components/three/Lazy.tsx` (the loader)

```tsx
'use client'

import dynamic from 'next/dynamic'

export const LazyHeroScene = dynamic(() => import('./scenes/HeroStream'), { ssr: false })
export const LazyProjectsScene = dynamic(() => import('./scenes/ServiceGraph'), { ssr: false })
export const LazyLostPacketScene = dynamic(() => import('./scenes/LostPacket'), { ssr: false })
```

Additionally, mount scenes only after the browser is idle so they never compete with LCP. Create `components/three/AfterIdle.tsx`:

```tsx
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
```

### Theme awareness

Scenes need to know dark vs light to modulate opacity: dark = 1.0×, light = 0.45×. Read `components/theme/ThemeContext.tsx` first to see how the site exposes the current theme (it wraps `next-themes`-style class dark mode) and use that mechanism inside scene components.

---

## Scene 1 — `HeroStream`: event-stream particles (home page)

**The idea:** the hero background visualizes a CDC pipeline (the owner's project Kaptanto): particles ("events") flow along curved paths from a producer cluster (left) through a central hub to consumer nodes (right). It reads as "data flowing through systems" at a glance.

**File:** `components/three/scenes/HeroStream.tsx`

**Spec (implement exactly):**
1. **Nodes:** 5 wireframe icosahedrons (`icosahedronGeometry args={[0.4, 1]}`, `meshBasicMaterial wireframe color '#16a34a'`): 2 on the left (`x≈-6, y=±1.5`), 1 center (`x=0, y=0`, radius 0.6), 2 on the right (`x≈6, y=±1.5`). Each rotates slowly (`useFrame`: `rotation.y += delta * 0.15`).
2. **Paths:** 4 `CatmullRomCurve3` curves, one from each outer node through the center node (control point at center with slight z-offset ±1 for depth variety). Render each as a faint line: sample 64 points → `bufferGeometry` + `lineBasicMaterial color '#16a34a' transparent opacity 0.12`.
3. **Particles:** 600 total (150 per curve). One `THREE.Points` object with a `bufferGeometry` position attribute updated each frame. Each particle has a scalar progress `t ∈ [0,1)` advancing by `delta * speed` (speed randomized per particle in `[0.05, 0.15]`); position = `curve.getPointAt(t)` plus a small per-particle random offset (±0.08) so the stream has thickness. On `t ≥ 1`, wrap to 0.
   - Material: `pointsMaterial` with `size 0.06`, `color '#4ade80'`, `transparent`, `opacity 0.9`, `blending: THREE.AdditiveBlending`, `depthWrite: false`. Additive blending over a transparent canvas produces the glow — no postprocessing needed.
4. **Pulse:** every 4 seconds, the center node scales `1 → 1.25 → 1` over 0.6s (clock-based ease in `useFrame`) — the "commit" heartbeat.
5. **Mouse parallax:** read the normalized pointer from R3F state (`state.pointer`); lerp the group's rotation toward `y = pointer.x * 0.08`, `x = -pointer.y * 0.05` (factor 0.05 per frame). Subtle — a few degrees, not a spin.
6. **Mobile (`window.innerWidth < 768` measured once on mount):** 250 particles, no parallax.

**Integration** — `components/home/HeroSection.tsx`:
- Make the `<motion.section>` `relative`, then add as first child:
  ```tsx
  <div className="pointer-events-none absolute inset-0 -z-10">
    <AfterIdle>
      <LazyHeroScene />
    </AfterIdle>
  </div>
  ```
  with `SceneWrapper` used inside `HeroStream` filling the container (`className="h-full w-full"`).
- **Text legibility mask:** overlay a gradient div between canvas and text: `<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-gray-900 dark:via-gray-900/70" />` — the hero text sits on the solid side; particles are fully visible on the emptier right side.
- **Fallback (canRender false / while loading):** nothing renders — the hero looks exactly as it does today. Intentional; no skeleton.

## Scene 2 — `ServiceGraph`: slow constellation (projects page)

**The idea:** a sparse "microservices constellation" — nodes connected by lines, occasionally exchanging a traveling pulse — floats dimly behind the projects grid.

**File:** `components/three/scenes/ServiceGraph.tsx`

**Spec:**
1. 14 nodes at fixed pseudo-random positions in a flat ellipsoid (x∈[-8,8], y∈[-4,4], z∈[-2,0]) — hardcode the array so it's deterministic. Node = `sphereGeometry args={[0.08, 12, 12]}`, `meshBasicMaterial color '#16a34a' transparent opacity 0.5`.
2. Edges: connect each node to its 2 nearest neighbors (precompute; hardcode the pair list). `lineBasicMaterial transparent opacity 0.08`.
3. Pulses: every 2.5s, pick a random edge and animate a single bright point (`size 0.14`, additive blending) along it over 1.2s — a "request" hopping between services. Max 3 concurrent pulses.
4. Whole group drifts: `rotation.z = sin(elapsed * 0.05) * 0.04`, `position.y = sin(elapsed * 0.1) * 0.2`.
5. Opacity multiplier 0.45 in light mode (see Theme awareness).

**Integration** — `app/[locale]/projects/page.tsx` is a server component; create a client wrapper `components/three/ProjectsBackdrop.tsx`:
```tsx
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
```
Render `<ProjectsBackdrop />` as the first child of the projects page fragment. `fixed inset-0 -z-10` puts it behind everything; the cards (`bg-white/80 backdrop-blur-sm` after doc 02 task 6) stay perfectly readable — this pairing is exactly why the card recipe uses translucency.

**Guardrail:** if scroll performance on a mid-range phone drops (test!), switch to a `frameloop='demand'` variant: advance pulses and call `invalidate()` on a 100ms interval instead of continuous rendering.

## Scene 3 — `LostPacket`: the 404 page

**The idea:** a lone packet (small glowing cube) drifts in darkness, its route flickering — "TTL expired". The one place where 3D is foreground, because a 404 has no content to obstruct.

**File:** `components/three/scenes/LostPacket.tsx`

**Spec:**
1. One cube (`boxGeometry args={[0.5, 0.5, 0.5]}`, wireframe green) tumbling slowly (`rotation.x += delta*0.3`, `rotation.y += delta*0.2`) and bobbing (`position.y = sin(elapsed*0.8)*0.3`).
2. Behind it, a dashed line (its "route") stopping abruptly at the cube: `THREE.Line` with `LineDashedMaterial` (`dashSize 0.2, gapSize 0.15, transparent opacity 0.3`) from `x=-10` to the cube; remember `line.computeLineDistances()`.
3. Flicker: every 1.5–3s (random) the cube material opacity blinks to 0.2 for 100ms and back.
4. Text stays in HTML (existing 404 copy). Scene sits above the text block, height `h-64`.

**Integration:** `components/notfound/Client.tsx` (read it first) — insert at the `{/* 3D slot */}` comment left by doc 02 task 10.3. Same `AfterIdle` + lazy pattern. Fallback: the existing static 404 (no visual regression).

## Scene 4 (no WebGL) — CSS 3D micro-interactions

Only framer-motion (already installed). No canvas, no bundle cost — these extend the 3D language to touch-level detail.

### 4a. Project card tilt

**File:** `components/projectcard/index.tsx` (after doc 02 task 6 restructured it).

```tsx
const ref = useRef<HTMLDivElement>(null)
const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

function onPointerMove(e: React.PointerEvent) {
  const rect = ref.current!.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width - 0.5
  const py = (e.clientY - rect.top) / rect.height - 0.5
  ry.set(px * 8)   // max 8deg
  rx.set(-py * 6)  // max 6deg
}
function onPointerLeave() { rx.set(0); ry.set(0) }
```
Apply to the card root: `<motion.div ref={ref} style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>`. Gate behind `window.matchMedia('(hover: hover)').matches` (don't bind on touch). Note: `MotionConfig reducedMotion="user"` (doc 02 task 2) does NOT cover raw motion values — also call `useReducedMotion()` from framer-motion and skip the handlers when true.

### 4b. Terminal window depth

**File:** `components/terminal/Terminal.tsx`. Wrap the terminal container in a perspective parent (`style={{ perspective: 1000 }}`) and give the terminal a resting tilt that flattens on hover: initial `rotateX: 2` (degrees), `whileHover={{ rotateX: 0 }}` with the shared spring transition. Subtle — the terminal should feel like a physical object on a desk.

### 4c. Cursor ↔ 3D handshake

**File:** `components/ui/CustomCursor.tsx` (post doc 02 fixes). When hovering any element with `data-cursor="3d"` (add this attribute to the hero scene holder and projects backdrop), the cursor ring shifts to `#4ade80` and scale 1.2 — a wink that the surface is alive. Implement in the existing `pointerover` classifier: `target.closest('[data-cursor="3d"]')`.

---

## Performance budget & verification (hard requirements)

| Metric | Budget | How to check |
|---|---|---|
| Base JS (pages without 3D: blog, experience, terminal) | unchanged from before this doc | `ANALYZE=true bun run build` (bundle-analyzer is configured in `next.config.js`) — three.js must appear ONLY in async chunks |
| Home LCP (mobile, throttled) | no regression > 100ms | Lighthouse before/after; scenes mount after idle so the LCP element (hero text/avatar) must not change |
| GPU when tab hidden / scene offscreen | 0 renders/sec | DevTools performance monitor; the `frameloop='never'` path |
| Frame rate, mid-tier phone | ≥ 45fps sustained on home & projects | real device or DevTools CPU 4× throttle |
| Reduced motion | zero canvases mounted | toggle OS setting, reload, `document.querySelector('canvas') === null` |

Also verify: a WebGL-blocked browser (Firefox `webgl.disabled=true`) renders every page normally with no console errors; both themes look intentional (light mode: scenes at reduced opacity, never washing out text).

## Suggested commit sequence

1. `feat(3d): scene infrastructure (SceneWrapper, AfterIdle, lazy loaders)` — with deps.
2. `feat(3d): hero event-stream scene`
3. `feat(3d): projects service-graph backdrop`
4. `feat(3d): 404 lost-packet scene`
5. `feat(3d): css tilt + terminal depth + cursor handshake`
6. `perf(3d): budgets verified` — put before/after Lighthouse numbers in the commit body.
