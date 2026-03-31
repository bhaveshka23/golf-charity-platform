import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={profile} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
