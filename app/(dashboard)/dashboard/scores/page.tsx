'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Score } from '@/types'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [editId, setEditId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')
  const [editDate, setEditDate] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function fetchScores() {
    setFetchError('')
    try {
      const res = await fetch('/api/scores')
      if (res.ok) {
        const data = await res.json()
        setScores(Array.isArray(data) ? data : [])
      } else {
        const d = await res.json()
        setFetchError(d.error || 'Failed to load scores')
      }
    } catch {
      setFetchError('Network error. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchScores() }, [])

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(newScore), date: newDate }),
      })
      if (res.ok) {
        setNewScore('')
        await fetchScores()
      } else {
        const d = await res.json()
        setSubmitError(d.error || 'Failed to add score')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/scores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: Number(editScore), date: editDate }),
    })
    if (res.ok) { setEditId(null); await fetchScores() }
  }

  async function deleteScore(id: string) {
    await fetch(`/api/scores/${id}`, { method: 'DELETE' })
    await fetchScores()
  }

  const noSubscription = fetchError.toLowerCase().includes('subscription') ||
    submitError.toLowerCase().includes('subscription')

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Scores</h1>
        <p className="text-gray-500 mt-1">
          Track your last 5 Stableford scores (1–45). The oldest is replaced automatically.
        </p>
      </div>

      {noSubscription && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium text-sm">Active subscription required</p>
            <p className="text-amber-400/70 text-xs mt-0.5">Subscribe to add and track your scores.</p>
          </div>
          <Link href="/dashboard/subscribe" className="btn-primary px-4 py-2 rounded-lg text-sm shrink-0">Subscribe</Link>
        </div>
      )}

      <div className="card-flat rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Score</h2>
        <form onSubmit={addScore} className="flex gap-3 flex-wrap">
          <input
            type="number" min={1} max={45} value={newScore}
            onChange={(e) => setNewScore(e.target.value)} required placeholder="Score (1–45)"
            className="flex-1 min-w-[120px] bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534] transition-colors"
          />
          <input
            type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required
            className="flex-1 min-w-[140px] bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#166534] transition-colors"
          />
          <button type="submit" disabled={submitting}
            className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </form>
        {submitError && !noSubscription && <p className="text-red-400 text-sm mt-3">{submitError}</p>}
        <p className="text-gray-600 text-xs mt-3">{scores.length}/5 scores stored</p>
      </div>

      <div className="card-flat rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Scores</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : fetchError && !noSubscription ? (
          <p className="text-red-400 text-sm">{fetchError}</p>
        ) : scores.length === 0 ? (
          <p className="text-gray-600 text-sm">No scores yet. Add your first score above.</p>
        ) : (
          <div className="space-y-1">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                {editId === s.id ? (
                  <>
                    <input type="number" min={1} max={45} value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="w-24 bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none" />
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                      className="flex-1 bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none" />
                    <button onClick={() => saveEdit(s.id)} className="text-emerald-400 hover:text-emerald-300 p-1"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-slate-900 p-1"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <div className="score-ball shrink-0">{s.score}</div>
                    <div className="flex-1">
                      <div className="text-slate-900 font-medium">{s.score} pts</div>
                      <div className="text-gray-500 text-sm">
                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <button onClick={() => { setEditId(s.id); setEditScore(String(s.score)); setEditDate(s.date) }}
                      className="text-gray-500 hover:text-[#166534] transition-colors p-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteScore(s.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
