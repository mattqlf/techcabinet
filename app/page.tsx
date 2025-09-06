'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [particles, setParticles] = useState<Array<{x: number, y: number, speed: number, size: number}>>([])
  const heroRef = useRef<HTMLElement>(null)
  const foundersRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsLoaded(true)
    
    // Generate fewer particles for better performance
    const generatedParticles = Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.1 + Math.random() * 0.2,
      size: 1 + Math.random() * 2
    }))
    setParticles(generatedParticles)
    
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }


    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white min-h-screen overflow-x-hidden relative">
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
      {/* Starfield background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isLoaded && Array.from({ length: 80 }, (_, i) => {
          const x = Math.random() * 100
          const y = Math.random() * 100
          const size = Math.random() * 1.5 + 0.5
          const opacity = Math.random() * 0.6 + 0.3
          return (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity * 0.8,
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          )
        })}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background grid with nebula effect */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `translate(${scrollY * 0.5}px, ${scrollY * 0.3}px)`,
            }}
          />
          {/* Nebula effects */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Simplified floating particles */}
        {isLoaded && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute bg-white/20 rounded-full will-change-transform"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `translateY(${scrollY * particle.speed}px)`,
              opacity: Math.max(0.2, 0.6 - (scrollY * 0.0008)),
            }}
          />
        ))}

        {/* Main content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          <div 
            className="transform will-change-transform"
            style={{ 
              transform: `translateY(${scrollY * 0.5}px) scale(${1 - scrollY * 0.0003}) rotateX(${scrollY * 0.02}deg)`,
              opacity: Math.max(0, 1 - scrollY * 0.003),
              transition: isLoaded ? 'none' : 'all 2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Logo and Title */}
              <div 
                className="flex items-center space-x-8"
                style={{
                  transform: `translateY(${scrollY * 0.2}px)`,
                  opacity: Math.max(0, 1 - scrollY * 0.002)
                }}
              >
                {/* Favicon Logo */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-gray-500/10 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                  <Image
                    src="/techcabinet-favicon.png"
                    alt="TechCabinet"
                    width={120}
                    height={120}
                    className="relative z-10 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* TechCabinet Text */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none">
                  <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent font-extralight tracking-wide">
                    TechCabinet
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            style={{ opacity: Math.max(0, 1 - scrollY * 0.01) }}
          >
            <div className="flex flex-col items-center space-y-2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 tracking-wide">SCROLL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section 
        ref={foundersRef} 
        className="relative min-h-screen flex items-center py-32"
        style={{
          transform: `translateY(${scrollY > 500 ? (scrollY - 500) * -0.1 : 0}px)`,
        }}
      >
        {/* Simplified background elements */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-full blur-3xl will-change-transform"
            style={{ 
              transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.03}px)`,
              opacity: Math.max(0.1, 0.4 - scrollY * 0.0005)
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-full blur-3xl will-change-transform"
            style={{ 
              transform: `translate(${scrollY * -0.04}px, ${scrollY * 0.02}px)`,
              opacity: Math.max(0.1, 0.4 - scrollY * 0.0005)
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div 
            className="text-center mb-20"
            style={{
              opacity: scrollY > 300 ? Math.min(1, (scrollY - 300) / 200) : 0,
              transform: `translateY(${scrollY > 300 ? Math.max(0, 50 - (scrollY - 300) * 0.2) : 50}px)`,
            }}
          >
            <h2 className="text-7xl md:text-8xl font-thin mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                The Team
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Two CMU CS majors with a passion for building innovative solutions that matter.
            </p>
          </div>

          <div 
            className="flex justify-center items-center space-x-32"
            style={{
              opacity: scrollY > 500 ? Math.min(1, (scrollY - 500) / 300) : 0,
              transform: `translateY(${scrollY > 500 ? Math.max(0, 100 - (scrollY - 500) * 0.3) : 100}px)`,
            }}
          >
            {/* Matthew Li */}
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border border-gray-700 group-hover:border-white/30 transition-all duration-500">
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-6xl font-light text-gray-300">M</span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </div>
              <h3 className="text-2xl font-light text-gray-300 group-hover:text-white transition-colors">
                Matthew Li
              </h3>
              <a 
                href="mailto:mqli@andrew.cmu.edu" 
                className="text-gray-500 hover:text-purple-400 transition-colors duration-300 font-light text-sm block mt-2 underline underline-offset-4"
              >
                mqli@andrew.cmu.edu
              </a>
            </div>

            {/* Michael Li */}
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border border-gray-700 group-hover:border-white/30 transition-all duration-500">
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-6xl font-light text-gray-300">M</span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </div>
              <h3 className="text-2xl font-light text-gray-300 group-hover:text-white transition-colors">
                Michael Li
              </h3>
              <a 
                href="mailto:mdli2@andrew.cmu.edu" 
                className="text-gray-500 hover:text-cyan-400 transition-colors duration-300 font-light text-sm block mt-2 underline underline-offset-4"
              >
                mdli2@andrew.cmu.edu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section 
        ref={projectsRef} 
        className="relative min-h-screen flex items-center py-32"
      >
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
              backgroundSize: '100px 100px',
              transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.02}px)`,
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div 
            className="text-center mb-24"
            style={{
              opacity: scrollY > 1200 ? Math.min(1, (scrollY - 1200) / 200) : 0,
              transform: `translateY(${scrollY > 1200 ? Math.max(0, 50 - (scrollY - 1200) * 0.15) : 50}px)`,
            }}
          >
            <h2 className="text-7xl md:text-8xl font-thin mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Our Work
              </span>
            </h2>
          </div>

          <div 
            className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto"
            style={{
              opacity: scrollY > 1400 ? Math.min(1, (scrollY - 1400) / 300) : 0,
              transform: `translateY(${scrollY > 1400 ? Math.max(0, 80 - (scrollY - 1400) * 0.2) : 80}px)`,
            }}
          >
            {/* LastResort */}
            <Link href="/lastresort" className="group block">
              <div className="relative h-96 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl overflow-hidden hover:border-gray-600/50 transition-all duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative h-full p-12 flex flex-col justify-between">
                  <div className="flex items-center space-x-4 mb-8">
                    <Image
                      src="/lastresort-logo.svg"
                      alt="LastResort"
                      width={48}
                      height={48}
                      className="group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-4xl font-light group-hover:text-purple-400 transition-colors duration-500">
                      LastResort
                    </h3>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light">
                      AI challenge platform where creativity meets artificial intelligence. 
                      Create problems that push the boundaries of what AI can solve.
                    </p>
                    
                    <div className="flex items-center text-gray-500 group-hover:text-white transition-colors duration-500">
                      <span className="font-light tracking-wide">EXPLORE PLATFORM</span>
                      <svg className="w-4 h-4 ml-4 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* LockinPls */}
            <Link href="/lockinpls" className="group block">
              <div className="relative h-96 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl overflow-hidden hover:border-gray-600/50 transition-all duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative h-full p-12 flex flex-col justify-between">
                  <div className="flex items-center space-x-4 mb-8">
                    <Image
                      src="/downloads/lockinpls-icon.png"
                      alt="LockinPls"
                      width={48}
                      height={48}
                      className="rounded-xl group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-4xl font-light group-hover:text-blue-400 transition-colors duration-500">
                      LockinPls
                    </h3>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light">
                      AI-powered focus companion that intelligently monitors your workflow. 
                      Stay locked in on what matters with smart distraction detection.
                    </p>
                    
                    <div className="flex items-center text-gray-500 group-hover:text-white transition-colors duration-500">
                      <span className="font-light tracking-wide">DOWNLOAD APP</span>
                      <svg className="w-4 h-4 ml-4 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/30 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 font-light tracking-wide">
            © 2025 TechCabinet
          </p>
        </div>
      </footer>
    </div>
  )
}