'use client'

export function StarfieldBackground() {
  return (
    <>
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
      
      {/* Starfield background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }, (_, i) => {
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
      
      {/* Nebula effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </>
  )
}