'use client'

import { useState } from 'react'
import { Star, Check } from 'lucide-react'

const features = [
  'Enter monthly prize draws',
  'Track up to 5 Stableford scores',
  'Support a charity of your choice',
  'View draw results & winnings',
]

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function subscribe(plan: 'monthly' | 'yearly') {
    setLoading(plan)
    const res = await fetch('/api/subscriptions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">Subscribe to unlock all features and enter monthly draws.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly */}
        <div className="card-flat rounded-2xl p-8">
          <div className="text-3xl font-black text-slate-900 mb-1">£9.99</div>
          <div className="text-gray-500 text-sm mb-6">/month</div>
          <div className="font-bold text-slate-900 text-lg mb-6">Monthly</div>
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="w-4 h-4 text-[#166534] shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button onClick={() => subscribe('monthly')} disabled={!!loading}
            className="btn-primary w-full py-3 rounded-xl font-bold disabled:opacity-50">
            {loading === 'monthly' ? 'Redirecting...' : 'Subscribe Monthly'}
          </button>
        </div>

        {/* Yearly */}
        <div className="rounded-2xl p-8 bg-[#166534] text-[#0B0F19]">
          <div className="flex items-center gap-1 mb-4">
            <Star className="w-4 h-4" fill="currentColor" />
            <span className="text-sm font-bold">Best Value — Save 25%</span>
          </div>
          <div className="text-3xl font-black mb-1">£89.99</div>
          <div className="text-[#0B0F19]/70 text-sm mb-6">/year</div>
          <div className="font-bold text-lg mb-6">Yearly</div>
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button onClick={() => subscribe('yearly')} disabled={!!loading}
            className="w-full py-3 rounded-xl font-bold bg-slate-50 text-[#166534] hover:bg-[#1E293B] transition-colors disabled:opacity-50">
            {loading === 'yearly' ? 'Redirecting...' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  )
}
