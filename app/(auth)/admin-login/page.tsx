'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
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
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Role check happens on the server in layout, but we can fast-redirect
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#166534]/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-[#166534]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Sign in to the management dashboard</p>
        </div>
        <div className="card-flat rounded-2xl p-8 border-[#166534]/30">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534] transition-colors"
                placeholder="admin@example.com"
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
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-slate-900 transition-colors">
              Return to Subscriber Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
