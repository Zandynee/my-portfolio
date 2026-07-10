// WireframeMesh.jsx
// Requires: npm install d3-delaunay
import { useRef, useEffect } from 'react'
import { Delaunay } from 'd3-delaunay'
import gsap from 'gsap'

// ─── Tune these (Calmer & Denser Settings) ───────────────────────────────────
const COUNT            = 50    // number of mesh vertices (increased for density)
const MAX_LINE_LENGTH  = 250   // Max distance in px for a line to be drawn
const EDGE_FADE_MARGIN = 60    // px range over which triangles smoothly fade in/out
const REPEL_RADIUS     = 400   // cursor influence zone (px)
const REPEL_FORCE      = 0.5   // push strength (halved for calmer interaction)
const SPRING_K         = 0.002 // restoring force (lower = looser)
const DAMPING          = 0.90  // velocity falloff (more friction)
const MAX_SPEED        = 0.15  // px/frame velocity clamp (drastically slowed)
const RETARGET_CHANCE  = 0.0005// very rare odds of wandering to a new home
const ROAM_MARGIN      = 160   // how far past the screen edge a new home can land (px)
const FADE_MARGIN      = 90    // px beyond the screen edge over which points fade out

// ─── OPTIMIZATION: Pre-compute color strings to eliminate GC pressure ────────
const STROKE_COLORS = Array.from({ length: 101 }, (_, i) => {
  const alpha = (i / 100).toFixed(2)
  return `rgba(150, 200, 255, ${alpha})`
})

// ─── Helper: Draw Star ───────────────────────────────────────────────────────
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
}

function createPoints(W, H) {
  return Array.from({ length: COUNT }, () => {
    const x = Math.random() * W
    const y = Math.random() * H
    return {
      x, y,
      homeX: x, homeY: y,
      vx: 0, vy: 0,
      phase:  Math.random() * Math.PI * 2,
      driftR: 30 + Math.random() * 60,
      edgeA:  1,
    }
  })
}

function edgeAlpha(x, y, W, H) {
  const dx = x < 0 ? -x : x > W ? x - W : 0
  const dy = y < 0 ? -y : y > H ? y - H : 0
  const d  = Math.max(dx, dy)
  return d <= 0 ? 1 : Math.max(0, 1 - d / FADE_MARGIN)
}

