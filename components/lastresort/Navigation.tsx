'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { Badge } from '@/components/ui/badge'
import { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

interface NavigationProps {
  user: User
  profile: {
    username: string
    is_admin: boolean
  } | null
}

const navigationItems = [
  { name: 'Dashboard', href: '/lastresort/dashboard', icon: '📊', description: 'View your competitions' },
  { name: 'Active', href: '/lastresort/competitions/active', icon: '🏆', description: 'Browse active challenges' },
  { name: 'Past', href: '/lastresort/competitions/past', icon: '📚', description: 'View completed competitions' },
  { name: 'Submissions', href: '/lastresort/submissions', icon: '📝', description: 'Track your progress' },
]

const adminItems = [
  { name: 'Admin', href: '/lastresort/admin', icon: '⚡', description: 'Admin dashboard' },
  { name: 'Competitions', href: '/lastresort/admin/competitions', icon: '🎯', description: 'Manage competitions' },
  { name: 'Reviews', href: '/lastresort/admin/review', icon: '✅', description: 'Review submissions' },
]

export function Navigation({ user, profile }: NavigationProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50' 
          : 'bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/30'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              {/* Logo */}
              <Link 
                href="/lastresort/dashboard" 
                className="flex items-center space-x-3 hover-lift group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-lg">LR</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent tracking-wide">
                    LastResort
                  </h1>
                  <p className="text-xs text-gray-400 -mt-1 font-light">AI Testing Platform</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {navigationItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative px-3 py-2 rounded-lg font-light text-sm transition-all duration-300 hover-lift ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-md border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 w-6 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-purple-500/50"></div>
                      )}
                    </Link>
                  )
                })}

                {/* Admin Items */}
                {profile?.is_admin && (
                  <div className="ml-4 pl-4 border-l border-gray-200 flex space-x-1">
                    {adminItems.map((item, index) => {
                      const isActive = pathname === item.href || (item.href !== '/lastresort/admin' && pathname.startsWith(item.href))
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group relative px-3 py-2 rounded-lg font-light text-sm transition-all duration-300 hover-lift ${
                            isActive
                              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 shadow-md border border-red-500/30'
                              : 'text-red-300 hover:text-red-200 hover:bg-red-900/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          {isActive && (
                            <div className="absolute -bottom-1 left-1/2 w-6 h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-red-500/50"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-light text-white">
                    {profile?.username || user.email}
                  </div>
                  <div className="text-xs text-gray-400 font-light">Welcome back! ✨</div>
                </div>
                {profile?.is_admin && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                    Admin
                  </Badge>
                )}
              </div>
              
              <LogoutButton />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-6 space-y-2 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
            {/* User info mobile */}
            <div className="mb-4 p-3 bg-gray-800 rounded-xl">
              <div className="font-light text-white">{profile?.username || user.email}</div>
              {profile?.is_admin && (
                <Badge className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                  Administrator
                </Badge>
              )}
            </div>

            {/* Navigation items */}
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-4 rounded-xl font-light transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-md border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-light">{item.name}</div>
                      <div className="text-sm text-gray-400 font-light">{item.description}</div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Admin items mobile */}
            {profile?.is_admin && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-light text-gray-400 uppercase tracking-wide mb-2 px-4">
                  Administration
                </div>
                {adminItems.map((item, index) => {
                  const isActive = pathname === item.href || (item.href !== '/lastresort/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-4 rounded-xl font-light transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 shadow-md border border-red-500/30'
                          : 'text-red-300 hover:text-red-200 hover:bg-red-900/30'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="font-light">{item.name}</div>
                          <div className="text-sm text-gray-400 font-light">{item.description}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Spacer for fixed navigation */}
      <div className="h-20"></div>
    </>
  )
}