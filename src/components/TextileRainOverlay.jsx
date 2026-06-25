import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

const NUM_DROPS = 800

const raindrops = Array.from({ length: NUM_DROPS }).map((_, i) => {
  const depthRoll = Math.random()
  let depthClass = 'bg'
  if (depthRoll > 0.85)      depthClass = 'fg'
  else if (depthRoll > 0.5)  depthClass = 'mg'

  let width, height, opacity, duration, pixelSize, blur

  if (depthClass === 'fg') {
    width     = 'w-[4px]'
    height    = 'h-[600px]'
    opacity   = 'opacity-30'
    duration  = Math.random() * 0.04 + 0.06
    pixelSize = '6px'
    blur      = 'blur-[1px]'
  } else if (depthClass === 'mg') {
    width     = 'w-[2px]'
    height    = 'h-[400px]'
    opacity   = 'opacity-20'
    duration  = Math.random() * 0.04 + 0.10
    pixelSize = '3px'
    blur      = 'blur-none'
  } else {
    width     = 'w-[1px]'
    height    = 'h-[250px]'
    opacity   = 'opacity-10'
    duration  = Math.random() * 0.08 + 0.15
    pixelSize = '2px'
    blur      = 'blur-none'
  }

  return {
    id:        i,
    left:      `${Math.random() * 150 - 25}%`,
    width,
    height,
    opacity,
    duration,
    delay:     Math.random() * 0.3,
    pixelSize,
    blur,
    color:     '#93c5fd',
  }
})

export default function TextileRainOverlay() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const drops = gsap.utils.toArray('.textile-drop', containerRef.current)

      // Batch all 800 tweens in a single call.
      // Function-based duration/delay lets each drop keep its individual timing.
      gsap.fromTo(
        drops,
        { y: '-30vh' },
        {
          y:        '200vh',
          ease:     'none',
          repeat:   -1,
          duration: (i) => raindrops[i].duration,
          delay:    (i) => raindrops[i].delay,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 pointer-events-none mix-blend-screen overflow-hidden opacity-25"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] -rotate-[20deg]">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className={`textile-drop absolute top-0 ${drop.width} ${drop.height} ${drop.opacity} ${drop.blur}`}
            style={{
              left: drop.left,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${drop.pixelSize}, ${drop.color} ${drop.pixelSize}, ${drop.color} calc(${drop.pixelSize} * 2))`,
            }}
          />
        ))}
      </div>
    </div>
  )
}