export default function WireframeMesh({ active = true }) {
  const canvasRef = useRef(null)

  const stateRef = useRef({ 
    points: [], 
    mouse: { x: -9999, y: -9999 }, 
    W: 0, 
    H: 0,
    frameCount: 0,
    cachedTriangles: new Uint32Array(0) 
  })

  // PERF: RealApp keeps this component *mounted* one slide before/after it's
  // actually visible (to pre-warm it for the wipe transition), which used to
  // mean the full physics + Delaunay + canvas redraw ran every frame even
  // while completely off-screen. `active` lets it stay mounted (so it's warm
  // and instant when it does become visible) while skipping all the actual
  // work until then.
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d', { alpha: true })
    const dpr    = window.devicePixelRatio || 1

    // ── Sizing ──────────────────────────────────────────────────────────────
    const resize = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      canvas.width        = W * dpr
      canvas.height       = H * dpr
      canvas.style.width  = `${W}px`
      canvas.style.height = `${H}px`
      Object.assign(stateRef.current, { W, H, points: createPoints(W, H) })
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Mouse ────────────────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      stateRef.current.mouse = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── GSAP ticker ──────────────────────────────────────────────────────────
    const tick = (time) => {
      if (!activeRef.current) return

      const state = stateRef.current
      const { points, mouse, W, H } = state
      
      state.frameCount++

      // Physics Loop
      for (const p of points) {
        if (Math.random() < RETARGET_CHANCE) {
          p.homeX = -ROAM_MARGIN + Math.random() * (W + ROAM_MARGIN * 2)
          p.homeY = -ROAM_MARGIN + Math.random() * (H + ROAM_MARGIN * 2)
        }

        const driftX = p.homeX + Math.sin(time * 0.15 + p.phase) * p.driftR
        const driftY = p.homeY + Math.cos(time * 0.1 + p.phase * 1.4) * p.driftR * 0.65

        const dx   = p.x - mouse.x
        const dy   = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && dist > 0) {
          const f = ((REPEL_RADIUS - dist) / REPEL_RADIUS) ** 1.5
          p.vx += (dx / dist) * f * REPEL_FORCE
          p.vy += (dy / dist) * f * REPEL_FORCE
        }

        p.vx += (driftX - p.x) * SPRING_K
        p.vy += (driftY - p.y) * SPRING_K
        p.vx *= DAMPING
        p.vy *= DAMPING

        const speed = Math.hypot(p.vx, p.vy)
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED
          p.vy = (p.vy / speed) * MAX_SPEED
        }

        p.x += p.vx
        p.y += p.vy

        p.edgeA = edgeAlpha(p.x, p.y, W, H)
      }

      // ── Render ─────────────────────────────────────────────────────────────
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      if (state.frameCount % 3 === 0) {
        state.cachedTriangles = Delaunay.from(points, p => p.x, p => p.y).triangles
      }
      
      const triangles = state.cachedTriangles

      // Draw triangles
      for (let i = 0; i < triangles.length; i += 3) {
        const a = points[triangles[i]]
        const b = points[triangles[i + 1]]
        const c = points[triangles[i + 2]]

        const triA = Math.min(a.edgeA, b.edgeA, c.edgeA)
        if (triA <= 0) continue

        const distAB = Math.hypot(a.x - b.x, a.y - b.y)
        const distBC = Math.hypot(b.x - c.x, b.y - c.y)
        const distCA = Math.hypot(c.x - a.x, c.y - a.y)
        
        // Find the longest edge of the triangle
        const maxEdge = Math.max(distAB, distBC, distCA)

        // Hard cull if the longest edge exceeds the absolute max length
        if (maxEdge > MAX_LINE_LENGTH) {
          continue
        }

        // SMOOTH FORMATION LOGIC: Calculate a fade multiplier (0 to 1) 
        // based on how close the longest edge is to breaking.
        let formationAlpha = 1
        const fadeThreshold = MAX_LINE_LENGTH - EDGE_FADE_MARGIN
        if (maxEdge > fadeThreshold) {
          formationAlpha = (MAX_LINE_LENGTH - maxEdge) / EDGE_FADE_MARGIN
        }

        const cx = (a.x + b.x + c.x) / 3
        const cy = (a.y + b.y + c.y) / 3
        const g  = Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / 260)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.closePath()

        // Apply formationAlpha to the Fill
        const fillOpacity = +(0.01 + g * 0.08).toFixed(3) * triA * formationAlpha
        ctx.fillStyle = `rgba(30, 100, 255, ${fillOpacity})`
        ctx.fill()

        // Apply formationAlpha to the Stroke
        const rawAlpha = (0.1 + g * 0.8) * triA * formationAlpha
        const alphaIndex = Math.min(100, Math.max(0, Math.round(rawAlpha * 100)))
        
        ctx.strokeStyle = STROKE_COLORS[alphaIndex]
        ctx.lineWidth   = 0.5 + g * 1.2
        ctx.stroke()
      }

      // Draw vertex dots / stars
      for (const p of points) {
        if (p.edgeA <= 0) continue 

        const g = Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / 190)
        const r = 1.2 + g * 5

        const dotAlpha = +(0.2 + g * 0.8).toFixed(3) * p.edgeA
        ctx.fillStyle = `rgba(100, 180, 255, ${dotAlpha})`

        if (g > 0.2) {
          drawStar(ctx, p.x, p.y, 5, r * 2.5, r)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        if (g > 0.4) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(100, 180, 255, ${+(g * 0.4).toFixed(3) * p.edgeA})`
          ctx.lineWidth   = 0.5
          ctx.stroke()
        }
      }
    }

    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        inset:         0,
        display:       'block',
        background:    'transparent',
        zIndex:        1,
        pointerEvents: 'none',
      }}
    />
  )
}