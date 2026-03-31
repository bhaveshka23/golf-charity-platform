'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import type { Charity } from '@/types'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  async function fetchCharities() {
    const res = await fetch('/api/charities')
    if (res.ok) setCharities(await res.json())
  }

  useEffect(() => { fetchCharities() }, [])

  async function addCharity(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc }),
    })
    setName(''); setDesc('')
    fetchCharities()
  }

  async function saveEdit(id: string) {
    await fetch(`/api/charities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDesc }),
    })
    setEditId(null)
    fetchCharities()
  }

  async function deleteCharity(id: string) {
    if (!confirm('Delete this charity?')) return
    await fetch(`/api/charities/${id}`, { method: 'DELETE' })
    fetchCharities()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Charities</h1>

      <div className="card-flat rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add Charity</h2>
        <form onSubmit={addCharity} className="flex gap-3 flex-wrap">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Charity name"
            className="flex-1 min-w-[160px] bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description"
            className="flex-1 min-w-[200px] bg-white shadow-md shadow-black/20 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-[#166534]" />
          <button type="submit" className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      <div className="card-flat rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {['Name', 'Description', 'Total Donations', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-white shadow-md shadow-black/20 transition-colors">
                <td className="px-4 py-3">
                  {editId === c.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none w-full" />
                  ) : <span className="text-slate-900 font-medium">{c.name}</span>}
                </td>
                <td className="px-4 py-3">
                  {editId === c.id ? (
                    <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                      className="bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-3 py-1.5 text-slate-900 text-sm focus:outline-none w-full" />
                  ) : <span className="text-gray-500">{c.description}</span>}
                </td>
                <td className="px-4 py-3 text-[#166534]">£{Number(c.total_donations).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editId === c.id ? (
                      <>
                        <button onClick={() => saveEdit(c.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(c.id); setEditName(c.name); setEditDesc(c.description || '') }}
                          className="text-gray-500 hover:text-[#166534] transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteCharity(c.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </>
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
