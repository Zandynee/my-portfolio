import React from 'react'

import LightGlare from './LightGlare'
import RoadDisplayPanel from './RoadDisplayPanel'
import RainOverlay from './RainOverlay'
import { motion } from 'framer-motion'

export default function RealApp() {
  return (
    <div>
        
    <motion.div 
    // 2. Define the starting state (invisible and slightly pushed down)

      
      // 3. Define the end state (fully visible and in its normal position)
      animate={{ opacity: 1, y: 0 }} 
      
      // 4. Control the timing and feel
      transition={{ duration: 0.8, ease: "easeOut" }}
    className="relative h-screen">
        <RainOverlay />
        <LightGlare />
        <RoadDisplayPanel />
      <div className="justify-center flex">
      {/* <img src="/src/assets/shibuya.svg" alt="Shibuya Scramble" className="w-[40vw] skew-x-30 scale-y-60" /> */}
      </div>
    </motion.div>
    </div>
  )
}