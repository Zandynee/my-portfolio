import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
const ParallaxStarLayer = ({ stars, duration, sizeMultiplier, baseOpacity }) => (
  <motion.div
    className="absolute top-0 left-0 w-full h-full flex"
    // Slide left exactly one screen width, then instantly reset to 0
    animate={{ x: ["0%", "-100%"] }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  >
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
  </motion.div>
);

// 3. SMART SHOOTING STAR COMPONENT
const ShootingStar = () => {
  const [renderKey, setRenderKey] = useState(0);
  const [config, setConfig] = useState(generateShootingStarConfig());

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

  return (
    <motion.div
      key={renderKey}
      className="absolute bg-gradient-to-r from-transparent via-white to-white rounded-full"
      style={{
        width: '120px',
        height: '2px',
        // Angle the line to match the top-right to bottom-left movement
        transformOrigin: 'right center',
        rotate: '-35deg', 
      }}
      initial={{ 
        x: config.startX, 
        y: config.startY, 
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        x: config.endX, 
        y: config.endY, 
        opacity: [0, 1, 1, 0], // Fades in, streaks, fades out
        scale: [0.5, 1, 0.5]
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        ease: "easeInOut"
      }}
      onAnimationComplete={handleAnimationComplete}
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