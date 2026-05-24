import React from 'react'
import { motion } from 'framer-motion'

// 1. INCREASED INTENSITY: Bumped from 600 to 800 drops for maximum texture density
const NUM_DROPS = 800;

const raindrops = Array.from({ length: NUM_DROPS }).map((_, i) => {
  const depthRoll = Math.random();
  let depthClass = 'bg'; 
  if (depthRoll > 0.85) depthClass = 'fg'; 
  else if (depthRoll > 0.5) depthClass = 'mg'; 

  let width, height, opacity, duration, pixelSize, blur;

  if (depthClass === 'fg') {
    width = "w-[4px]";
    height = "h-[600px]"; 
    opacity = "opacity-30"; 
    // INCREASED INTENSITY: Faster fall speeds across all tiers
    duration = Math.random() * 0.04 + 0.06; 
    pixelSize = "6px";
    blur = "blur-[1px]"; 
  } else if (depthClass === 'mg') {
    width = "w-[2px]";
    height = "h-[400px]";
    opacity = "opacity-20";
    duration = Math.random() * 0.04 + 0.10; 
    pixelSize = "3px";
    blur = "blur-none";
  } else {
    width = "w-[1px]";
    height = "h-[250px]";
    opacity = "opacity-10"; 
    duration = Math.random() * 0.08 + 0.15; 
    pixelSize = "2px";
    blur = "blur-none";
  }

  return {
    id: i,
    left: `${Math.random() * 150 - 25}%`,
    width,
    height,
    opacity,
    duration,
    delay: Math.random() * 0.3, 
    pixelSize,
    blur,
    color: "#93c5fd" 
  }
})

export default function TextileRainOverlay() {
  return (
    // 2. REDUCED OPACITY: Added `opacity-25` to the parent so the 800 combined layers
    // don't stack up and wash out the colors behind them.
    <div className="absolute inset-0 z-50 pointer-events-none mix-blend-screen overflow-hidden opacity-25">
      
      {/* 3. MIRRORED TRAJECTORY: Changed rotate-[20deg] to -rotate-[20deg] */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] -rotate-[20deg]">
        
        {raindrops.map((drop) => (
          <motion.div
            key={drop.id}
            className={`absolute top-0 ${drop.width} ${drop.height} ${drop.opacity} ${drop.blur}`}
            style={{ 
              left: drop.left,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${drop.pixelSize}, ${drop.color} ${drop.pixelSize}, ${drop.color} calc(${drop.pixelSize} * 2))`
            }}
            initial={{ y: "-30vh" }}
            animate={{ y: "200vh" }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Infinity,
              ease: "linear", 
            }}
          />
        ))}
        
      </div>
    </div>
  )
}