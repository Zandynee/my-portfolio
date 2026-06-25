import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Durations have all been increased to a minimum of 1.2 seconds.
const glares = [
  // Top Right Cluster
  { id: 1,  classes: "-top-[15%] -right-[5%] w-[40vw] h-[40vw] bg-yellow-400 blur-[80px]",   duration: 1.5, delay: 0,   repeatDelay: 3,   xMove: ["0%", "15%"]  },
  { id: 2,  classes: "-top-[5%] right-[10%] w-[30vw] h-[30vw] bg-amber-300 blur-[60px]",    duration: 1.3, delay: 1,   repeatDelay: 2,   xMove: ["0%", "-20%"] },
  { id: 3,  classes: "top-[10%] -right-[15%] w-[50vw] h-[50vw] bg-amber-500 blur-[120px]",  duration: 1.8, delay: 2,   repeatDelay: 4,   xMove: ["0%", "12%"]  },
  { id: 4,  classes: "-top-[25%] right-[25%] w-[35vw] h-[35vw] bg-yellow-300 blur-[90px]",  duration: 1.4, delay: 0.5, repeatDelay: 2.5, xMove: ["0%", "-15%"] },

  // Bottom Left Cluster
  { id: 5,  classes: "-bottom-[15%] -left-[10%] w-[45vw] h-[45vw] bg-amber-500 blur-[100px]",  duration: 1.7, delay: 1.5, repeatDelay: 3,   xMove: ["0%", "20%"]  },
  { id: 6,  classes: "-bottom-[5%] left-[10%] w-[25vw] h-[25vw] bg-yellow-500 blur-[70px]",   duration: 1.2, delay: 2,   repeatDelay: 4,   xMove: ["0%", "-12%"] },
  { id: 7,  classes: "bottom-[15%] -left-[20%] w-[55vw] h-[55vw] bg-amber-400 blur-[130px]",  duration: 2.0, delay: 3,   repeatDelay: 2.5, xMove: ["0%", "25%"]  },
  { id: 8,  classes: "-bottom-[25%] left-[25%] w-[38vw] h-[38vw] bg-yellow-600 blur-[110px]", duration: 1.3, delay: 0.2, repeatDelay: 1.5, xMove: ["0%", "-10%"] },

  // Scattered Ambient Edges
  { id: 9,  classes: "top-[40%] -left-[10%] w-[28vw] h-[28vw] bg-yellow-400 blur-[80px]",    duration: 1.4, delay: 1.2, repeatDelay: 3.5, xMove: ["0%", "18%"]  },
  { id: 10, classes: "bottom-[40%] -right-[5%] w-[35vw] h-[35vw] bg-amber-600 blur-[110px]", duration: 1.2, delay: 3.5, repeatDelay: 1.5, xMove: ["0%", "-22%"] },
  { id: 11, classes: "-top-[30%] left-[30%] w-[40vw] h-[40vw] bg-yellow-200 blur-[100px]",   duration: 2.1, delay: 0.5, repeatDelay: 4,   xMove: ["0%", "15%"]  },
  { id: 12, classes: "-bottom-[30%] right-[30%] w-[45vw] h-[45vw] bg-amber-300 blur-[120px]",duration: 1.6, delay: 2.5, repeatDelay: 3,   xMove: ["0%", "-15%"] },

  // The "Sharp" Circles (Bright, but slowed down significantly)
  { id: 13, classes: "top-[20%] right-[20%] w-[25vw] h-[25vw] bg-yellow-50 blur-[30px]",  duration: 1.2, delay: 0,   repeatDelay: 2,   xMove: ["0%", "30%"]  },
  { id: 14, classes: "bottom-[25%] left-[15%] w-[28vw] h-[28vw] bg-yellow-50 blur-[40px]", duration: 1.3, delay: 1,   repeatDelay: 1.5, xMove: ["0%", "-25%"] },
  { id: 15, classes: "top-[50%] left-[5%] w-[25vw] h-[25vw] bg-yellow-100 blur-[25px]",   duration: 1.4, delay: 2,   repeatDelay: 3,   xMove: ["0%", "20%"]  },
  { id: 16, classes: "bottom-[10%] right-[40%] w-[26vw] h-[26vw] bg-yellow-100 blur-[35px]",duration: 1.2, delay: 0.5, repeatDelay: 2.5, xMove: ["0%", "-30%"] },
  { id: 17, classes: "top-[60%] right-[10%] w-[30vw] h-[30vw] bg-yellow-50 blur-[45px]",  duration: 1.5, delay: 1.5, repeatDelay: 3.5, xMove: ["0%", "28%"]  },
  { id: 18, classes: "top-[80%] left-[30%] w-[25vw] h-[25vw] bg-yellow-100 blur-[20px]",  duration: 1.3, delay: 2.5, repeatDelay: 4,   xMove: ["0%", "-25%"] },

  // Extra Fillers
  { id: 19, classes: "top-[5%] left-[50%] w-[35vw] h-[35vw] bg-yellow-500 blur-[90px]",  duration: 1.8, delay: 0.8, repeatDelay: 2.5, xMove: ["0%", "15%"]  },
  { id: 20, classes: "bottom-[5%] left-[50%] w-[40vw] h-[40vw] bg-yellow-400 blur-[100px]",duration: 1.9, delay: 1.2, repeatDelay: 3,   xMove: ["0%", "-15%"] },

  // Super Bright Intense Flares (No longer hyper-fast flashes)
  { id: 21, classes: "top-[35%] left-[45%] w-[15vw] h-[15vw] bg-white blur-[20px]",      duration: 1.2, delay: 0.3, repeatDelay: 1.8, xMove: ["0%", "35%"]  },
  { id: 22, classes: "bottom-[30%] right-[25%] w-[18vw] h-[18vw] bg-yellow-50 blur-[25px]",duration: 1.4, delay: 1.1, repeatDelay: 2.2, xMove: ["0%", "-30%"] },
  { id: 23, classes: "top-[75%] left-[65%] w-[12vw] h-[12vw] bg-white blur-[15px]",      duration: 1.3, delay: 2.1, repeatDelay: 3.0, xMove: ["0%", "40%"]  },
  { id: 24, classes: "top-[15%] left-[25%] w-[20vw] h-[20vw] bg-yellow-50 blur-[30px]",  duration: 1.5, delay: 0.7, repeatDelay: 2.6, xMove: ["0%", "-35%"] },
]

