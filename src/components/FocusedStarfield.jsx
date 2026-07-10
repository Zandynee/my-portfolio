import React, { useEffect, useRef } from 'react'

// PERF REWRITE: the original mounted 500 individual <div>s, each running its
// own CSS `animate-pulse` keyframe loop, absolutely positioned and nested
// inside a rotated/scaled parent. 500 independently-animating DOM nodes is a
// lot of style/paint bookkeeping for the browser to carry every frame,
// especially stacked alongside the other overlays on this slide.
//
// This draws the exact same distribution (Gaussian cluster around the
// center "nebula line" + a scattering of stray stars) onto one <canvas>
// instead. Twinkle is done with a cheap per-star sine offset, and the loop
// is throttled to ~20fps since a twinkle doesn't need 60fps to read as
// smooth — it just needs to not be static.

const TOTAL_STARS = 500
const TWINKLE_FPS = 20

function generateStars(W, H) {
  const stars = []
  for (let i = 0; i < TOTAL_STARS; i++) {
    let yPct

    // 75% of stars cluster tightly around the center nebula line
    if (Math.random() > 0.25) {
      const u = Math.random()
      const v = Math.random()
      const gaussianWeight = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
      yPct = 50 + gaussianWeight * 12
    } else {
      // The other 25% scatter evenly everywhere to fill the empty edges
      yPct = Math.random() * 100
    }
    yPct = Math.max(0, Math.min(100, yPct))

    stars.push({
      x: Math.random() * W,
      y: (yPct / 100) * H,
      size: Math.random() * 2.5 + 0.5,
      baseOpacity: Math.random() * 0.8 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 1 / (Math.random() * 8 + 5), // matches old 5-13s pulse cycle
    })
  }
  return stars
}

export default function FocusedStarfield({ active = true }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: true })
    const dpr = window.devicePixelRatio || 1

    let stars = []
    let W = 0
    let H = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = generateStars(W, H)
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId
    let lastDraw = 0
    const frameInterval = 1000 / TWINKLE_FPS

    const draw = (time) => {
      rafId = requestAnimationFrame(draw)
      if (!activeRef.current) return
      if (time - lastDraw < frameInterval) return
      lastDraw = time

      ctx.clearRect(0, 0, W, H)
      const t = time * 0.001
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed * Math.PI * 2 + s.phase)
        const opacity = s.baseOpacity * (0.4 + 0.6 * twinkle)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`
        ctx.fill()
      }
    }
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 pointer-events-none -rotate-12 scale-125"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}