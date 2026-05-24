import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 1. REMOVED BLACK from color options
const COLOR_OPTIONS = [
  'url(#grad-yellow-rose)',
  'url(#grad-green-blue)',
  'url(#grad-pink-purple)'
];

// 2. FIXED SQUISH & 3. REDUCED STROKE: Now using fixed pixel sizes instead of vmax/percentages
function generateRandomBubble(isClick, xPx, yPx) {
  const colorId = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  // Click bubbles are ~40-80px, move bubbles are ~10-30px
  const sizeValue = isClick ? Math.random() * 40 + 40 : Math.random() * 20 + 10; 
  
  return {
    id: `bubble-${Date.now()}-${Math.random()}`,
    x: xPx,
    y: yPx,
    size: sizeValue,
    colorId,
    isClick,
    duration: isClick ? 0.7 : 0.5, 
    strokeWidth: isClick ? 6 : 2, // 3. REDUCED STROKE WIDTH (from 24/12)
  };
}

export default function BubbleInteractionOverlay() {
  const overlayRef = useRef(null);
  const [bubbles, setBubbles] = useState([]);
  const [isClicking, setIsClicking] = useState(false);

  const addBubble = useCallback((event, isClick) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    
    // 2. FIXED SQUISH: Calculate exact pixel coordinates relative to the container
    const xPx = event.clientX - rect.left;
    const yPx = event.clientY - rect.top;
    
    setBubbles((prev) => [
      ...prev,
      generateRandomBubble(isClick, xPx, yPx)
    ]);
  }, []);

  const limitPointerMoveBubbles = useCallback((event) => {
    addBubble(event, false);
    setBubbles((prev) => prev.length > 50 ? prev.slice(1) : prev);
  }, [addBubble]);

  useEffect(() => {
    const handlePointerDown = (e) => {
      setIsClicking(true);
      addBubble(e, true);
    };
    
    const handlePointerMove = (e) => {
        if (!isClicking) limitPointerMoveBubbles(e); 
    };

    const handlePointerUp = () => setIsClicking(false);
    const handlePointerCancel = () => setIsClicking(false);

    const el = overlayRef.current;
    if (el) {
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerup', handlePointerUp);
      el.addEventListener('pointercancel', handlePointerCancel);
    }

    return () => {
      if (el) {
        el.removeEventListener('pointerdown', handlePointerDown);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerup', handlePointerUp);
        el.removeEventListener('pointercancel', handlePointerCancel);
      }
    };
  }, [addBubble, isClicking, limitPointerMoveBubbles]);

  return (
    <div ref={overlayRef} className="absolute inset-0 z-10 overflow-hidden touch-none pointer-events-auto bg-transparent">
      {/* Hidden SVG for Gradient Definitions */}
      <svg width="0" height="0" className="absolute top-0 left-0 pointer-events-none">
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

      {/* 2. FIXED SQUISH: Removed viewBox and preserveAspectRatio so 1 unit = 1 pixel */}
      <svg className="w-full h-full pointer-events-none">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.circle
              key={bubble.id}
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size} 
              fill="none"
              stroke={bubble.colorId}
              strokeWidth={bubble.strokeWidth}
              initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0], scale: [0.8, 1, 1.1] }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{
                duration: bubble.duration,
                ease: "easeInOut",
                times: [0, 0.3, 1] 
              }}
            />
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}