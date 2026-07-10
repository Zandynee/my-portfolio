import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const BUILDING_COUNT = 18;

const generateBuildings = () => {
  return Array.from({ length: BUILDING_COUNT }).map((_, i) => {
    const width = Math.floor(Math.random() * 80) + 60;
    const heightVmax = Math.floor(Math.random() * 40) + 15;
    const duration = 60 - (width / 140) * 40;
    const delay = Math.random() * -60;
    
    // We keep the window array for consistency across re-renders/glitches
    const windows = Array.from({ length: 400 }).map(() => Math.random() > 0.75);

    const skewY = Math.random() * 6 - 3;
    const skewX = Math.random() * 4 - 2;
    const isGlitchy = Math.random() > 0.85;

    return {
      id: `city-block-${i}`,
      width,
      height: `${heightVmax}vh`,
      heightVh: heightVmax, // raw number, used to compute canvas pixel size without a DOM read
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

function BuildingItem({ b }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const canvasRef = useRef(null)

  // 1. GSAP ANIMATION LOGIC
  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer) return

    // Added force3D: true to force hardware acceleration on the GPU
    gsap.set(outer, { x: '-200px', skewY: b.skewY, skewX: b.skewX, force3D: true })
    const outerTween = gsap.to(outer, {
      x: '100vw',
      duration: b.duration,
      delay: b.delay,
      ease: 'none',
      repeat: -1,
      force3D: true, // Hardware acceleration
    })

    let innerTl = null
    if (b.isGlitchy && inner) {
      const glitchRepeatDelay = Math.random() * 4 + 2
      innerTl = gsap.timeline({ repeat: -1, repeatDelay: glitchRepeatDelay })
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
  }, [b])

  // 2. CANVAS DRAWING LOGIC (Replaces the 400 window divs)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // PERF: size the canvas from data we already generated (b.width is a px
    // number, b.heightVh converts against window.innerHeight) instead of
    // calling getBoundingClientRect(). That call forces a synchronous layout
    // flush, and with 18 buildings each doing it on mount — interleaved with
    // GSAP's own gsap.set() writes on sibling elements above — it was causing
    // layout thrashing (repeated forced reflow) right as the scene appears.
    canvas.width = b.width;
    canvas.height = Math.round((b.heightVh / 100) * window.innerHeight);

    // Drawing Config (Matches your original CSS Grid exact dimensions)
    const colWidth = 8;
    const rowHeight = 14;
    const gap = 6;
    const paddingTop = 12;
    const paddingX = 8; // Left/Right padding

    // Calculate how many rows/cols fit in this building
    const cols = Math.floor((canvas.width - paddingX * 2) / (colWidth + gap));
    const rows = Math.floor((canvas.height - paddingTop) / (rowHeight + gap));

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // The exact opacity from your lit windows

    let windowIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Recycle the pre-generated random booleans
        const isLit = b.windows[windowIndex % b.windows.length];
        
        if (isLit) {
          const x = paddingX + col * (colWidth + gap);
          const y = paddingTop + row * (rowHeight + gap);
          // Draw the tiny 8x14 window rect directly to the GPU
          ctx.fillRect(x, y, colWidth, rowHeight);
        }
        windowIndex++;
      }
    }
  }, [b]);

  return (
    <div
      ref={outerRef}
      // Added will-change-transform for native CSS GPU promotion
      className="absolute bottom-0 flex justify-center will-change-transform"
      style={{
        width: b.width,
        height: b.height,
        zIndex: b.zIndex,
      }}
    >
      <div
        ref={innerRef}
        className="w-full h-full bg-black overflow-hidden will-change-[opacity]"
      >
        {/* Render a single Canvas element instead of hundreds of DOM nodes */}
        <canvas ref={canvasRef} className="w-full h-full block" />
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