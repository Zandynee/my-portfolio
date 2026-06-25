import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

// TAILWIND SAFELIST: Tailwind needs to "see" these exact class names in the code
// so it doesn't purge them during the build process.
const safelist = "bg-amber-300 bg-amber-400 bg-amber-500 bg-amber-600 bg-amber-700 bg-amber-800 bg-amber-900 bg-amber-950 bg-purple-300 bg-purple-400 bg-purple-500 bg-purple-600 bg-purple-700 bg-purple-800 bg-purple-900 bg-purple-950"

// Defined outside the component — same reason as before.
// The neutral colors (like bg-neutral-600) are intentionally not replaced!
const motionDivs1 = [
  { delay: 0.4,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.41, duration: 0.5, bgColor: 'bg-blue-900',    size: 'h-[20px]'  },
  { delay: 0.3,  duration: 0.6, bgColor: 'bg-blue-600',    size: 'h-[102px]' },
  { delay: 0.5,  duration: 0.8, bgColor: 'bg-blue-300',    size: 'h-[42px]'  },
  { delay: 0.3,  duration: 0.5, bgColor: 'bg-blue-600',    size: 'h-[272px]' },
  { delay: 0.5,  duration: 0.7, bgColor: 'bg-blue-300',    size: 'h-[132px]' },
  { delay: 0.4,  duration: 0.8, bgColor: 'bg-blue-600',    size: 'h-[72px]'  },
  { delay: 0.3,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[55px]'  },
  { delay: 0.54, duration: 0.1, bgColor: 'bg-blue-600',    size: 'h-[12px]'  },
  { delay: 0.5,  duration: 0.2, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.2,  duration: 0.6, bgColor: 'bg-blue-950',    size: 'h-[150px]' },
  { delay: 0.3,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[55px]'  },
  { delay: 0.4,  duration: 0.5, bgColor: 'bg-blue-800',    size: 'h-[120px]' },
  { delay: 1.1,  duration: 0.4, bgColor: 'bg-neutral-600', size: 'h-[22px]'  },
  { delay: 0.7,  duration: 0.3, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.2,  duration: 0.5, bgColor: 'bg-blue-900',    size: 'h-[180px]' },
  { delay: 0.8,  duration: 0.4, bgColor: 'bg-neutral-600', size: 'h-[82px]'  },
  { delay: 0.4,  duration: 0.6, bgColor: 'bg-blue-400',    size: 'h-[200px]' },
  { delay: 0.5,  duration: 0.5, bgColor: 'bg-blue-600',    size: 'h-[150px]' },
  { delay: 0.3,  duration: 0.8, bgColor: 'bg-blue-950',    size: 'h-[220px]' },
  { delay: 0.4,  duration: 0.7, bgColor: 'bg-blue-500',    size: 'h-[90px]'  },
  { delay: 0.6,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[40px]'  },
  { delay: 0.3,  duration: 0.6, bgColor: 'bg-blue-800',    size: 'h-[170px]' },
]

const motionDivs2 = [
  { delay: 0.4,  duration: 0.6, bgColor: 'bg-blue-950',    size: 'h-[100px]' },
  { delay: 0.8,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.3,  duration: 0.5, bgColor: 'bg-blue-900',    size: 'h-[122px]' },
  { delay: 0.1,  duration: 0.6, bgColor: 'bg-blue-600',    size: 'h-[272px]' },
  { delay: 0.2,  duration: 0.5, bgColor: 'bg-blue-800',    size: 'h-[150px]' },
  { delay: 0.2,  duration: 0.4, bgColor: 'bg-blue-300',    size: 'h-[272px]' },
  { delay: 1.2,  duration: 0.1, bgColor: 'bg-blue-600',    size: 'h-[72px]'  },
  { delay: 0.3,  duration: 0.5, bgColor: 'bg-blue-300',    size: 'h-[172px]' },
  { delay: 0.2,  duration: 0.7, bgColor: 'bg-neutral-900', size: 'h-[140px]' },
  { delay: 0.2,  duration: 0.8, bgColor: 'bg-blue-600',    size: 'h-[152px]' },
  { delay: 0.4,  duration: 0.5, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.4,  duration: 0.3, bgColor: 'bg-blue-600',    size: 'h-[42px]'  },
  { delay: 0.3,  duration: 0.6, bgColor: 'bg-blue-900',    size: 'h-[190px]' },
  { delay: 0.5,  duration: 0.5, bgColor: 'bg-blue-300',    size: 'h-[72px]'  },
  { delay: 0.6,  duration: 0.5, bgColor: 'bg-blue-600',    size: 'h-[172px]' },
  { delay: 0.2,  duration: 0.8, bgColor: 'bg-blue-950',    size: 'h-[200px]' },
  { delay: 0.7,  duration: 0.5, bgColor: 'bg-neutral-600', size: 'h-[132px]' },
  { delay: 0.8,  duration: 0.9, bgColor: 'bg-blue-600',    size: 'h-[72px]'  },
  { delay: 0.4,  duration: 0.5, bgColor: 'bg-blue-400',    size: 'h-[250px]' },
  { delay: 0.3,  duration: 0.7, bgColor: 'bg-blue-800',    size: 'h-[150px]' },
  { delay: 0.5,  duration: 0.4, bgColor: 'bg-blue-600',    size: 'h-[120px]' },
  { delay: 0.2,  duration: 0.9, bgColor: 'bg-neutral-950', size: 'h-[180px]' },
]

const allConfigs = [...motionDivs1, ...motionDivs2]

export default function TransitionWipe({ activeSlide, color = 'blue' }) {
  const containerRef = useRef(null)

  // Helper: only replaces "blue", leaving "neutral" intact
  const getDynamicColor = (baseClass) => baseClass.replace('blue', color)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const stripes = gsap.utils.toArray('.tw-stripe', containerRef.current)

      // gsap.fromTo immediately applies the "from" state to all elements,
      // matching framer-motion's behaviour of starting off-screen even before
      // each stripe's individual delay fires.
      gsap.fromTo(
        stripes,
        { x: '120.21vw', y: '226.6vh' },
        {
          x: '-321.25vw',
          y: '-226.6vh',
          ease: 'none',
          // Function-based values let each stripe use its own timing
          duration: (i) => allConfigs[i].duration,
          delay:    (i) => allConfigs[i].delay,
        }
      )
    }, containerRef)

    // ctx.revert() kills every tween created above and resets inline styles,
    // so re-running the effect on a new activeSlide starts clean.
    return () => ctx.revert()
  }, [activeSlide])

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">

      {/* Container 1 */}
      <div className="absolute inset-0 flex flex-col -top-[50vh]">
        {motionDivs1.map((div, i) => (
          <div key={`g1-${i}`} className="tw-stripe relative w-[300vw] shrink-0">
            <div className={`${getDynamicColor(div.bgColor)} skew-y-[30deg] w-full ${div.size}`} />
          </div>
        ))}
      </div>

      {/* Container 2 */}
      <div className="absolute inset-0 flex flex-col -top-[50vh]">
        {motionDivs2.map((div, i) => (
          <div key={`g2-${i}`} className="tw-stripe relative w-[300vw] shrink-0">
            <div className={`${getDynamicColor(div.bgColor)} skew-y-[30deg] w-full ${div.size}`} />
          </div>
        ))}
      </div>

    </div>
  )
}