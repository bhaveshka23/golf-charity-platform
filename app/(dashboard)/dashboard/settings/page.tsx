'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import type { Charity } from '@/types'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)
  
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      const [profRes, charRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/charities')
      ])
      
      if (profRes.ok) {
        const p = await profRes.json()
        setName(p.name || '')
        setCharityId(p.charity_id || '')
        setCharityPct(p.charity_percentage || 10)
      }
      if (charRes.ok) {
        setCharities(await charRes.json())
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, charity_id: charityId, charity_percentage: charityPct })
    })

    if (res.ok) {
      setMessage('Profile updated successfully.')
    } else {
      setMessage('Failed to update profile.')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#166534]" /></div>
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account details and charity preferences.</p>
      </div>

      <form onSubmit={handleSave} className="card-flat rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Display Name</label>
          <input 
            type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Preferred Charity</label>
          <select 
            value={charityId} onChange={(e) => setCharityId(e.target.value)} required
            className="w-full bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#166534]"
          >
            <option value="" disabled>Select a charity</option>
            {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Charity Contribution Percentage: <span className="text-[#166534] font-bold">{charityPct}%</span>
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

        {message && (
          <p className={`text-sm ${message.includes('successfully') ? 'text-emerald-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
