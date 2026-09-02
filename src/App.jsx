import React, { useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { Link } from 'react-router-dom' // <-- Import Link
import RealApp from './components/RealApp'

export default function App() {
  const { scrollY } = useScroll() //[cite: 4]

  const opacity = useTransform(scrollY, [0, 320], [1, 0]) //[cite: 4]
  const y       = useTransform(scrollY, [0, 320], [0, -60]) //[cite: 4]

  const [visible, setVisible] = useState(true) //[cite: 4]

  // Unmount from DOM once fully scrolled past, remount if scrolled back up[cite: 4]
  useMotionValueEvent(scrollY, 'change', (v) => { //[cite: 4]
    setVisible(v < 1080) //[cite: 4]
  })

  return (
    <div className="bg-neutral-950 min-h-screen text-white font-sans overflow-x-hidden">
      
      {/* Add a navigation link to your new path */}
      <nav className="absolute top-0 left-0 p-6 z-50">
        <Link to="/new-page" className="text-white/70 hover:text-white transition-colors">
          Go to New Page
        </Link>
      </nav>

      <RealApp /> 

    </div>
  )
}