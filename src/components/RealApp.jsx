import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LightGlare from './LightGlare'
import RoadDisplayPanel from './RoadDisplayPanel'
import RainOverlay from './RainOverlay'

const SLIDE_LABELS = ['01', '02', '03']
const TOTAL_SLIDES = SLIDE_LABELS.length

export default function RealApp() {
  const [activeSlide, setActiveSlide] = useState(0)
  
  // This ref acts as our "cooldown" lock to prevent double-scrolling
  const isAnimating = useRef(false)

  function goToSlide(index) {
    if (index === activeSlide || isAnimating.current) return

    isAnimating.current = true
    setActiveSlide(index)

    // Lock the scroll listener for the duration of the animation (850ms) 
    // plus a tiny buffer to allow the user's trackpad inertia to settle.
    setTimeout(() => {
      isAnimating.current = false
    }, 1000) 
  }

  // ── Wheel Event Listener ───────────────────────────────────────
  const handleWheel = (e) => {
    // 1. If we are currently animating, ignore all scroll events
    if (isAnimating.current) return

    // 2. Set a small threshold to ignore tiny, accidental trackpad jitters
    const scrollThreshold = 30 

    if (e.deltaY > scrollThreshold) {
      // Scrolled down -> Go to next
      if (activeSlide < TOTAL_SLIDES - 1) goToSlide(activeSlide + 1)
    } else if (e.deltaY < -scrollThreshold) {
      // Scrolled up -> Go to previous
      if (activeSlide > 0) goToSlide(activeSlide - 1)
    }
  }

  return (
    // We no longer need a massive height. Just exactly one screen size.
    <section 
      className="relative h-screen w-full overflow-hidden bg-neutral-950"
      onWheel={handleWheel}
    >
      {/* ── LAYER 0: Dot-matrix panel ── */}
      <div className="absolute inset-0 z-0 pointer-events-none" />

      {/* ── NAV: vertical dot pills ── */}
      <nav className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${label}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className={`
                rounded-full transition-all duration-500
                ${activeSlide === i
                  ? 'w-2 h-6 bg-amber-400'
                  : 'w-2 h-2 bg-white/25 group-hover:bg-white/50'}
              `}
            />
            <span
              className={`
                text-[9px] font-mono tracking-widest transition-opacity duration-300
                ${activeSlide === i ? 'opacity-60 text-amber-400' : 'opacity-0'}
              `}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── LAYER 1: Horizontal slide track ── */}
      {/* Notice how much cleaner this is. Framer Motion handles the x position declaratively based purely on the activeSlide state. */}
      <motion.div
        animate={{ x: `-${activeSlide * 100}vw` }}
        transition={{ type: 'tween', ease: [0.87, 0, 0.13, 1], duration: 0.85 }}
        className="flex w-[300vw] h-full flex-row relative z-10"
      >
        {/* SLIDE 1 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden">
          <RainOverlay />
          <LightGlare />
          <RoadDisplayPanel />
        </div>

        {/* SLIDE 2 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-blue-700">
          {/* YourScreenTwo */}
        </div>

        {/* SLIDE 3 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-green-500">
           {/* YourScreenThree */}
        </div>

      </motion.div>
    </section>
  )
}