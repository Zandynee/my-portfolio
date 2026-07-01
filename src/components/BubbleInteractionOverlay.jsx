import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

const COLOR_OPTIONS = [
  'url(#grad-yellow-rose)',
  'url(#grad-green-blue)',
  'url(#grad-pink-purple)',
]

const MAX_BUBBLES = 12
const MOVE_SPAWN_MIN_INTERVAL_MS = 20 // minimum time between move-triggered bubbles
const MOVE_SPAWN_MIN_DISTANCE   = 48   // minimum pointer travel (px) before another bubble spawns
let uid = 0

function makeBubble(isClick, x, y) {
  return {
    id: uid++,
    x, y,
    size:        isClick ? Math.random() * 40 + 40 : Math.random() * 20 + 10,
    color:       COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    strokeWidth: isClick ? 6 : 2,
    duration:    isClick ? 0.7 : 0.5,
  }
}

// Individual bubble circle — runs its own GSAP timeline on mount and
// fires onRemove via onComplete, matching the original onAnimationComplete pattern.
function BubbleCircle({ b, onRemove }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const perimeter = 2 * Math.PI * b.size

    gsap.set(el, {
      strokeDasharray: perimeter,
      strokeDashoffset: perimeter,
      opacity: 0,
      scale: 0.8,
      // svgOrigin keeps scale anchored to the circle's own centre in SVG space
      svgOrigin: `${b.x} ${b.y}`,
    })

    // times: [0, 0.3, 1]
    // pathLength: [0, 1, 1], opacity: [0, 0.9, 0], scale: [0.8, 1, 1.1]
    const tl = gsap.timeline({ onComplete: () => onRemove(b.id) })
    tl
      .to(el, {
        strokeDashoffset: 0,
        opacity: 0.9,
        scale: 1,
        duration: b.duration * 0.3,
        ease: 'power1.inOut',
      })
      .to(el, {
        opacity: 0,
        scale: 1.1,
        duration: b.duration * 0.7,
        ease: 'power1.inOut',
      })

    return () => tl.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <circle
      ref={ref}
      cx={b.x}
      cy={b.y}
      r={b.size}
      fill="none"
      stroke={b.color}
      strokeWidth={b.strokeWidth}
    />
  )
}

export default function BubbleInteractionOverlay() {
  const overlayRef    = useRef(null)
  const isClickingRef = useRef(false)   // ref, not state — no re-renders, no listener churn
  const rafRef        = useRef(null)
  const latestMoveRef = useRef(null)    // always holds the freshest pointer position
  const lastSpawnAtRef  = useRef(0)     // timestamp of the last move-triggered spawn
  const lastSpawnPosRef = useRef(null)  // position of the last move-triggered spawn
  const [bubbles, setBubbles] = useState([])

  // Stable across renders — no useCallback deps needed because everything
  // touches refs or the stable setBubbles setter.
  const spawnBubble = useCallback((clientX, clientY, isClick) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect) return
    const bubble = makeBubble(isClick, clientX - rect.left, clientY - rect.top)
    setBubbles(prev => {
      const trimmed = prev.length >= MAX_BUBBLES ? prev.slice(1) : prev
      return [...trimmed, bubble]
    })
  }, [])

  const removeBubble = useCallback((id) => {
    setBubbles(prev => prev.filter(b => b.id !== id))
  }, [])

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return

    const onDown = (e) => {
      isClickingRef.current = true
      spawnBubble(e.clientX, e.clientY, true)
    }

    const onUp = () => { isClickingRef.current = false }

    const onMove = (e) => {
      if (isClickingRef.current) return
      // Store freshest position; only one rAF scheduled per frame
      latestMoveRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const pos = latestMoveRef.current
        if (pos && !isClickingRef.current) {
          const now = performance.now()
          const last = lastSpawnPosRef.current
          const dist = last ? Math.hypot(pos.x - last.x, pos.y - last.y) : Infinity
          const elapsed = now - lastSpawnAtRef.current

          if (elapsed >= MOVE_SPAWN_MIN_INTERVAL_MS && dist >= MOVE_SPAWN_MIN_DISTANCE) {
            spawnBubble(pos.x, pos.y, false)
            lastSpawnAtRef.current = now
            lastSpawnPosRef.current = pos
          }
          latestMoveRef.current = null
        }
        rafRef.current = null
      })
    }

    el.addEventListener('pointerdown',   onDown)
    el.addEventListener('pointerup',     onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointermove',   onMove, { passive: true })

    return () => {
      el.removeEventListener('pointerdown',   onDown)
      el.removeEventListener('pointerup',     onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointermove',   onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [spawnBubble]) // spawnBubble is stable (empty useCallback deps)

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 overflow-hidden touch-none pointer-events-auto bg-transparent"
    >
      <svg width="0" height="0" className="absolute top-0 left-0 pointer-events-none">
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

      {/*
        Each BubbleCircle manages its own GSAP timeline and self-removes
        via onComplete — matching the original onAnimationComplete pattern
        without AnimatePresence overhead.
      */}
      <svg className="w-full h-full pointer-events-none">
        {bubbles.map(b => (
          <BubbleCircle key={b.id} b={b} onRemove={removeBubble} />
        ))}
      </svg>
    </div>
  )
}