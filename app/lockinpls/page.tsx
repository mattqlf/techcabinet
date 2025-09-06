import Image from 'next/image'
import Link from 'next/link'
import { StarfieldBackground } from '@/components/lockinpls/StarfieldBackground'

export const metadata = {
  title: 'lockinpls',
  description: 'Download LockinPls, an AI-powered focus tracking app that monitors your screen activity and helps you stay focused on your work tasks.'
}

export default function LockinPlsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <StarfieldBackground />

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-12 transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TechCabinet
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-20">
            {/* App Icon and Title */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-8 group">
                <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-gray-500/10 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image
                    src="/downloads/lockinpls-icon.png"
                    alt="LockinPls App Icon"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black mb-6">
                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent font-extralight tracking-wide">
                  LockinPls
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl font-light">
                AI-powered focus companion that keeps you locked in on what matters
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Smart distraction detection
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Voice reminders
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Focus analytics
                </span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              {/* macOS Download */}
              <Link
                href="/downloads/LockinPls-1.0.dmg"
                className="group relative"
                download
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-white to-gray-300 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-gray-50 transition-all transform hover:scale-105">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div>Download for macOS</div>
                    <div className="text-sm font-normal text-gray-600">Version 1.0 • 2.1 MB</div>
                  </div>
                </div>
              </Link>

              {/* Windows Coming Soon */}
              <div className="group relative opacity-60 cursor-not-allowed">
                <div className="relative bg-gray-800 text-gray-400 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 border border-gray-700">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.21V13zm17 .25V22l-10-1.91V13.1l10 .15z"/>
                  </svg>
                  <div className="text-left">
                    <div>Windows Coming Soon</div>
                    <div className="text-sm font-normal text-gray-500">In development</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="group">
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3">Smart Monitoring</h3>
                <p className="text-gray-400 leading-relaxed flex-grow font-light">
                  AI analyzes your screen to detect when you're focused or distracted from your work tasks
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 14h14l-2-14M11 9v4M13 9v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3">Gentle Reminders</h3>
                <p className="text-gray-400 leading-relaxed flex-grow font-light">
                  Get voice notifications and visual cues to help you get back on track when you drift away
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3">Focus Analytics</h3>
                <p className="text-gray-400 leading-relaxed flex-grow font-light">
                  Track your focus patterns and see detailed statistics about your productivity sessions
                </p>
              </div>
            </div>
          </div>

          {/* Video Demo Section */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-light mb-8">See It in Action</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-800/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl"></div>
                <div className="relative flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light mb-4">Demo Video Coming Soon</h3>
                  <p className="text-gray-400 max-w-lg font-light">
                    Watch how LockinPls intelligently detects distractions and helps you maintain focus throughout your workday
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Setup */}
          <div className="text-center">
            <h2 className="text-3xl font-light mb-8">Simple Setup</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold">1</div>
                <span>Download & Install</span>
              </div>
              <div className="hidden md:block text-gray-600">→</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold">2</div>
                <span>Grant Permissions</span>
              </div>
              <div className="hidden md:block text-gray-600">→</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold">3</div>
                <span>Start Focusing</span>
              </div>
            </div>
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
              LockinPls needs screen recording and accessibility permissions to monitor your focus. No external accounts or API keys required.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}