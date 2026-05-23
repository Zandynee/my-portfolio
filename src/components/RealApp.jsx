import React from 'react'
import { motion } from 'framer-motion'

export default function RealApp() {
  return (
    <motion.div 
    // 2. Define the starting state (invisible and slightly pushed down)

      
      // 3. Define the end state (fully visible and in its normal position)
      animate={{ opacity: 1, y: 0 }} 
      
      // 4. Control the timing and feel
      transition={{ duration: 0.8, ease: "easeOut" }}
    className="">
      <h1 className="text-4xl ">
        my portfolio
      </h1>
    </motion.div>
  )
}