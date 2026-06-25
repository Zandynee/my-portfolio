import React, { useState, useEffect } from 'react'
import gsap from 'gsap'

// The exact binary mapping for the word "PORTFOLIO".
const baseMessage = [
  "00000000000000000000000000000000000000000",
  "011100011001110011101111001100100001001100",
  "010010100101001001001000010010100001010010",
  "011100100101110001001110010010100001010010",
  "010000100101010001001000010010100001010010",
  "010000011001001001001000001100111101001100",
  "00000000000000000000000000000000000000000",
]

// Add 20 columns of blank space so there's a clear break before the word loops back.
const LOOP_DELAY_SPACE = 20
const signPattern = baseMessage.map((row) => row + '0'.repeat(LOOP_DELAY_SPACE))

const INTERVAL_MS  = 120  // one "pixel shift" every 120 ms
const DISPLAY_COLS = 50   // 50 dots × (1.5vw + 0.5vw gap) = 100vw

export default function RoadDisplayOverlay() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    // gsap.ticker fires on every animation frame and passes deltaTime in ms.
    // We accumulate delta until we've hit the desired interval, then advance
    // the offset — this is frame-rate-independent and slightly smoother than
    // setInterval which can drift under heavy load.
    let accumulated = 0

    const tick = (_time, deltaTime) => {
      accumulated += deltaTime
      // Use `while` so a long frame (e.g. tab wake) catches up correctly
      while (accumulated >= INTERVAL_MS) {
        accumulated -= INTERVAL_MS
        setOffset((prev) => (prev + 1) % signPattern[0].length)
      }
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center mix-blend-screen opacity-50">
      <div className="flex flex-col gap-[0.5vw]">
        {signPattern.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[0.5vw]">
            {Array.from({ length: DISPLAY_COLS }).map((_, colIndex) => {
              const dataIndex = (colIndex + offset) % row.length
              const isLit = row[dataIndex] === '1'

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-[1.5vw] h-[1.5vw] rounded-full transition-colors duration-[75ms] ${
                    isLit
                      ? 'bg-amber-400 shadow-[0_0_35px_#fbbf24]'
                      : 'bg-zinc-800/30 shadow-inner'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}