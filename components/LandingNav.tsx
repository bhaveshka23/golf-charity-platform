'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`w-8 h-8 rounded-lg ${scrolled ? 'bg-[#166534] text-white' : 'bg-white text-[#166534]'} flex items-center justify-center text-sm font-black group-hover:scale-105 transition-all`}>G</div>
          <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>GolfGives</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className={`text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-white/90'} hover:text-[#166534] transition-colors relative group`}>
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#166534] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/charities" className={`text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-white/90'} hover:text-[#166534] transition-colors relative group`}>
            Charities
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#166534] transition-all group-hover:w-full"></span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className={`text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-white/90'} hover:text-[#166534] transition-colors`}>Sign In</Link>
          <Link href="/signup" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hidden sm:block">Subscribe</Link>
        </div>
      </div>
    </nav>
  )
}
