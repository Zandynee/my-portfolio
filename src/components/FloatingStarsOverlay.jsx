import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const STAR_COUNT = 36; // fewer, since each triangle is now large

// Simple equilateral-ish triangle, reused as a clip-path on every piece
const STAR_CLIP = 'polygon(50% 0%, 0% 100%, 100% 100%)';
const generateStars = () => {
  return Array.from({ length: STAR_COUNT }).map((_, i) => {
    const size = Math.random() * 4 + 8; 
    
    // SLOWER MAIN PATH: Increased from (18-32s) to (35-65s) to cross the screen
    const duration = Math.random() * 30 + 35; 
    
    const delay = Math.random() * -duration; 
    const startBottom = -(Math.random() * 20 + size + 10); 
    const startLeft = -(Math.random() * 20 + size + 10); 
    const opacity = Math.random() * 0.15 + 0.1; 
    const hueStart = Math.random() * 25 + 265; 
    const hueEnd = Math.random() * 25 + 215; 

    // SLOWER WOBBLE: Increased from (1.8-4.3s) to (4-7s) per bob cycle
    const wobbleDuration = Math.random() * 3 + 4; 
    const wobbleY = Math.random() * 14 + 8; 
    const wobbleX = Math.random() * 10 + 4; 

    // SLOWER FLUTTER & SPIN: Relaxed the leaf-like rotation
    const skewRange = Math.random() * 30 + 15; 
    const skewDuration = Math.random() * 3 + 4; // Increased from (1.5-4s)
    const spinDuration = Math.random() * 15 + 12; // Increased from (6-16s) to (12-27s)
    const spinDirection = Math.random() > 0.5 ? 1 : -1;

    // (Keep your updated wider destinations here)
    const destX = Math.random() * 100 + 150; 
    const destY = -(Math.random() * 100 + 150); 

    return {
      id: `star-${i}`,
      size,
      duration,
      delay,
      startBottom,
      startLeft,
      opacity,
      hueStart,
      hueEnd,
      wobbleDuration,
      wobbleY,
      wobbleX,
      skewRange,
      skewDuration,
      spinDuration,
      spinDirection,
      destX, // Export the new X destination
      destY, // Export the new Y destination
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
   // OUTER: straight diagonal path, off-screen bottom-left -> off-screen top-right
    gsap.set(outer, { x: '-10vw', y: '10vh' })
    const pathTween = gsap.to(outer, {
      x: `${s.destX}vw`, // Replaced '110vw' with dynamic value
      y: `${s.destY}vh`, // Replaced '-110vh' with dynamic value
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

    // COLOR: purple right after spawn -> blue right before it loops back offscreen.
    // Driven by a plain JS proxy (not the CSS gradient) so it can be read every frame
    // cheaply, and locked to the exact same duration/delay/repeat as the path tween
    // so the color and position always finish their lap together.
    const color = { hue: s.hueStart }
    const colorTween = gsap.to(color, {
      hue: s.hueEnd,
      duration: s.duration,
      delay: s.delay,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        inner.style.background = `hsl(${color.hue}, 85%, 62%)`
        inner.style.filter = `drop-shadow(0 0 ${s.size * 0.15}vw hsla(${color.hue}, 85%, 65%, 0.5))`
      },
    })

    return () => {
      pathTween.kill()
      wobbleTween.kill()
      flutterTween.kill()
      spinTween.kill()
      colorTween.kill()
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
            width: `${s.size}vw`,
            height: `${s.size}vw`,
            clipPath: STAR_CLIP,
            background: `hsl(${s.hueStart}, 85%, 62%)`,
            opacity: s.opacity,
            filter: `drop-shadow(0 0 ${s.size * 0.15}vw hsla(${s.hueStart}, 85%, 65%, 0.5))`,
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