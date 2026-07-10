import React from 'react'

export default function NebulaLine() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
      
      {/* Ambient Fog Line
        Stretched wide and kept thin to establish the linear flow
      */}
      <div 
        className="absolute w-[120%] h-[30vh] opacity-40 mix-blend-screen -rotate-12"
        style={{
          filter: 'blur(40px)',
          background: 'radial-gradient(ellipse at 40% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)'
        }}
      />

      {/* Main Nebula Body
        Flattened into a line (15vh). 
        The 0% mark is now strictly 'transparent' so the screen blend mode adds zero brightness to the core.
      */}
      <div 
        className="absolute w-[100%] h-[15vh] -rotate-12 opacity-80 mix-blend-screen" 
        style={{
          filter: 'blur(20px)',
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(79, 70, 229, 0.6) 25%, rgba(6, 182, 212, 0.4) 50%, transparent 80%)'
        }}
      />

      {/* Inner Dust Ring (The "Line")
        Very thin (3vh) to replace the original bright energy line. 
        It stays hollow up to 15% before peaking in color.
      */}
      <div 
        className="absolute w-[80%] h-[3vh] -rotate-12 mix-blend-screen"
        style={{
          filter: 'blur(8px)',
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 15%, rgba(99, 102, 241, 0.8) 30%, rgba(14, 165, 233, 0.4) 60%, transparent 85%)'
        }}
      />

      {/* Asymmetric Wisp 
        Slightly offset (translate-y-4) to make the line look like organic gas rather than a perfect laser
      */}
      <div 
        className="absolute w-[90%] h-[5vh] -rotate-12 opacity-60 mix-blend-screen translate-y-4"
        style={{
          filter: 'blur(12px)',
          background: 'radial-gradient(ellipse at 60% center, transparent 0%, rgba(236, 72, 153, 0.3) 20%, transparent 60%)'
        }}
      />
      
    </div>
  )
}