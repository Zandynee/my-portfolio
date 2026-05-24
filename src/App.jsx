import React, { useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import RealApp from './components/RealApp'

export default function App() {
  const { scrollY } = useScroll()

  const opacity = useTransform(scrollY, [0, 320], [1, 0])
  const y       = useTransform(scrollY, [0, 320], [0, -60])

  const [visible, setVisible] = useState(true)

  // Unmount from DOM once fully scrolled past, remount if scrolled back up
  useMotionValueEvent(scrollY, 'change', (v) => {
    setVisible(v < 1080)
  })

  return (
    <div className="bg-neutral-950 min-h-screen text-white font-sans overflow-x-hidden">


      <RealApp />

    </div>
  )
}