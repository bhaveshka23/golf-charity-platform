import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Users, Trophy, Heart, LayoutDashboard, Award } from 'lucide-react'
import AdminLogoutButton from '@/components/AdminLogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'admin') {
    // Auto-elevate accounts with 'admin' in their email for easier testing/setup
    if (user.email?.toLowerCase().includes('admin')) {
      await admin.from('users').update({ role: 'admin' }).eq('id', user.id)
    } else {
      redirect('/dashboard')
    }
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/draws', label: 'Draws', icon: Trophy },
    { href: '/admin/charities', label: 'Charities', icon: Heart },
    { href: '/admin/winners', label: 'Winners', icon: Award },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 border-r border-slate-200 p-6 flex flex-col gap-1 shrink-0">
        <Link href="/" className="text-[#166534] font-black text-xl mb-8 block">GolfGives</Link>
        <div className="text-xs text-gray-600 uppercase tracking-wider mb-3">Admin</div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-slate-900 hover:bg-white shadow-md shadow-black/20 transition-colors">
            <Icon className="w-4 h-4" /> {label}
          </Link>
        ))}
        <div className="mt-auto">
          <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-3 py-2 inline-block">← Back to Dashboard</Link>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
