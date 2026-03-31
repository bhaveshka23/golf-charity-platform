'use client'

import { useState, useEffect } from 'react'
import { Heart, Check, Loader2 } from 'lucide-react'
import type { Charity } from '@/types'

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [charitiesRes, profileRes] = await Promise.all([
          fetch('/api/charities'),
          fetch('/api/user/profile'),
        ])

        if (charitiesRes.ok) {
          const data = await charitiesRes.json()
          if (Array.isArray(data)) setCharities(data)
        }

        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile.charity_id) setSelectedId(profile.charity_id)
          if (profile.charity_percentage) setPercentage(Number(profile.charity_percentage))
        }
      } catch (err) {
        setError('Failed to load data. Please refresh.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function save() {
    if (!selectedId) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: selectedId, charity_percentage: percentage }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#166534] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Charity Settings</h1>
        <p className="text-gray-500 mt-1">Choose where your contribution goes and how much.</p>
      </div>

      <div className="card-flat rounded-2xl p-6 space-y-6">
        {/* Charity selection */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Select a Charity</h2>
          {charities.length === 0 ? (
            <p className="text-gray-600 text-sm">No charities available yet.</p>
          ) : (
            <div className="space-y-3">
              {charities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedId === c.id
                      ? 'border-[#166534] bg-[#166534]/10'
                      : 'border-slate-200 hover:border-white/30 hover:bg-white shadow-md shadow-black/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#166534]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-5 h-5 text-[#166534]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 font-semibold">{c.name}</div>
                    <div className="text-gray-500 text-sm mt-0.5 leading-relaxed">{c.description}</div>
                    <div className="text-[#166534] text-xs mt-1.5 font-medium">
                      £{Number(c.total_donations).toLocaleString()} raised
                    </div>
                  </div>
                  {selectedId === c.id && (
                    <Check className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Percentage slider */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">
            Contribution:{' '}
            <span className="text-[#166534] font-bold text-base">{percentage}%</span>{' '}
            <span className="text-gray-600">of your subscription fee</span>
          </label>
          <input
            type="range" min={10} max={50} step={1} value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full accent-[#166534] h-2 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1.5">
            <span>10% (minimum)</span>
            <span>50%</span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || !selectedId}
          className="btn-primary w-full py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
