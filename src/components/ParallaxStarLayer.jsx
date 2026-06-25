import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// 1. GENERATE STATIC STAR POSITIONS
// We generate them once. We'll render two identical copies of this array side-by-side
// and pan them to create an infinite, seamless loop.
const generateStarLayer = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 1.5 + 0.5, // 0.5px to 2.0px
    opacity: Math.random() * 0.7 + 0.3, // 0.3 to 1.0 opacity
    // 20% chance for a star to twinkle
    isTwinkling: Math.random() > 0.8,
  }));
};

const bgStars = generateStarLayer(150);
const mgStars = generateStarLayer(100);
const fgStars = generateStarLayer(50);

// 2. PARALLAX LAYER COMPONENT
const ParallaxStarLayer = ({ stars, duration, sizeMultiplier, baseOpacity }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    // Slide left exactly one screen width, then instantly reset — seamless infinite pan
    const tween = gsap.fromTo(
      containerRef.current,
      { x: '0%' },
      { x: '-100%', duration, repeat: -1, ease: 'none' }
    )
    return () => tween.kill()
  }, [duration])

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full flex">
      {/* Render two identical blocks side-by-side for the seamless infinite pan */}
      {[0, 1].map((blockIdx) => (
        <div key={blockIdx} className="relative w-full h-full flex-shrink-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`absolute rounded-full bg-blue-100 ${star.isTwinkling ? 'animate-pulse' : ''}`}
              style={{
                left: star.x,
                top: star.y,
                width: `${star.size * sizeMultiplier}px`,
                height: `${star.size * sizeMultiplier}px`,
                opacity: star.opacity * baseOpacity,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 3. SMART SHOOTING STAR COMPONENT
const ShootingStar = () => {
  const [renderKey, setRenderKey] = useState(0);
  const [config, setConfig] = useState(generateShootingStarConfig());
  const ref = useRef(null)

  function generateShootingStarConfig() {
    // Top-right to bottom-left trajectory (matching your rain wind angle)
    return {
      startX: `${Math.random() * 50 + 50}vw`,  // Starts in right half
      startY: `${Math.random() * -20 - 10}vh`, // Starts above the screen
      endX: `${Math.random() * 50 - 20}vw`,    // Ends in left half
      endY: `${Math.random() * 50 + 50}vh`,    // Ends lower down
      delay: Math.random() * 20 + 10,          // RARE: 10 to 30 seconds between stars
      duration: Math.random() * 0.4 + 0.5,     // FAST: 0.5s to 0.9s to cross screen
    };
  }

  const handleAnimationComplete = () => {
    // When it finishes, generate a new trajectory and force a re-render
    setConfig(generateShootingStarConfig());
    setRenderKey((prev) => prev + 1);
  };

  // Re-runs on every renderKey change (i.e. after each shot completes),
  // matching the original `key={renderKey}` remount pattern.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, {
      x: config.startX,
      y: config.startY,
      opacity: 0,
      scale: 0.5,
    })

    const tl = gsap.timeline({
      delay: config.delay,
      onComplete: handleAnimationComplete,
    })

    // x/y move from start to end over the full duration
    tl.to(el, {
      x: config.endX,
      y: config.endY,
      duration: config.duration,
      ease: 'power1.inOut',
    }, 0)

    // opacity: [0, 1, 1, 0] — evenly spaced keyframes
    // scale:   [0.5, 1, 0.5] — evenly spaced keyframes
    tl.to(el, {
      keyframes: [
        { opacity: 0,   scale: 0.5, duration: 0 },
        { opacity: 1,   scale: 1,   duration: config.duration / 3 },
        { opacity: 1,   scale: 1,   duration: config.duration / 3 },
        { opacity: 0,   scale: 0.5, duration: config.duration / 3 },
      ],
      ease: 'power1.inOut',
    }, 0)

    return () => tl.kill()
  }, [renderKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      className="absolute bg-gradient-to-r from-transparent via-white to-white rounded-full"
      style={{
        width: '120px',
        height: '2px',
        // Angle the line to match the top-right to bottom-left movement
        transformOrigin: 'right center',
        rotate: '-35deg',
      }}
    />
  );
};

// 4. MAIN EXPORT
export default function StarryNightOverlay() {
  return (
    // DARK (BUT NOT BLACK) BACKGROUND
    // A very deep midnight blue/slate gradient that looks like a rich night sky
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 pointer-events-none">

      {/* BACKGROUND LAYER: Slowest, smallest, dimmest */}
      <ParallaxStarLayer
        stars={bgStars}
        duration={240} // 4 minutes to cross screen
        sizeMultiplier={0.8}
        baseOpacity={0.4}
      />

      {/* MIDGROUND LAYER: Medium speed, standard size */}
      <ParallaxStarLayer
        stars={mgStars}
        duration={160}
        sizeMultiplier={1.2}
        baseOpacity={0.7}
      />

      {/* FOREGROUND LAYER: Fastest, largest, brightest */}
      <ParallaxStarLayer
        stars={fgStars}
        duration={90}
        sizeMultiplier={1.8}
        baseOpacity={1.0}
      />

      {/* RARE SHOOTING STAR */}
      <ShootingStar />

    </div>
  )
}