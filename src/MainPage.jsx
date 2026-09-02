import React from 'react'
import { Link } from 'react-router-dom'

export default function MainPage() {
  return (
    <div className="bg-neutral-950 min-h-screen text-white font-sans flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 text-center">Mulat Adi Portfolio</h1>
     Portfolio showcasing skills, works, and projects.
      <Link to="/side-projects" className="text-blue-400 hover:text-blue-300 underline">
        Please check out my side projects!
      </Link>
      <h2 className='m-4 w-[80%] h2-left'>
        Projects
      </h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-[80%]'>
      
      {/* Project 1 */}
        <div className='bg-neutral-800 p-4 rounded-lg flex flex-col'>
          {/* WebM Video Player */}
          <video 
            className="w-full aspect-video object-cover rounded-md mb-4 bg-black "
            autoPlay 
            loop 
            muted 
            playsInline
          >
            {/* Replace with your actual file path in the public folder */}
            <source src="/src/assets/tc25.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>

          <Link to="https://web.archive.org/web/20251210024331/https://www.technocorner.id/" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noreferrer">
            <h2 className='text-xl font-semibold mb-2'>Technocorner 2025</h2>
          </Link>
          <p className='text-gray-400'>Contributed in building the website's frontend, specifically in animations</p>
        </div>

        {/* Project 2 */}
        <div className='bg-neutral-800 p-4 rounded-lg flex flex-col'>
          {/* WebM Video Player */}
          <video 
            className="w-full aspect-video object-cover rounded-md mb-4 bg-black"
            autoPlay 
            loop 
            muted 
            playsInline
          >
             {/* Replace with your actual file path in the public folder */}
            <source src="/src/assets/hmti.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>

          <Link to="https://hmti.web.ugm.ac.id/" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noreferrer">
            <h2 className='text-xl font-semibold mb-2'>Himpunan Mahasiswa Teknik Industri UGM</h2>
          </Link>
          <p className='text-gray-400'>Contributed in building the website's frontend, specifically in animations and updating since 2024</p>
        </div>
      </div>
     
      
    </div>
  )
}