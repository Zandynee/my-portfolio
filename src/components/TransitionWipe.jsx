import React from 'react'
import { motion } from 'framer-motion'

// We pass `color` as a string parameter (defaults to 'blue' if none is provided)
export default function TransitionWipe({ activeSlide, color = 'blue' }) {
  
  // TAILWIND SAFELIST: Tailwind needs to "see" these exact class names in the code 
  // so it doesn't purge them during the build process.
  const safelist = "bg-amber-300 bg-amber-400 bg-amber-500 bg-amber-600 bg-amber-700 bg-amber-800 bg-amber-900 bg-amber-950 bg-purple-300 bg-purple-400 bg-purple-500 bg-purple-600 bg-purple-700 bg-purple-800 bg-purple-900 bg-purple-950";

  // We keep the base array defined in "blue". 
  // The neutral colors (like bg-neutral-600) will be ignored by the color replacer later!
  const motionDivs1 = [
    { delay: 0.4, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.41, duration: 0.5, bgColor: 'bg-blue-900', size: 'h-[20px]' },
    { delay: 0.3, duration: 0.6, bgColor: 'bg-blue-600', size: 'h-[102px]' },
    { delay: 0.5, duration: 0.8, bgColor: 'bg-blue-300', size: 'h-[42px]' },
    { delay: 0.3, duration: 0.5, bgColor: 'bg-blue-600', size: 'h-[272px]' },
    { delay: 0.5, duration: 0.7, bgColor: 'bg-blue-300', size: 'h-[132px]' },
    { delay: 0.4, duration: 0.8, bgColor: 'bg-blue-600', size: 'h-[72px]' },
    { delay: 0.3, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[55px]' },
    { delay: 0.54, duration: 0.1, bgColor: 'bg-blue-600', size: 'h-[12px]' },
    { delay: 0.5, duration: 0.2, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.2, duration: 0.6, bgColor: 'bg-blue-950', size: 'h-[150px]' },
    { delay: 0.3, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[55px]' },
    { delay: 0.4, duration: 0.5, bgColor: 'bg-blue-800', size: 'h-[120px]' },
    { delay: 1.1, duration: 0.4, bgColor: 'bg-neutral-600', size: 'h-[22px]' },
    { delay: 0.7, duration: 0.3, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.2, duration: 0.5, bgColor: 'bg-blue-900', size: 'h-[180px]' },
    { delay: 0.8, duration: 0.4, bgColor: 'bg-neutral-600', size: 'h-[82px]' },
    { delay: 0.4, duration: 0.6, bgColor: 'bg-blue-400', size: 'h-[200px]' },
    { delay: 0.5, duration: 0.5, bgColor: 'bg-blue-600', size: 'h-[150px]' },
    { delay: 0.3, duration: 0.8, bgColor: 'bg-blue-950', size: 'h-[220px]' },
    { delay: 0.4, duration: 0.7, bgColor: 'bg-blue-500', size: 'h-[90px]' },
    { delay: 0.6, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[40px]' },
    { delay: 0.3, duration: 0.6, bgColor: 'bg-blue-800', size: 'h-[170px]' },
  ]

  const motionDivs2 = [
    { delay: 0.4, duration: 0.6, bgColor: 'bg-blue-950', size: 'h-[100px]' },
    { delay: 0.8, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.3, duration: 0.5, bgColor: 'bg-blue-900', size: 'h-[122px]' },
    { delay: 0.1, duration: 0.6, bgColor: 'bg-blue-600', size: 'h-[272px]' },
    { delay: 0.2, duration: 0.5, bgColor: 'bg-blue-800', size: 'h-[150px]' },
    { delay: 0.2, duration: 0.4, bgColor: 'bg-blue-300', size: 'h-[272px]' },
    { delay: 1.2, duration: 0.1, bgColor: 'bg-blue-600', size: 'h-[72px]' },
    { delay: 0.3, duration: 0.5, bgColor: 'bg-blue-300', size: 'h-[172px]' },
    { delay: 0.2, duration: 0.7, bgColor: 'bg-neutral-900', size: 'h-[140px]' },
    { delay: 0.2, duration: 0.8, bgColor: 'bg-blue-600', size: 'h-[152px]' },
    { delay: 0.4, duration: 0.5, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.4, duration: 0.3, bgColor: 'bg-blue-600', size: 'h-[42px]' },
    { delay: 0.3, duration: 0.6, bgColor: 'bg-blue-900', size: 'h-[190px]' },
    { delay: 0.5, duration: 0.5, bgColor: 'bg-blue-300', size: 'h-[72px]' },
    { delay: 0.6, duration: 0.5, bgColor: 'bg-blue-600', size: 'h-[172px]' },
    { delay: 0.2, duration: 0.8, bgColor: 'bg-blue-950', size: 'h-[200px]' },
    { delay: 0.7, duration: 0.5, bgColor: 'bg-neutral-600', size: 'h-[132px]' },
    { delay: 0.8, duration: 0.9, bgColor: 'bg-blue-600', size: 'h-[72px]' },
    { delay: 0.4, duration: 0.5, bgColor: 'bg-blue-400', size: 'h-[250px]' },
    { delay: 0.3, duration: 0.7, bgColor: 'bg-blue-800', size: 'h-[150px]' },
    { delay: 0.5, duration: 0.4, bgColor: 'bg-blue-600', size: 'h-[120px]' },
    { delay: 0.2, duration: 0.9, bgColor: 'bg-neutral-950', size: 'h-[180px]' },
  ]

  // Helper function: only replaces "blue" if the prop is passed, leaving "neutral" perfectly intact!
  const getDynamicColor = (baseClass) => baseClass.replace('blue', color);

  return (
    <div key={activeSlide} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      
      {/* Container 1 */}
      <div className="absolute inset-0 flex flex-col -top-[50vh]">
        {motionDivs1.map((div, index) => (
          <motion.div
            key={`group1-${index}`}
                initial={{ x: 1732, y: 2000 }}
            animate={{ x: -4632, y: -1600 }}
            transition={{ delay: div.delay, duration: div.duration }}
            className="relative w-[300vw] shrink-0" 
          >
            {/* The string replacement applies the new color instantly */}
            <div className={`${getDynamicColor(div.bgColor)} skew-y-[30deg] w-full ${div.size}`} />
          </motion.div>
        ))}
      </div>

      {/* Container 2 */}
      <div className="absolute inset-0 flex flex-col -top-[50vh]">
        {motionDivs2.map((div, index) => (
          <motion.div
            key={`group2-${index}`}
              initial={{ x: 1732, y: 2000 }}
            animate={{ x: -4632, y: -1600 }}
            transition={{ delay: div.delay, duration: div.duration }}
            className="relative w-[300vw] shrink-0"
          >
            <div className={`${getDynamicColor(div.bgColor)} skew-y-[30deg] w-full ${div.size}`} />
          </motion.div>
        ))}
      </div>

    </div>
  )
}