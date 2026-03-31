'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'

type AdminUser = {
  id: string
  name: string
  email: string
  subscription_status: string
  subscription_plan: string | null
  created_at: string
  charities?: { name: string }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editPlan, setEditPlan] = useState('')

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  async function saveEdit(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_status: editStatus, subscription_plan: editPlan }),
    })
    setEditId(null)
    fetchUsers()
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to completely delete this user?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Manage Users</h1>
      <div className="card-flat rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {['User', 'Status', 'Plan', 'Charity', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-white shadow-md shadow-black/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-slate-900 font-medium">{u.name}</div>
                  <div className="text-gray-600 text-xs">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  {editId === u.id ? (
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} 
                      className="bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-2 py-1 text-slate-900 text-xs">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="past_due">Past Due</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400'
                      : u.subscription_status === 'past_due' ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-500/20 text-gray-500'
                    }`}>{u.subscription_status}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">
                  {editId === u.id ? (
                    <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}
                      className="bg-white shadow-md shadow-black/20 border border-[#166534] rounded-lg px-2 py-1 text-slate-900 text-xs">
                      <option value="">None</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  ) : (u.subscription_plan || '—')}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.charities?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(u.id); setEditStatus(u.subscription_status); setEditPlan(u.subscription_plan || '') }}
                          className="text-gray-500 hover:text-[#166534] transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteUser(u.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
