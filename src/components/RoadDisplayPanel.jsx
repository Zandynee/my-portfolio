import React, { useState, useEffect } from 'react'

// The exact binary mapping for the word "PORTFOLIO".
const baseMessage = [
  "00000000000000000000000000000000000000000",
  "011100011001110011101111001100100001001100",
  "010010100101001001001000010010100001010010",
  "011100100101110001001110010010100001010010",
  "010000100101010001001000010010100001010010",
  "010000011001001001001000001100111101001100",
  "00000000000000000000000000000000000000000"
]

// Add 20 columns of blank space to the end of the word so there is 
// a clear break before the word loops back around.
const LOOP_DELAY_SPACE = 20;
const signPattern = baseMessage.map(row => row + "0".repeat(LOOP_DELAY_SPACE));

export default function RoadDisplayOverlay() {
  const [offset, setOffset] = useState(0);

  // We define exactly 50 physical dots to span the screen.
  // 50 dots * (1.5vw width + 0.5vw gap) = exactly 100vw screen width!
  const DISPLAY_COLS = 50;

  useEffect(() => {
    // This acts as the "clock speed" of your matrix board.
    // Every 120 milliseconds, the text shifts exactly one pixel to the left.
    const interval = setInterval(() => {
      setOffset((prevOffset) => (prevOffset + 1) % signPattern[0].length);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center mix-blend-screen opacity-50">
      
      <div className="flex flex-col gap-[0.5vw]">
        {signPattern.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[0.5vw]">
            
            {/* Instead of rendering the word, we render the fixed physical screen */}
            {Array.from({ length: DISPLAY_COLS }).map((_, colIndex) => {
              
              // We calculate what part of the message this specific dot should be showing
              // based on the current time offset.
              const dataIndex = (colIndex + offset) % row.length;
              const isLit = row[dataIndex] === '1';

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-[1.5vw] h-[1.5vw] rounded-full transition-colors duration-[75ms] ${
                    isLit 
                      // Lit state: Bright amber glow
                      ? "bg-amber-400 shadow-[0_0_35px_#fbbf24]" 
                      // Unlit state: Faint glass hardware grid (it stays visible now!)
                      : "bg-zinc-800/30 shadow-inner" 
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