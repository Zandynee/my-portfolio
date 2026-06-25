import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const BUILDING_COUNT = 18;

const generateBuildings = () => {
  return Array.from({ length: BUILDING_COUNT }).map((_, i) => {
    const width = Math.floor(Math.random() * 80) + 60;
    const heightVmax = Math.floor(Math.random() * 40) + 15;
    const duration = 60 - (width / 140) * 40;
    const delay = Math.random() * -60;
    const windows = Array.from({ length: 400 }).map(() => Math.random() > 0.75);

    // 1. SKEW: Random slight angles for a pseudo-3D perspective
    const skewY = Math.random() * 6 - 3; // Leans the horizontal lines (-3 to 3 deg)
    const skewX = Math.random() * 4 - 2; // Leans the vertical walls (-2 to 2 deg)

    // 2. GLITCH: ~15% chance for a building to be a "glitchy" hologram
    const isGlitchy = Math.random() > 0.85;

    return {
      id: `city-block-${i}`,
      width,
      height: `${heightVmax}vh`,
      duration,
      delay,
      windows,
      zIndex: width,
      skewY,
      skewX,
      isGlitchy,
    };
  });
};

// Each building manages its own GSAP animations.
// The outer div handles the continuous slow sliding; the inner div handles the glitch.
function BuildingItem({ b }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer) return

    // OUTER CONTAINER: Handles the continuous slow sliding
    // Inject the skews via gsap.set, matching the original `initial` prop
    gsap.set(outer, { x: '-200px', skewY: b.skewY, skewX: b.skewX })
    const outerTween = gsap.to(outer, {
      x: '100vw',
      duration: b.duration,
      delay: b.delay,
      ease: 'none',
      repeat: -1,
    })

    // INNER CONTAINER: Handles the rapid opacity glitch if applicable
    let innerTl = null
    if (b.isGlitchy && inner) {
      // Random wait between 2 and 6 seconds before each glitch, matching the original
      const glitchRepeatDelay = Math.random() * 4 + 2
      innerTl = gsap.timeline({ repeat: -1, repeatDelay: glitchRepeatDelay })
      // Rapid 0.4s glitch execution — times: [0, 0.2, 0.5, 0.8, 1]
      innerTl.to(inner, {
        keyframes: [
          { opacity: 1,   duration: 0.4 * 0.2 },
          { opacity: 0.1, duration: 0.4 * 0.3 },
          { opacity: 0.9, duration: 0.4 * 0.3 },
          { opacity: 0.2, duration: 0.4 * 0.2 },
          { opacity: 1,   duration: 0 },
        ],
        ease: 'none',
      })
    }

    return () => {
      outerTween.kill()
      if (innerTl) innerTl.kill()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={outerRef}
      className="absolute bottom-0 flex justify-center"
      style={{
        width: b.width,
        height: b.height,
        zIndex: b.zIndex,
      }}
    >
      {/* INNER CONTAINER: Handles the building styling and rapid opacity glitch */}
      <div
        ref={innerRef}
        className="w-full h-full bg-black overflow-hidden"
        style={{
          paddingTop: '12px',
          paddingLeft: '8px',
          paddingRight: '8px'
        }}
      >
        <div
          className="w-full h-full grid gap-[6px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(8px, 1fr))',
            gridAutoRows: '14px',
            alignContent: 'start'
          }}
        >
          {b.windows.map((isLit, idx) => (
            <div
              key={idx}
              className={`w-full h-full rounded-[1px] transition-opacity ${
                isLit
                  ? 'bg-white opacity-80'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CityscapeOverlay() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    setBuildings(generateBuildings());
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[60vh] overflow-hidden pointer-events-none z-0">
      {buildings.map((b) => (
        <BuildingItem key={b.id} b={b} />
      ))}
    </div>
  );
}