import React, { useRef, useEffect } from 'react'

// PERF NOTE: the original version called setState on every raw `mousemove`
// event (uncapped — can be 100s of times/sec on a high-poll-rate mouse),
// re-rendering this component on each one. Since the only thing that
// actually needs to change is a CSS transform, we skip React state
// entirely: the mousemove handler just records the latest target tilt in
// a ref, and a single requestAnimationFrame callback writes it straight to
// the DOM. That caps the real work to once per rendered frame no matter
// how fast the mouse fires.
export default function ParallaxWrapper({
  children,
  maxRotation = 12,
  scale = 1.15,
  backgroundColor = '#111023'
}) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)
  const rafRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const applyTransform = () => {
      rafRef.current = null
      const { x, y } = targetRef.current
      inner.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`
    }

    const scheduleApply = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(applyTransform)
      }
    }

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const xPct = x / rect.width - 0.5
      const yPct = y / rect.height - 0.5

      targetRef.current = {
        x: yPct * -maxRotation,
        y: xPct * maxRotation,
      }
      scheduleApply()
    }

    const handleMouseLeave = () => {
      targetRef.current = { x: 0, y: 0 }
      scheduleApply()
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [maxRotation])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        perspective: '1000px',
        backgroundColor: backgroundColor
      }}
    >
      <div
        ref={innerRef}
        className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${scale})` }}
        >
          {/* This is where your Nebula, Starfield, or future assets will render */}
          {children}
        </div>
      </div>

      {/* Foreground Container - Optional, keeps UI elements flat and un-tilted */}
      <div className="relative z-10 flex h-full items-center justify-center pointer-events-none">
        {/* You can pass specific foreground UI through props if needed later */}
      </div>
    </div>
  )
}