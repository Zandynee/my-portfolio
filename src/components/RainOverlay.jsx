import React from 'react'
import { motion } from 'framer-motion'

const raindrops = Array.from({ length: 150 }).map((_, i) => {
  const isForeground = Math.random() > 0.5;
  
  return {
    id: i,
    left: `${Math.random() * 100}%`,
    width: isForeground ? "w-[4px]" : "w-[2px]",
    height: isForeground ? "h-[80px]" : "h-[40px]", 
    opacity: isForeground ? "opacity-40" : "opacity-15",
    duration: isForeground ? (Math.random() * 0.2 + 0.25) : (Math.random() * 0.3 + 0.45),
    delay: Math.random() * 1, 
    pixelSize: isForeground ? "4px" : "2px"
  }
})

export default function RainOverlay() {
  return (
    // Changed back to 'fixed' so the storm covers the screen at all times
    <div className="fixed inset-0 z-50 pointer-events-none mix-blend-screen overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] rotate-[15deg]">
        
        {raindrops.map((drop) => (
          <motion.div
            key={drop.id}
            className={`absolute top-0 ${drop.width} ${drop.height} ${drop.opacity}`}
            style={{ 
              left: drop.left,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${drop.pixelSize}, #cbd5e1 ${drop.pixelSize}, #cbd5e1 calc(${drop.pixelSize} * 2))`
            }}
            initial={{ y: "-20vh" }}
            
            // Reverted to standard 'animate' so it runs immediately and endlessly
            animate={{ y: "170vh" }}
            
            // The 'viewport' property has been completely removed
            
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