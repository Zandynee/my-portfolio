import React, { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

/**
 * RainCanvas
 * ──────────
 * A single reusable "falling streak" layer used for both the rain slide
 * and the textile depth-line slide — same concept (angled streaks falling
 * with parallax depth), different palette/density/angle per use.
 *
 * Why this replaces the old SVG-pattern + oversized-rotated-wrapper approach:
 *  - The old version rotated a 150–200%-oversized wrapper div to hide seams,
 *    which is what caused streaks to render outside/misaligned with the
 *    visible frame on some viewport sizes.
 *  - Each drop here carries its own velocity vector (vx/vy), so the "rain
 *    angle" is baked into the motion itself. Nothing needs to be rotated or
 *    oversized — the canvas is exactly the size of its container.
 *  - Everything is drawn imperatively on a <canvas>, driven by a single
 *    gsap.ticker callback. There is no per-frame React state update and no
 *    re-render — React only re-renders this component when `active` flips.
 *  - The ticker is only attached while `active` is true, so an off-screen
 *    slide costs zero CPU/GPU — nothing paints, nothing loops.
 *  - Drops respawn individually with fresh randomized speed/length/opacity/
 *    x-position whenever they leave the frame, so the pattern never visibly
 *    "loops" the way a short SVG patternTransform (0.3–0.7s) did — it reads
 *    as real rain for as long as it runs.
 */

const rand = (min, max) => min + Math.random() * (max - min)

function makeDrop(w, h, rad, layer, layerIndex, fillScreen) {
  const speed = rand(layer.speedMin, layer.speedMax)
  return {
    x: rand(-0.15 * w, 1.15 * w),
    y: fillScreen ? rand(-h * 0.2, h) : -rand(0, h * 0.35),
    len: rand(layer.lenMin, layer.lenMax),
    vx: Math.sin(rad) * speed,
    vy: Math.cos(rad) * speed,
    width: layer.width,
    opacity: rand(layer.opacityMin, layer.opacityMax),
    color: layer.color,
    blur: layer.blur || 0,
    layerIndex,
  }
}

export default function RainCanvas({
  active = true,
  angle = 12, // degrees; positive leans right as drops fall
  layers,
  blendMode = 'screen',
  className = '',
  style,
}) {
  const canvasRef = useRef(null)
  const dropsRef = useRef([])
  const tickRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  // Stable layer config (avoid re-seeding every render if caller passes a
  // fresh array literal — callers should still ideally define layers
  // outside the render or via useMemo, this is just a safety net).
  const layersKey = useMemo(() => JSON.stringify(layers), [layers])

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const ctx = canvas.getContext('2d')
    const rad = (angle * Math.PI) / 180

    const seed = (w, h) => {
      const drops = []
      layers.forEach((layer, i) => {
        for (let n = 0; n < layer.count; n++) {
          drops.push(makeDrop(w, h, rad, layer, i, true))
        }
      })
      dropsRef.current = drops
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { w: rect.width, h: rect.height }
      canvas.width = Math.max(1, rect.width * dpr)
      canvas.height = Math.max(1, rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed(rect.width, rect.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    // GSAP's ticker callback signature is (time, deltaTime, frame, elapsed):
    // `time` is elapsed seconds since the ticker started, NOT performance.now().
    // Mixing that with a performance.now()-based `last` (ms) was the bug —
    // it produced a near-zero delta on every frame after the first, which
    // is why the rain looked frozen. `deltaTime` (already in ms) is the
    // correct value to drive per-frame movement.
    const tick = (time, deltaTimeMs) => {
      const { w, h } = sizeRef.current
      const dt = Math.max(0, Math.min(deltaTimeMs / 1000, 0.05))

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      const drops = dropsRef.current
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        d.x += d.vx * dt
        d.y += d.vy * dt

        // Recycle once it falls (or drifts) out of frame — reseeded with
        // fresh random speed/length/opacity so no two respawns match.
        if (d.y - d.len > h || d.x < -0.3 * w || d.x > 1.3 * w) {
          const layer = layers[d.layerIndex]
          const fresh = makeDrop(w, h, rad, layer, d.layerIndex, false)
          fresh.y = -rand(0, h * 0.25) - fresh.len
          Object.assign(d, fresh)
          continue
        }

        const tailX = d.x - Math.sin(rad) * d.len
        const tailY = d.y - Math.cos(rad) * d.len

        ctx.filter = d.blur ? `blur(${d.blur}px)` : 'none'
        ctx.strokeStyle = d.color
        ctx.globalAlpha = d.opacity
        ctx.lineWidth = d.width
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.filter = 'none'
    }

    tickRef.current = tick

    return () => {
      ro.disconnect()
      gsap.ticker.remove(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, layersKey])

  // Attach/detach the ticker purely based on `active`. This is the whole
  // "optimized, doesn't render every time" story: no RAF loop runs, no
  // canvas paints, and no React work happens while the slide is offscreen.
  useEffect(() => {
    const tick = tickRef.current
    if (!tick || !active) return
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, layersKey])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', mixBlendMode: blendMode, ...style }}
    />
  )
}