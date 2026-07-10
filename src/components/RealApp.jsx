import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LightGlare from './LightGlare'
import TransitionWipe from './TransitionWipe'
import BlobBackground from './BlobBackground'
import PillPatternOverlay from './PillPatternOverlay'
import BubbleInteractionOverlay from './BubbleInteractionOverlay'
import CityscapeOverlay from './CityscapeOverlay'
import StarryNightOverlay from './ParallaxStarLayer'
import WireframeMesh from './WireframeMesh'
import FloatingStarsOverlay from './FloatingStarsOverlay'
import roadDisplaySign from '../assets/RoadDisplaySign.svg'
import NebulaLine from './NebulaLine'
import FocusedStarfield from './FocusedStarfield'
import RainCanvas from './RainCanvas'
import ParallaxWrapper from './ParallaxWrapper'
import { RAIN_LAYERS, TEXTILE_LAYERS } from './RainPresets'

const SLIDE_LABELS = ['01', '02', '03', '04']
const TOTAL_SLIDES = SLIDE_LABELS.length

// SWAPPED: Index 0 is now Blue (Portfolio), Index 1 is now Amber (Road)
const WIPE_COLORS = ['blue', 'amber', , 'purple']

// How many slides away from the active one still get their heavy overlays
// mounted. 0 = only the active slide is ever mounted (cheapest, but the
// wipe transition will "pop" the destination slide's animations in fresh
// rather than having them already warmed up). 1 keeps the active slide
// plus its immediate neighbors mounted, which is a good balance since the
// wipe already covers the screen during the switch.
const MOUNT_RADIUS = 1

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

  // Only slides within MOUNT_RADIUS of the active one get their overlay
  // effects mounted. Every effect component here (Blob/Pill/Bubble/
  // Cityscape/StarryNight/FloatingStars/WireframeMesh/LightGlare) starts
  // its GSAP timelines/tickers in a useEffect and kills them on cleanup —
  // so unmounting is what actually stops them from running off-screen.
  // This is the same trick RainCanvas already does internally via its
  // `active` prop; here we get the same effect for every other component
  // for free, without changing any of their internals or call signatures.
  const isMounted = (index) => Math.abs(index - activeSlide) <= MOUNT_RADIUS

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
        className="flex w-[400vw] h-full flex-row relative z-10"
      >
        {/* SLIDE 1 (Formerly Slide 2) */}
        <div className="relative w-screen h-full shrink-0 overflow-hidden bg-white flex items-center justify-center">
          {isMounted(0) && (
            <>
              <BlobBackground />
              <PillPatternOverlay />
              <BubbleInteractionOverlay />
            </>
          )}
          <h1 className="text-blue-500 text-[10vw] skew-x-3 font-bold tracking-widest opacity-80">PORTFOLIO</h1>
        </div>

        {/* SLIDE 2 (Formerly Slide 1) */}
        <div className="relative w-screen h-full shrink-0 overflow-hidden">
          {/*
            RAIN LAYER — rewritten again, this time off SVG tiling entirely.

            Old problem: an oversized (150%) wrapper div was rotated 15deg to
            hide pattern seams, and the SVG's own background-size tiling
            didn't always land inside that rotated box on every viewport —
            that's what caused streaks to render outside/misaligned with the
            visible frame.

            New approach: a single <canvas>, exactly the size of this slide
            (no oversizing, no rotation trick needed — each drop just carries
            its own angled velocity vector). It's driven by one GSAP ticker
            callback that mutates canvas pixels directly, so there's no
            per-frame React re-render. The ticker only runs while this is the
            active slide (`active={activeSlide === 1}`), so it costs nothing
            when scrolled away. Drops respawn individually with fresh random
            speed/length/opacity, so it never reads as a short repeating
            loop the way the old 0.35–0.7s SVG pattern loop did.
          */}
          <RainCanvas
            active={activeSlide === 1}
            angle={15}
            layers={RAIN_LAYERS}
            blendMode="screen"
            className="absolute inset-0 z-50 pointer-events-none"
          />
          {isMounted(1) && <LightGlare />}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center mix-blend-screen opacity-50">
            <img
              src={roadDisplaySign}
              alt=""
              draggable={false}
              className="w-full h-auto select-none"
            />
          </div>

        </div>

        {/* SLIDE 3 */}
        <div className="relative w-screen h-full shrink-0 overflow-hidden flex items-center justify-center">

          {/* LAYERS (z-0 to z-50) */}
          {isMounted(2) && (
            <>
              <div className="absolute inset-0 z-10">
                <StarryNightOverlay />
                <ParallaxWrapper maxRotation={6} scale={1.05} backgroundColor="transparent">
                   
                      <CityscapeOverlay />
                </ParallaxWrapper>
              </div>
             
           
            </>
          )}
          {/*
            TEXTILE DEPTH LINES — same rewrite as the rain layer above.
            The old version ran three perpetual Framer `animate={{y:[...]}}`
            loops (durations as short as 0.08s — that's what made it feel
            twitchy/misaligned) inside a 200%-oversized rotated wrapper.

            It's the same falling-streak concept as the rain layer, just a
            different palette/density/angle, so it reuses <RainCanvas />
            directly. Only ticks while Slide 3 is active
            (`active={activeSlide === 2}`).
          */}
          <RainCanvas
            active={activeSlide === 2}
            angle={-20}
            layers={TEXTILE_LAYERS}
            blendMode="screen"
            className="absolute inset-0 z-50 pointer-events-none"
          />

          {/* CONTENT (z-30 lifts text above the Cityscape) */}
          <h1 className="relative z-30 text-white text-5xl font-bold tracking-widest opacity-50">
            PORTFOLIO
          </h1>

          {/* FRONT BORDER OVERLAY (z-[60] forces it in front of the z-50 rain) */}
          {/* Adjust the border thickness (border-y-[40px]) and color as needed */}
          <div className="absolute inset-0 z-[60] pointer-events-none border-y-[40px] border-neutral-950" />

        </div>
        <div className="relative w-screen h-full shrink-0 overflow-hidden bg-[#111023] flex items-center justify-center">
          {isMounted(3) && (
        <>
              {/* 1. STATIC BACKGROUND (Deepest Layer)
                Stays perfectly flat in the deep background. 
              */}
             

              {/* 2. TILTED MIDGROUND (The Parallax Layer)
                Make sure backgroundColor is "transparent" so you can see the stars behind it!
                We wrap it in a z-10 absolute div so it stacks perfectly over the background.
              */}
              <div className="absolute inset-0 z-10">
                <ParallaxWrapper maxRotation={6} scale={1.10} backgroundColor="transparent">
                  <WireframeMesh active={activeSlide === 3} />
                  
                    <FloatingStarsOverlay active={activeSlide === 3} />
                </ParallaxWrapper>
              </div>
             
              {/* 3. STATIC FOREGROUND (Closest Layer)
                Stays perfectly flat, rendering over top of the tilted nebula.
                pointer-events-none ensures it doesn't block your mouse from moving the ParallaxWrapper.
              */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <NebulaLine />
                
                <FocusedStarfield active={activeSlide === 3} />
              </div>
            </>
          )}
          {/* <h1 className="text-blue-500 text-[20vh] skew-x-3 font-bold tracking-widest opacity-80">PORTFOLIO</h1> */}
        </div>

      </motion.div>
    </section>
  )
}