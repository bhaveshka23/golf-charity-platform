'use client'

import { useState, useEffect } from 'react'
import { Upload, Trophy, Loader2 } from 'lucide-react'
import type { Winner } from '@/types'

function ProofUploader({ winnerId, onUploaded }: { winnerId: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('winner_id', winnerId)
    await fetch('/api/winners/upload-proof', { method: 'POST', body: fd })
    setUploading(false)
    onUploaded()
    // reset input
    e.target.value = ''
  }

  return (
    <label className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer w-fit disabled:opacity-50">
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      {uploading ? 'Uploading...' : 'Upload Proof'}
      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} disabled={uploading} />
    </label>
  )
}

export default function WinningsPage() {
  const [winners, setWinners] = useState<(Winner & { draws?: { draw_month: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchWinnings() {
    try {
      const res = await fetch('/api/user/winnings')
      if (res.ok) {
        const data = await res.json()
        setWinners(Array.isArray(data) ? data : [])
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to load winnings')
      }
    } catch {
      setError('Network error. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWinnings() }, [])

  const totalWon = winners.reduce((s, w) => s + Number(w.prize_amount), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#166534] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Winnings</h1>
        <p className="text-gray-500 mt-1">
          Total won:{' '}
          <span className="text-[#166534] font-bold">£{totalWon.toFixed(2)}</span>
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
      )}

      {winners.length === 0 && !error ? (
        <div className="card-flat rounded-2xl p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No winnings yet. Keep entering draws!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((w) => (
            <div key={w.id} className="card-flat rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-slate-900 font-bold text-lg">{w.match_count}-Number Match</div>
                  {w.draws?.draw_month && (
                    <div className="text-gray-600 text-sm mt-0.5">Draw: {w.draws.draw_month}</div>
                  )}
                  <div className="text-[#166534] text-2xl font-black mt-1">
                    £{Number(w.prize_amount).toFixed(2)}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  w.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400'
                  : w.status === 'approved' ? 'bg-blue-500/20 text-blue-400'
                  : w.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                </span>
              </div>

              {/* Status guidance */}
              {w.status === 'pending' && !w.proof_url && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-gray-500 text-sm mb-3">
                    Upload a screenshot of your scores from your golf platform to verify your win.
                  </p>
                  <ProofUploader winnerId={w.id} onUploaded={fetchWinnings} />
                </div>
              )}

              {w.status === 'pending' && w.proof_url && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-gray-500 text-sm">Proof submitted — awaiting admin review.</p>
                  <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#166534] text-sm hover:underline mt-1 inline-block">
                    View submitted proof →
                  </a>
                </div>
              )}

              {w.status === 'approved' && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-emerald-400 text-sm">✓ Approved — payment will be processed shortly.</p>
                </div>
              )}

              {w.status === 'rejected' && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-red-400 text-sm mb-2">Proof was rejected. Please re-upload a valid screenshot.</p>
                  <ProofUploader winnerId={w.id} onUploaded={fetchWinnings} />
                </div>
              )}

              {w.status === 'paid' && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-emerald-400 text-sm">✓ Payment completed.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
