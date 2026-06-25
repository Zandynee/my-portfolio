import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export default function BlobBackground() {
  const blob1Ref = useRef(null)
  const blob2Ref = useRef(null)

  useEffect(() => {
    const tl1 = gsap.timeline({ repeat: -1 })
    tl1
      .to(blob1Ref.current, {
        x: '-10%', y: '10%', scale: 1.1, rotate: 90,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        duration: 35 / 3,
        ease: 'power1.inOut',
      })
      .to(blob1Ref.current, {
        x: '5%', y: '-5%', scale: 0.95, rotate: 180,
        borderRadius: '50% 50% 40% 60% / 40% 60% 50% 40%',
        duration: 35 / 3,
        ease: 'power1.inOut',
      })
      .to(blob1Ref.current, {
        x: '0%', y: '0%', scale: 1, rotate: 360,
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        duration: 35 / 3,
        ease: 'power1.inOut',
      })

    const tl2 = gsap.timeline({ repeat: -1 })
    tl2
      .to(blob2Ref.current, {
        x: '15%', y: '-15%', scale: 1.15, rotate: 270,
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        duration: 48 / 3,
        ease: 'power1.inOut',
      })
      .to(blob2Ref.current, {
        x: '-10%', y: '10%', scale: 0.9, rotate: 90,
        borderRadius: '50% 50% 60% 40% / 60% 40% 50% 50%',
        duration: 48 / 3,
        ease: 'power1.inOut',
      })
      .to(blob2Ref.current, {
        x: '0%', y: '0%', scale: 1, rotate: 0,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        duration: 48 / 3,
        ease: 'power1.inOut',
      })

    return () => {
      tl1.kill()
      tl2.kill()
    }
  }, [])

  return (
    // Removed `bg-neutral-950` — this is now a completely transparent overlay
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

      {/* ── BLOB 1: Green/Blue (Top-Right) ── */}
      <div
        ref={blob1Ref}
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
        // Decreased blur to 30px for clarity.
        // Gradient pushes strong green down to blue.
        className="absolute -top-[10%] -right-[10%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] bg-gradient-to-tr from-green-400 to-blue-600 blur-[2px]"
      />

      {/* ── BLOB 2: Yellow/Orange (Bottom-Left) ── */}
      <div
        ref={blob2Ref}
        style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        // Decreased blur to 30px for clarity.
        // Added a 'via' step so the bright yellow dominates before turning orange.
        className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] min-w-[450px] min-h-[450px] bg-gradient-to-br from-yellow-300 via-yellow-400 to-rose-500 blur-[2px]"
      />

    </div>
  )
}