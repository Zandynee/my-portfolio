import React from 'react'
import { motion } from 'framer-motion'

// ─── Config ──────────────────────────────────────────────────────────────────

const SHAPE_COUNT   = 9
const COLOR_OPTIONS = ['url(#grad-yellow-rose)', 'url(#grad-green-blue)', 'url(#grad-pink-purple)']

// Generated ONCE at module load — never regenerated on re-renders.
// Previously each <AnimatedPill> held two useState hooks and called setState
// on every onAnimationComplete, causing 9 staggered re-renders indefinitely.
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
    // Active animation duration
    duration:     Math.random() * 1 + 2.5,
    // Staggered entry delay based on position sweep
    initialDelay: sweepValue * 0.05,
    // Pause between repeats (replaces the old renderKey/setState respawn cycle)
    repeatDelay:  Math.random() * 5 + 3,
  }
})

// ─── Component ───────────────────────────────────────────────────────────────
//
// Zero React state. Zero re-renders after mount.
// repeat: Infinity + repeatDelay keeps the loop entirely inside framer-motion's
// own animation engine — no JS setState, no React reconciliation per cycle.

export default function PillPatternOverlay() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
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

      {CONFIGS.map(c => (
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
            <motion.rect
              x="-157.627" y="1835"
              width="2818" height="848" rx="424"
              transform="rotate(-45 -157.627 1835)"
              stroke={c.color}
              strokeWidth="36"
              fill={c.color}
              initial={{ pathLength: 0, fillOpacity: 0, opacity: 0 }}
              animate={{
                pathLength:  [0, 1, 1, 0],
                opacity:     [0, c.baseOpacity, c.baseOpacity, 0],
                fillOpacity: c.isFilled ? [0, 0, 1, 0] : [0, 0, 0, 0],
              }}
              transition={{
                duration:    c.duration,
                delay:       c.initialDelay,
                ease:        'easeInOut',
                times:       [0, 0.15, 0.85, 1],
                repeat:      Infinity,   // framer-motion loops internally — no setState
                repeatDelay: c.repeatDelay,
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  )
}