import { createAdminClient } from '@/lib/supabase/admin'
import StatCard from '@/components/StatCard'

export default async function AdminOverviewPage() {
  const admin = createAdminClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: payments },
    { count: totalDraws },
    { count: pendingWinners },
  ] = await Promise.all([
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    admin.from('payments').select('amount').eq('type', 'subscription').eq('status', 'completed'),
    admin.from('draws').select('*', { count: 'exact', head: true }).eq('published', true),
    admin.from('winners').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const totalRevenue = payments?.reduce((s, p) => s + Number(p.amount), 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Platform at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={totalUsers || 0} />
        <StatCard label="Active Subscribers" value={activeSubscribers || 0} highlight />
        <StatCard label="Total Revenue" value={`£${totalRevenue.toFixed(0)}`} highlight />
        <StatCard label="Draws Published" value={totalDraws || 0} />
        <StatCard label="Pending Winners" value={pendingWinners || 0} sub="Awaiting review" />
      </div>
    </div>
  )
}
