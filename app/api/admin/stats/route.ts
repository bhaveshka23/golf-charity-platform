import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: payments },
    { data: charities },
    { count: totalDraws },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    admin.from('payments').select('amount').eq('type', 'subscription').eq('status', 'completed'),
    admin.from('charities').select('total_donations'),
    admin.from('draws').select('*', { count: 'exact', head: true }).eq('published', true),
  ])

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const totalDonations = charities?.reduce((sum, c) => sum + Number(c.total_donations), 0) || 0

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    activeSubscribers: activeSubscribers || 0,
    totalRevenue,
    totalDonations,
    totalDraws: totalDraws || 0,
  })
}
