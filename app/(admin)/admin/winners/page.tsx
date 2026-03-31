'use client'

import { useState, useEffect } from 'react'
import type { Winner } from '@/types'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<(Winner & { users?: { name: string; email: string }; draws?: { draw_month: string } })[]>([])

  async function fetchWinners() {
    const res = await fetch('/api/admin/winners')
    if (res.ok) setWinners(await res.json())
  }

  useEffect(() => { fetchWinners() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/winners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchWinners()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Winners Management</h1>
      <div className="card-flat rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {['User', 'Draw', 'Match', 'Prize', 'Proof', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {winners.map((w) => (
              <tr key={w.id} className="border-b border-slate-100 hover:bg-white shadow-md shadow-black/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-slate-900 font-medium">{w.users?.name}</div>
                  <div className="text-gray-600 text-xs">{w.users?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{w.draws?.draw_month}</td>
                <td className="px-4 py-3 text-slate-900">{w.match_count}-Match</td>
                <td className="px-4 py-3 text-[#166534] font-bold">£{Number(w.prize_amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">View</a>
                  ) : <span className="text-gray-600 text-xs">None</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    w.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400'
                    : w.status === 'approved' ? 'bg-blue-500/20 text-blue-400'
                    : w.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                  }`}>{w.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(w.id, 'approved')} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors">Approve</button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors">Reject</button>
                      </>
                    )}
                    {w.status === 'approved' && (
                      <button onClick={() => updateStatus(w.id, 'paid')} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors">Mark Paid</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
