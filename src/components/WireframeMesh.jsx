// WireframeMesh.jsx
// Requires: npm install d3-delaunay
// gsap is already in your project — no extra install needed.
import { useRef, useEffect } from 'react'
import { Delaunay } from 'd3-delaunay'
import gsap from 'gsap'

// ─── Tune these ──────────────────────────────────────────────────────────────
const COUNT          = 80    // number of mesh vertices
const REPEL_RADIUS   = 400   // cursor influence zone (px)
const REPEL_FORCE    = 1     // push strength
const SPRING_K       = 0.004 // restoring force — lower = looser, freer roaming
const DAMPING        = 0.94  // velocity falloff per frame — higher = glides longer
const MAX_SPEED      = 0.5    // px/frame velocity clamp, keeps the looser spring stable
const RETARGET_CHANCE = 0.0015 // per-point, per-frame odds of wandering to a new home
const ROAM_MARGIN    = 160   // how far past the screen edge a new home can land (px)
const FADE_MARGIN    = 90    // px beyond the screen edge over which points fade out & de-render

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
      driftR: 30 + Math.random() * 60, // ambient drift radius — wider, freer orbits
      edgeA:  1, // 1 = fully visible, fades to 0 once past FADE_MARGIN off-screen
    }
  })
}

// 1 while inside the canvas, fades linearly to 0 over FADE_MARGIN px past the edge
function edgeAlpha(x, y, W, H) {
  const dx = x < 0 ? -x : x > W ? x - W : 0
  const dy = y < 0 ? -y : y > H ? y - H : 0
  const d  = Math.max(dx, dy)
  return d <= 0 ? 1 : Math.max(0, 1 - d / FADE_MARGIN)
}

export default function WireframeMesh() {
  const canvasRef = useRef(null)
  // Single ref keeps the ticker closure always reading fresh values
  const stateRef  = useRef({ points: [], mouse: { x: -9999, y: -9999 }, W: 0, H: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
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
    // `time` is total elapsed seconds — used for the ambient sinusoidal drift.
    const tick = (time) => {
      const { points, mouse, W, H } = stateRef.current

      // Physics
      for (const p of points) {
        // Occasionally wander to a brand-new home, anywhere on (or just past) the
        // screen — this is what gives the mesh its free, non-repeating roam instead
        // of each point just orbiting a fixed spot.
        if (Math.random() < RETARGET_CHANCE) {
          p.homeX = -ROAM_MARGIN + Math.random() * (W + ROAM_MARGIN * 2)
          p.homeY = -ROAM_MARGIN + Math.random() * (H + ROAM_MARGIN * 2)
        }

        // Slow sinusoidal orbit around each point's home position
        const driftX = p.homeX + Math.sin(time * 0.38 + p.phase) * p.driftR
        const driftY = p.homeY + Math.cos(time * 0.28 + p.phase * 1.4) * p.driftR * 0.65

        // Cursor repulsion
        const dx   = p.x - mouse.x
        const dy   = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && dist > 0) {
          const f = ((REPEL_RADIUS - dist) / REPEL_RADIUS) ** 1.5
          p.vx += (dx / dist) * f * REPEL_FORCE
          p.vy += (dy / dist) * f * REPEL_FORCE
        }

        // Spring back toward drift target
        p.vx += (driftX - p.x) * SPRING_K
        p.vy += (driftY - p.y) * SPRING_K
        p.vx *= DAMPING
        p.vy *= DAMPING

        // Clamp speed so the looser spring/damping can't run away
        const speed = Math.hypot(p.vx, p.vy)
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED
          p.vy = (p.vy / speed) * MAX_SPEED
        }

        p.x += p.vx
        p.y += p.vy

        // How visible this point is right now — 0 once it's wandered far enough
        // off-screen, which is what drives the de-render/fade below.
        p.edgeA = edgeAlpha(p.x, p.y, W, H)
      }

      // ── Render ─────────────────────────────────────────────────────────────
      // Apply DPR transform once so every draw call works in CSS px space
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const { triangles } = Delaunay.from(points, p => p.x, p => p.y)

      // Draw triangles
      for (let i = 0; i < triangles.length; i += 3) {
        const a = points[triangles[i]]
        const b = points[triangles[i + 1]]
        const c = points[triangles[i + 2]]

        // Combined visibility of the triangle — fully de-rendered once any
        // vertex is past the fade margin, so nothing draws outside the frame.
        const triA = Math.min(a.edgeA, b.edgeA, c.edgeA)
        if (triA <= 0) continue

        // Centroid → proximity glow 0–1
        const cx = (a.x + b.x + c.x) / 3
        const cy = (a.y + b.y + c.y) / 3
        const g  = Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / 260)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.closePath()

        // Fill: Subtly increases in opacity but remains blue
        ctx.fillStyle = `rgba(30, 100, 255, ${+(0.01 + g * 0.08).toFixed(3) * triA})`
        ctx.fill()

        // Stroke: Light blue (low opacity) → Vibrant blue (high opacity) near cursor
        const rVal = (150 - g * 120) | 0 // transitions 150 -> 30
        const gVal = (200 - g * 100) | 0 // transitions 200 -> 100
        const alpha = +(0.5 + g * 0.8).toFixed(3) * triA // 0.1 -> 0.9, faded near edges
        ctx.strokeStyle = `rgba(${rVal}, ${gVal}, 255, ${alpha})`
        ctx.lineWidth   = 0.5 + g * 1.2
        ctx.stroke()
      }

      // Draw vertex dots / stars
      for (const p of points) {
        if (p.edgeA <= 0) continue // fully off-screen — de-rendered

        const g = Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / 190)
        const r = 1.2 + g * 14.5

        // Fill: Light blue -> solid bright blue, faded out near the screen edge
        const dotAlpha = +(0.2 + g * 0.8).toFixed(3) * p.edgeA
        ctx.fillStyle = `rgba(100, 180, 255, ${dotAlpha})`

        // Interaction threshold: Become a star if hovered (g > 0.2)
        if (g > 0.2) {
          // Draw a star with 5 spikes, outer radius scaling with r
          drawStar(ctx, p.x, p.y, 5, r * 2.5, r)
          ctx.fill()
        } else {
          // Default circle
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        // Bloom ring on points near the cursor (also strictly blue now)
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
        background:    '#ffffff',
        zIndex:        1,
        pointerEvents: 'none',
      }}
    />
  )
}