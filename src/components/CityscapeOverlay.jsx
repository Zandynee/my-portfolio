import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

export default function CityscapeOverlay() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    setBuildings(generateBuildings());
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[60vh] overflow-hidden pointer-events-none z-0">
      {buildings.map((b) => (
        // OUTER CONTAINER: Handles the continuous slow sliding
        <motion.div
          key={b.id}
          className="absolute bottom-0 flex justify-center"
          style={{
            width: b.width,
            height: b.height,
            zIndex: b.zIndex,
          }}
          // Inject the skews safely into Framer Motion's transform loop
          initial={{ x: '-200px', skewY: b.skewY, skewX: b.skewX }} 
          animate={{ x: '100vw' }}  
          transition={{
            duration: b.duration,
            delay: b.delay,
            ease: 'linear', 
            repeat: Infinity,
          }}
        >
          {/* INNER CONTAINER: Handles the building styling and rapid opacity glitch */}
          <motion.div
            className="w-full h-full bg-black overflow-hidden"
            style={{
              paddingTop: '12px',
              paddingLeft: '8px',
              paddingRight: '8px'
            }}
            // If glitchy, animate a harsh strobe sequence. Otherwise, stay solid (1).
            animate={b.isGlitchy ? { opacity: [1, 0.1, 0.9, 0.2, 1] } : { opacity: 1 }}
            transition={
              b.isGlitchy 
                ? {
                    duration: 0.4, // Rapid 0.4s glitch execution
                    repeat: Infinity,
                    repeatDelay: Math.random() * 4 + 2, // Waits 2 to 6 seconds before glitching again
                    times: [0, 0.2, 0.5, 0.8, 1] 
                  } 
                : {}
            }
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
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}