'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Charity } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)
  const [charities, setCharities] = useState<Charity[]>([])
  const [charitiesLoading, setCharitiesLoading] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch charities from the public API route (no auth required)
  useEffect(() => {
    fetch('/api/charities')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCharities(data)
      })
      .finally(() => setCharitiesLoading(false))
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create the account via API
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, charityId, charityPercentage: charityPct }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Signup failed')
      setLoading(false)
      return
    }

    // 2. Sign in client-side so the session cookie is set properly
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError('Account created but sign-in failed. Please log in manually.')
      setLoading(false)
      router.push('/login')
      return
    }

    router.push('/dashboard/subscribe')
    router.refresh()
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
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight">Create your account</h1>
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${step >= s ? 'bg-[#D4AF37]' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        <div className="card-flat rounded-3xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-white/20">
          <form
            onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSignup}
            className="space-y-5"
          >
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]"
                    placeholder="Min 8 characters"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 rounded-xl text-base">
                  Continue
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Choose a Charity</label>
                  {charitiesLoading ? (
                    <div className="text-gray-600 text-sm py-4 text-center">Loading charities...</div>
                  ) : charities.length === 0 ? (
                    <div className="text-gray-600 text-sm py-4 text-center">No charities available yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {charities.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            charityId === c.id ? 'border-[#166534] bg-[#166534]/10' : 'border-slate-200 hover:border-white/30'
                          }`}
                        >
                          <input
                            type="radio" name="charity" value={c.id}
                            checked={charityId === c.id} onChange={() => setCharityId(c.id)}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="text-slate-900 font-medium text-sm">{c.name}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{c.description}</div>
                          </div>
                          {charityId === c.id && (
                            <div className="w-4 h-4 rounded-full bg-[#166534] shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Charity Contribution: <span className="text-[#166534] font-bold">{charityPct}%</span>
                  </label>
                  <input
                    type="range" min={10} max={50} value={charityPct}
                    onChange={(e) => setCharityPct(Number(e.target.value))}
                    className="w-full accent-[#166534]"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>10% (min)</span><span>50%</span>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button" onClick={() => setStep(1)}
                    className="flex-1 border border-white/20 text-slate-900 py-3 rounded-xl hover:bg-white shadow-md shadow-black/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !charityId || charitiesLoading}
                    className="flex-1 btn-primary py-3 rounded-xl disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#166534] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
