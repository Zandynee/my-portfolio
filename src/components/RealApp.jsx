import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LightGlare from './LightGlare'
import RoadDisplayPanel from './RoadDisplayPanel'
import RainOverlay from './RainOverlay'
import TransitionWipe from './TransitionWipe'

const SLIDE_LABELS = ['01', '02', '03']
const TOTAL_SLIDES = SLIDE_LABELS.length

// 1. Array maps directly to the DESTINATION slide indexes:
// Index 0 (Slide 1) -> Amber
// Index 1 (Slide 2) -> Blue
// Index 2 (Slide 3) -> Purple
const WIPE_COLORS = ['amber', 'blue', 'purple']

export default function RealApp() {
  const [activeSlide, setActiveSlide] = useState(0)
  
  // This ref acts as our "cooldown" lock to prevent double-scrolling
  const isAnimating = useRef(false)

  function goToSlide(index) {
    if (index === activeSlide || isAnimating.current) return

    isAnimating.current = true
    
    // This immediately tells the TransitionWipe what the destination slide is!
    setActiveSlide(index)

    // Lock the scroll listener for the duration of the animation
    setTimeout(() => {
      isAnimating.current = false
    }, 1800) 
  }

  // ── Wheel Event Listener ───────────────────────────────────────
  const handleWheel = (e) => {
    if (isAnimating.current) return

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
    <section 
      className="relative h-screen w-full overflow-hidden bg-neutral-950"
      onWheel={handleWheel}
    >
      {/* ── THE TRANSITION WIPE ── */}
      {/* Uses the destination index to pick the correct color from the array */}
      <TransitionWipe 
        activeSlide={activeSlide} 
        color={WIPE_COLORS[activeSlide]} 
      />

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
      <motion.div
        animate={{ x: `-${activeSlide * 100}vw` }}
        // HIDE THE SLIDE CHANGE: Wait 0.6s while the wipe blocks the screen, 
        // then snap to the new slide instantly behind it.
        transition={{ delay: 0.6, duration: 0 }}
        className="flex w-[300vw] h-full flex-row relative z-10"
      >
        {/* SLIDE 1 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden">
          <RainOverlay />
          <LightGlare />
          <RoadDisplayPanel />
        </div>

        {/* SLIDE 2 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-neutral-900 flex items-center justify-center">
          <h1 className="text-white text-5xl font-bold tracking-widest opacity-50">SCREEN 02</h1>
        </div>

        {/* SLIDE 3 */}
        <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-neutral-800 flex items-center justify-center">
           <h1 className="text-white text-5xl font-bold tracking-widest opacity-50">SCREEN 03</h1>
        </div>

      </motion.div>
    </section>
  )
}