import React, { useState } from 'react'
import { motion } from 'framer-motion'

// 1. SCARCITY: Reduced total shapes from 12 down to 6
const SHAPE_COUNT = 9;

const COLOR_OPTIONS = [
  
  'url(#grad-yellow-rose)',
  'url(#grad-green-blue)',
  'url(#grad-pink-purple)'
];

function generateRandomConfig(isInitial = false) {
  let x, y;
  let inMiddle = true;
  
  while (inMiddle) {
    x = Math.random() * 110 - 5; 
    y = Math.random() * 110 - 5; 
    const isXMiddle = x > 25 && x < 75;
    const isYMiddle = y > 25 && y < 75;
    inMiddle = isXMiddle && isYMiddle; 
  }
  
  const sweepValue = (100 - x) + y;
  
  // 2. REPEAT DELAY: Massively increased the respawn wait time
  const delay = isInitial 
    ? sweepValue * 0.05 
    : Math.random() * 5 + 3; // Waits 3 to 8 seconds before respawning

  return {
    x: `${x}vw`,
    y: `${y}vh`,
    size: `${Math.random() * 32 + 4}vmax`,
    isFilled: Math.random() > 0.5,
    baseOpacity: Math.random() * 0.20 + 0.60,
    color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    duration: Math.random() * 1 + 2.5,
    delay: delay
  };
}

const AnimatedPill = ({ isInitialLoad }) => {
  const [renderKey, setRenderKey] = useState(0);
  const [config, setConfig] = useState(() => generateRandomConfig(isInitialLoad));

  const handleAnimationComplete = () => {
    setConfig(generateRandomConfig(false));
    setRenderKey((prev) => prev + 1); 
  };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: config.x,
        top: config.y,
        width: config.size,
      }}
    >
      <svg 
        viewBox="0 0 2277 2277" 
        fill="none" 
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <motion.rect 
          key={renderKey} 
          x="-157.627" 
          y="1835" 
          width="2818" 
          height="848" 
          rx="424" 
          transform="rotate(-45 -157.627 1835)" 
          stroke={config.color} 
          strokeWidth="36"
          fill={config.color}  
          
          initial={{ pathLength: 0, fillOpacity: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, config.baseOpacity, config.baseOpacity, 0],
            fillOpacity: config.isFilled ? [0, 0, 1, 0] : [0, 0, 0, 0],
          }}
          transition={{
            duration: config.duration,
            delay: config.delay, 
            ease: "easeInOut",
            times: [0, 0.15, 0.85, 1] 
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      </svg>
    </div>
  )
}

export default function PillPatternOverlay() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="grad-yellow-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />   
            <stop offset="50%" stopColor="#fbbf24" />  
            <stop offset="100%" stopColor="#f43f5e" /> 
          </linearGradient>

          <linearGradient id="grad-green-blue" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />   
            <stop offset="100%" stopColor="#2563eb" /> 
          </linearGradient>

          <linearGradient id="grad-pink-purple" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />   
            <stop offset="100%" stopColor="#9333ea" /> 
          </linearGradient>
        </defs>
      </svg>

      {Array.from({ length: SHAPE_COUNT }).map((_, i) => (
        <AnimatedPill key={i} isInitialLoad={true} />
      ))}
      
    </div>
  )
}