export default function LightGlare() {
  const refs = useRef([])

  useEffect(() => {
    const timelines = glares.map((glare, i) => {
      const el = refs.current[i]
      if (!el) return null

      // Initial state matching the original `initial` prop
      gsap.set(el, { opacity: 0.01, scale: 1, x: glare.xMove[0] })

      // The original `whileInView` animates opacity/scale as a pulse and moves x
      // from xMove[0] to xMove[1] over the full duration.
      // Since these glares are always visible inside the slide, we skip ScrollTrigger
      // and start the repeating animation immediately — functionally identical.
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: glare.repeatDelay,
        delay: glare.delay,
      })

      // x moves linearly from start to end while opacity/scale pulse
      tl.to(el, { x: glare.xMove[1], duration: glare.duration, ease: 'none' }, 0)
      tl.to(el, { opacity: 0.08, scale: 1.1, duration: glare.duration / 2, ease: 'power1.inOut' }, 0)
      tl.to(el, { opacity: 0.01, scale: 1,   duration: glare.duration / 2, ease: 'power1.inOut' }, glare.duration / 2)

      return tl
    }).filter(Boolean)

    return () => timelines.forEach(tl => tl.kill())
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
      {glares.map((glare, i) => (
        <div
          key={glare.id}
          ref={el => refs.current[i] = el}
          style={{ opacity: 0.01 }}
          className={`absolute rounded-full ${glare.classes}`}
        />
      ))}
    </div>
  )
}