import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

const raindrops = Array.from({ length: 150 }).map((_, i) => {
  const isForeground = Math.random() > 0.5

  return {
    id:        i,
    left:      `${Math.random() * 100}%`,
    width:     isForeground ? 'w-[4px]' : 'w-[2px]',
    height:    isForeground ? 'h-[80px]' : 'h-[40px]',
    opacity:   isForeground ? 'opacity-40' : 'opacity-15',
    duration:  isForeground ? (Math.random() * 0.2 + 0.25) : (Math.random() * 0.3 + 0.45),
    delay:     Math.random() * 1,
    pixelSize: isForeground ? '4px' : '2px',
  }
})

export default function RainOverlay() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const drops = gsap.utils.toArray('.rain-drop', containerRef.current)

      gsap.fromTo(
        drops,
        { y: '-20vh' },
        {
          y:        '170vh',
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
    <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none mix-blend-screen overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rotate-[15deg]">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className={`rain-drop absolute top-0 ${drop.width} ${drop.height} ${drop.opacity}`}
            style={{
              left: drop.left,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${drop.pixelSize}, #cbd5e1 ${drop.pixelSize}, #cbd5e1 calc(${drop.pixelSize} * 2))`,
            }}
          />
        ))}
      </div>
    </div>
  )
}