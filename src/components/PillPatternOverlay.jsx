import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

// ─── Config ──────────────────────────────────────────────────────────────────

const SHAPE_COUNT   = 9
const COLOR_OPTIONS = ['url(#grad-yellow-rose)', 'url(#grad-green-blue)', 'url(#grad-pink-purple)']

// Generated ONCE at module load — never regenerated on re-renders.
const CONFIGS = Array.from({ length: SHAPE_COUNT }, (_, i) => {
  let x, y, inMiddle = true
  while (inMiddle) {
    x = Math.random() * 110 - 5
    y = Math.random() * 110 - 5
    inMiddle = x > 25 && x < 75 && y > 25 && y < 75
  }

  const sweepValue = (100 - x) + y

  return {
    id:           i,
    x:            `${x}vw`,
    y:            `${y}vh`,
    size:         `${Math.random() * 32 + 4}vmax`,
    isFilled:     Math.random() > 0.5,
    baseOpacity:  Math.random() * 0.20 + 0.60,
    color:        COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    duration:     Math.random() * 1 + 2.5,
    initialDelay: sweepValue * 0.05,
    repeatDelay:  Math.random() * 5 + 3,
  }
})

// ─── Component ───────────────────────────────────────────────────────────────
//
// Zero React state. Zero re-renders after mount.
// GSAP timelines with repeat: -1 + repeatDelay loop entirely inside GSAP's
// own engine — no setState, no React reconciliation per cycle.
//
// SVG pathLength (framer-motion) → strokeDasharray / strokeDashoffset (GSAP).
// getTotalLength() on the <rect> gives us the exact perimeter so we can
// drive the dash manually without the DrawSVG premium plugin.
//
// Keyframe mapping from the original framer-motion times: [0, 0.15, 0.85, 1]:
//   Phase 1 (0 → 15%):  draw stroke, fade in
//   Phase 2 (15 → 85%): hold stroke, reveal fill
//   Phase 3 (85 → 100%): erase stroke, fade out

export default function PillPatternOverlay() {
  const pillRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      pillRefs.current.forEach((el, i) => {
        if (!el) return

        const c = CONFIGS[i]
        const totalLength = el.getTotalLength()

        // Set the initial (invisible, fully-dashed-out) state immediately
        gsap.set(el, {
          strokeDasharray:  totalLength,
          strokeDashoffset: totalLength,
          opacity:          0,
          fillOpacity:      0,
        })

        const dur = c.duration

        gsap.timeline({
          delay:       c.initialDelay,
          repeat:      -1,
          repeatDelay: c.repeatDelay,
        })
        // Phase 1: draw the stroke outline + fade in
        .to(el, {
          strokeDashoffset: 0,
          opacity:          c.baseOpacity,
          duration:         dur * 0.15,
          ease:             'power1.inOut',
        })
        // Phase 2: hold stroke, optionally fill the shape
        .to(el, {
          fillOpacity: c.isFilled ? 1 : 0,
          duration:    dur * 0.70,
          ease:        'none',
        })
        // Phase 3: erase stroke, fade out
        .to(el, {
          strokeDashoffset: totalLength,
          fillOpacity:      0,
          opacity:          0,
          duration:         dur * 0.15,
          ease:             'power1.inOut',
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="grad-yellow-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fde047" />
            <stop offset="50%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="grad-green-blue" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4ade80" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="grad-pink-purple" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f472b6" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>

      {CONFIGS.map((c, i) => (
        <div
          key={c.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: c.x, top: c.y, width: c.size }}
        >
          <svg
            viewBox="0 0 2277 2277"
            fill="none"
            overflow="visible"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <rect
              ref={(el) => { pillRefs.current[i] = el }}
              x="-157.627" y="1835"
              width="2818" height="848" rx="424"
              transform="rotate(-45 -157.627 1835)"
              stroke={c.color}
              strokeWidth="36"
              fill={c.color}
            />
          </svg>
        </div>
      ))}
    </div>
  )
}