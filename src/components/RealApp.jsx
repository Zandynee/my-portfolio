import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useMotionValue, useTransform, animate } from 'framer-motion'
import LightGlare from './LightGlare'
import RoadDisplayPanel from './RoadDisplayPanel'
import RainOverlay from './RainOverlay'

const SLIDE_POSITIONS = [0, -33.33, -66.66]

// Hysteresis thresholds — wider gap forces real scroll commitment per stage.
// ADVANCE[i] = how far you must scroll past stage i to enter stage i+1.
// RETREAT[i] = how far back you must scroll to return from stage i+1 to stage i.
const ADVANCE = [0.90,0.75]
const RETREAT = [0.28, 0.62]

const SLIDE_LABELS = ['01', '02', '03']

export default function RealApp() {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: targetRef })

  const xPercent   = useMotionValue(0)
  const x          = useTransform(xPercent, v => `${v}%`)
  const currentSlide = useRef(0)
  const [activeSlide, setActiveSlide] = useState(0)

  // ── Programmatic nav (from buttons or scroll) ──────────────────
  function goToSlide(index) {
    if (index === currentSlide.current) return
    currentSlide.current = index
    setActiveSlide(index)
    animate(xPercent, SLIDE_POSITIONS[index], {
      type: 'tween',
      ease: [0.87, 0, 0.13, 1],   // expo ease-in-out
      duration: 0.85,
    })
  }

  // ── Scroll listener — only advances one slide at a time ────────
  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      const slide = currentSlide.current
      let target  = slide

      if (slide < 2 && v > ADVANCE[slide])       target = slide + 1
      else if (slide > 0 && v < RETREAT[slide - 1]) target = slide - 1

      if (target !== slide) goToSlide(target)
    })
  }, [xPercent, scrollYProgress])

  return (
    // h-[500vh] — 5× the viewport gives each stage ~133vh of physical
    // scroll distance, making it very hard to accidentally skip a slide.
    <section ref={targetRef} className="relative h-[101vh]">

      {/* ─── STICKY VIEWPORT ─────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-950">

        {/* ── LAYER 0: Dot-matrix panel ── */}
        <div className="absolute inset-0 z-0 pointer-events-none" />

        {/* ── NAV: vertical dot pills, right edge ── */}
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
          style={{ x }}
          className="flex w-[300vw] h-full flex-row relative z-10"
        >

          {/* SLIDE 1 */}
          <div className="relative w-screen h-full flex-shrink-0 overflow-hidden">
            <RainOverlay />
            <LightGlare />
            <RoadDisplayPanel />
            {/* <YourScreenOne /> */}
          </div>

          {/* SLIDE 2 */}
          <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-blue-700">
            {/* <RainOverlay />
            <LightGlare /> */}ajdasdoj
            {/* <YourScreenTwo /> */}
          </div>

          {/* SLIDE 3 */}
          <div className="relative w-screen h-full flex-shrink-0 overflow-hidden bg-green-500">
            {/* <RainOverlay />
            <LightGlare /> */}q0ekdk=q0wkdq=w0d0k
            {/* <YourScreenThree /> */}
          </div>

        </motion.div>
      </div>
    </section>
  )
}