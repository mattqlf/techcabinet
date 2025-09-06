'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/lastresort/admin',
    icon: '📊'
  },
  {
    name: 'Competitions',
    href: '/lastresort/admin/competitions',
    icon: '🏆'
  },
  {
    name: 'Review Submissions',
    href: '/lastresort/admin/review',
    icon: '📝'
  },
  {
    name: 'Users',
    href: '/lastresort/admin/users',
    icon: '👥'
  }
]

const quickActions = [
  {
    name: 'Back to LastResort',
    href: '/lastresort/dashboard',
    icon: '⬅️'
  },
  {
    name: 'Live Competitions',
    href: '/lastresort/competitions/active',
    icon: '🔥'
  }
]

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border-r border-gray-800/50 shadow-xl">
      <div className="p-6">
        <h1 className="text-xl font-light bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Admin Panel</h1>
        <p className="text-sm text-gray-300 font-light mt-1">LastResort Platform</p>
      </div>

      <nav className="mt-6">
        <div className="px-6">
          <h2 className="text-xs font-light text-gray-400 uppercase tracking-wide">
            Administration
          </h2>
        </div>
        <div className="mt-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-light rounded-xl mx-3 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:backdrop-blur-sm'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 px-6">
          <h2 className="text-xs font-light text-gray-400 uppercase tracking-wide">
            Quick Access
          </h2>
        </div>
        <div className="mt-4 space-y-1">
          {quickActions.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-3 text-sm font-light text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300 rounded-xl mx-3 hover:backdrop-blur-sm"
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}