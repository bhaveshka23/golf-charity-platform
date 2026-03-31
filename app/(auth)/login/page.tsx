'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/hero-golf-sunrise.jpg" 
          alt="Premium Golf Course Sunrise" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/70 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-[#D4AF37] hover:text-[#B3922D] transition-colors">GolfGives</Link>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight">Welcome back</h1>
          <p className="text-slate-200 mt-2 font-medium">Sign in to your account</p>
        </div>
        <div className="card-flat rounded-3xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-white/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534] transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-base disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{' '}
            <Link href="/signup" className="text-[#166534] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
