import React from 'react'
import { motion } from 'framer-motion'

export default function BlobBackground() {
  return (
    // Removed `bg-neutral-950` — this is now a completely transparent overlay
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      
      {/* ── BLOB 1: Green/Blue (Top-Right) ── */}
      <motion.div
        animate={{
          x: ["0%", "-10%", "5%", "0%"],
          y: ["0%", "10%", "-5%", "0%"],
          scale: [1, 1.1, 0.95, 1],
          rotate: [0, 90, 180, 360],
          borderRadius: [
            "40% 60% 70% 30% / 40% 50% 60% 50%", 
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "50% 50% 40% 60% / 40% 60% 50% 40%",
            "40% 60% 70% 30% / 40% 50% 60% 50%"
          ]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        // Decreased blur to 30px for clarity. 
        // Gradient pushes strong green down to blue.
        className="absolute -top-[10%] -right-[10%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] bg-gradient-to-tr from-green-400 to-blue-600 blur-[2px]"
      />

      {/* ── BLOB 2: Yellow/Orange (Bottom-Left) ── */}
      <motion.div
        animate={{
          x: ["0%", "15%", "-10%", "0%"],
          y: ["0%", "-15%", "10%", "0%"],
          scale: [1, 1.15, 0.9, 1],
          rotate: [360, 270, 90, 0],
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "40% 60% 70% 30% / 40% 50% 60% 50%", 
            "50% 50% 60% 40% / 60% 40% 50% 50%",
            "60% 40% 30% 70% / 60% 30% 70% 40%"
          ]
        }}
        transition={{
          duration: 48, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        // Decreased blur to 30px for clarity. 
        // Added a 'via' step so the bright yellow dominates before turning orange.
        className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] min-w-[450px] min-h-[450px] bg-gradient-to-br from-yellow-300 via-yellow-400 to-rose-500 blur-[2px]"
      />
      
    </div>
  )
}