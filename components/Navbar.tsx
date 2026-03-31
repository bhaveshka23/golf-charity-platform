'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard, Target, Trophy, Heart, Settings, Award, Menu, X } from 'lucide-react'
import { useState } from 'react'
import type { User } from '@/types'

interface NavbarProps {
  user: User
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/scores', label: 'Scores', icon: Target },
  { href: '/dashboard/draws', label: 'Draws', icon: Trophy },
  { href: '/dashboard/charity', label: 'Charity', icon: Heart },
  { href: '/dashboard/winnings', label: 'Winnings', icon: Award },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b border-slate-200 bg-slate-50/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-[#166534] font-black text-xl shrink-0">
            GolfGives
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(href, exact)
                    ? 'bg-[#166534]/15 text-[#166534] font-medium'
                    : 'text-gray-500 hover:text-slate-900 hover:bg-white shadow-md shadow-black/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#166534]/15 text-[#166534] font-medium'
                    : 'text-[#166534]/70 hover:text-[#166534] hover:bg-[#166534]/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block truncate max-w-[140px]">{user.name}</span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-gray-500 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-white shadow-md shadow-black/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-500 hover:text-slate-900 p-1.5"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive(href, exact)
                  ? 'bg-[#166534]/15 text-[#166534] font-medium'
                  : 'text-gray-500 hover:text-slate-900 hover:bg-white shadow-md shadow-black/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#166534]/70 hover:text-[#166534] hover:bg-[#166534]/10 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          )}
          <div className="pt-2 border-t border-slate-200 mt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-slate-900 hover:bg-white shadow-md shadow-black/20 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
