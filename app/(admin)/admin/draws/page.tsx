'use client'

import { useState, useEffect } from 'react'
import type { Draw } from '@/types'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random')
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)

  async function fetchDraws() {
    // Admin needs all draws including unpublished
    const res = await fetch('/api/admin/draws')
    if (res.ok) setDraws(await res.json())
  }

  useEffect(() => { fetchDraws() }, [])

  async function generateDraw() {
    setLoading(true)
    const res = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draw_month: month, mode }),
    })
    if (res.ok) fetchDraws()
    setLoading(false)
  }

  async function publishDraw(id: string) {
    setPublishing(id)
    await fetch(`/api/draws/${id}/publish`, { method: 'POST' })
    fetchDraws()
    setPublishing(null)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Draw Management</h1>

      {/* Generate */}
      <div className="card-flat rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Generate New Draw</h2>
        <div className="flex gap-4 flex-wrap">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#166534]" />
          <select value={mode} onChange={(e) => setMode(e.target.value as 'random' | 'algorithmic')}
            className="bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#166534]">
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic (score-weighted)</option>
          </select>
          <button onClick={generateDraw} disabled={loading} className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Draw'}
          </button>
        </div>
      </div>

      {/* Draws list */}
      <div className="space-y-4">
        {draws.map((draw) => (
          <div key={draw.id} className="card-flat rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 font-bold">{draw.draw_month}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${draw.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {draw.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {!draw.published && (
                <button onClick={() => publishDraw(draw.id)} disabled={publishing === draw.id}
                  className="btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                  {publishing === draw.id ? 'Publishing...' : 'Publish & Run Draw'}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].map((n, i) => (
                <div key={i} className="score-ball">{n}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
