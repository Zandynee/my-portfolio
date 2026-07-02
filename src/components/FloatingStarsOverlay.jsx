import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const STAR_COUNT = 22;

// Simple 5-point star shape, reused as a clip-path on every star
const STAR_CLIP =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

const generateStars = () => {
  return Array.from({ length: STAR_COUNT }).map((_, i) => {
    const size = Math.floor(Math.random() * 14) + 6; // 6-20px
    const duration = Math.random() * 14 + 18; // 18-32s to cross the whole diagonal
    const delay = Math.random() * -duration; // negative delay -> already mid-flight on mount
    const startBottom = Math.random() * 40 - 10; // vh, staggered start rows near the bottom
    const startLeft = Math.random() * 30 - 20; // vw, staggered start columns near the left
    const opacity = Math.random() * 0.5 + 0.4;

    // FLOATY WOBBLE: gentle up/down + side/side drift layered on top of the main path
    const wobbleDuration = Math.random() * 2.5 + 1.8; // 1.8-4.3s per bob cycle
    const wobbleY = Math.random() * 14 + 8; // px bob amplitude
    const wobbleX = Math.random() * 10 + 4; // px sway amplitude

    // LEAF-LIKE Z-SPIN: random skew swing, each star gets its own rate/direction
    const skewRange = Math.random() * 30 + 15; // 15-45deg swing
    const skewDuration = Math.random() * 2.5 + 1.5; // 1.5-4s per skew flip
    const spinDuration = Math.random() * 10 + 6; // 6-16s per full rotation
    const spinDirection = Math.random() > 0.5 ? 1 : -1;

    return {
      id: `star-${i}`,
      size,
      duration,
      delay,
      startBottom,
      startLeft,
      opacity,
      wobbleDuration,
      wobbleY,
      wobbleX,
      skewRange,
      skewDuration,
      spinDuration,
      spinDirection,
    };
  });
};

// Each star manages its own GSAP animations, split across three layers so the
// (expensive-ish) heavy diagonal tween never has to fight with the cheap wobble/spin loops.
// OUTER: the long straight bottom-left -> top-right journey (transform only, GPU-friendly).
// MIDDLE: the floaty bob/sway "leaf on the wind" wobble, small + cheap, runs forever.
// INNER: the z-axis skew "flutter" + slow spin — the visual star shape lives here.
function StarItem({ s }) {
  const outerRef = useRef(null)
  const middleRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const middle = middleRef.current
    const inner = innerRef.current
    if (!outer || !middle || !inner) return

    // OUTER: straight diagonal path, off-screen bottom-left -> off-screen top-right
    gsap.set(outer, { x: '-10vw', y: '10vh' })
    const pathTween = gsap.to(outer, {
      x: '110vw',
      y: '-110vh',
      duration: s.duration,
      delay: s.delay,
      ease: 'none',
      repeat: -1,
    })

    // MIDDLE: gentle floaty bob/sway, independent of the main path
    const wobbleTween = gsap.to(middle, {
      x: `+=${s.wobbleX}`,
      y: `+=${s.wobbleY}`,
      duration: s.wobbleDuration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // INNER: leaf-like z-axis flutter (skew) + slow continuous spin
    const flutterTween = gsap.to(inner, {
      skewX: s.skewRange,
      skewY: s.skewRange * 0.6,
      duration: s.skewDuration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
    const spinTween = gsap.to(inner, {
      rotate: `+=${360 * s.spinDirection}`,
      duration: s.spinDuration,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      pathTween.kill()
      wobbleTween.kill()
      flutterTween.kill()
      spinTween.kill()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={outerRef}
      className="absolute"
      style={{
        bottom: `${s.startBottom}vh`,
        left: `${s.startLeft}vw`,
        willChange: 'transform',
      }}
    >
      <div ref={middleRef} style={{ willChange: 'transform' }}>
        <div
          ref={innerRef}
          style={{
            width: s.size,
            height: s.size,
            clipPath: STAR_CLIP,
            background: '#a5b4fc',
            opacity: s.opacity,
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.6))',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  )
}

export default function FloatingStarsOverlay() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(generateStars());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
      {stars.map((s) => (
        <StarItem key={s.id} s={s} />
      ))}
    </div>
  );
}