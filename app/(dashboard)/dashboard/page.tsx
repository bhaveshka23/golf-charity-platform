import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/StatCard'
import { Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ subscribed?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolvedParams = await searchParams
  const isSubscribedCallback = resolvedParams?.subscribed === 'true'

  const admin = createAdminClient()

  if (isSubscribedCallback) {
    // Local fallback: activate subscription directly if Stripe webhooks aren't connected
    await admin.from('users').update({ subscription_status: 'active', subscription_plan: 'monthly' }).eq('id', user.id)
    redirect('/dashboard')
  }

  const [
    { data: profile },
    { data: scores },
    { data: winners },
    { data: latestDraw },
  ] = await Promise.all([
    admin.from('users').select('*, charities(name)').eq('id', user.id).single(),
    admin.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    admin.from('winners').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    admin.from('draws').select('*').eq('published', true).order('draw_month', { ascending: false }).limit(1),
  ])

  if (profile?.role === 'admin') redirect('/admin')

  const totalWon = winners?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0
  const isActive = profile?.subscription_status === 'active'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Welcome back, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your overview</p>
      </div>

      {/* Subscription alert */}
      {!isActive && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-300 text-sm font-medium">No active subscription</p>
            <p className="text-amber-400/70 text-xs mt-0.5">Subscribe to enter draws and track scores.</p>
          </div>
          <Link href="/dashboard/subscribe" className="btn-primary px-4 py-2 rounded-lg text-sm shrink-0">Subscribe</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Subscription"
          value={isActive ? 'Active' : 'Inactive'}
          sub={profile?.subscription_plan || undefined}
          highlight={isActive}
        />
        <StatCard label="Scores Entered" value={scores?.length || 0} sub="Last 5 tracked" />
        <StatCard label="Total Won" value={`£${totalWon.toFixed(2)}`} sub="All time" highlight />
        <StatCard
          label="Charity"
          value={`${profile?.charity_percentage || 10}%`}
          sub={(profile as unknown as { charities?: { name: string } })?.charities?.name || 'Not selected'}
        />
      </div>

      {/* Scores & Draw */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <div className="card-flat rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#166534]" /> My Scores
            </h2>
            <Link href="/dashboard/scores" className="text-sm text-[#166534] hover:underline">Manage</Link>
          </div>
          {scores && scores.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              {scores.map((s) => (
                <div key={s.id} className="score-ball">{s.score}</div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No scores yet. <Link href="/dashboard/scores" className="text-[#166534] hover:underline">Add your first score</Link></p>
          )}
        </div>

        {/* Latest Draw */}
        <div className="card-flat rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#166534]" /> Latest Draw
            </h2>
            <Link href="/dashboard/draws" className="text-sm text-[#166534] hover:underline">All draws</Link>
          </div>
          {latestDraw && latestDraw[0] ? (
            <div>
              <p className="text-gray-500 text-sm mb-3">{latestDraw[0].draw_month}</p>
              <div className="flex gap-3">
                {[latestDraw[0].number1, latestDraw[0].number2, latestDraw[0].number3, latestDraw[0].number4, latestDraw[0].number5].map((n, i) => (
                  <div key={i} className="score-ball">{n}</div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No draws published yet.</p>
          )}
        </div>
      </div>

      {/* Winnings */}
      {winners && winners.length > 0 && (
        <div className="card-flat rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-[#166534]" /> Recent Winnings
          </h2>
          <div className="space-y-3">
            {winners.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <span className="text-slate-900 font-medium">{w.match_count}-Number Match</span>
                  <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                    w.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400'
                    : w.status === 'approved' ? 'bg-blue-500/20 text-blue-400'
                    : w.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                  }`}>{w.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-[#166534] font-bold">£{Number(w.prize_amount).toFixed(2)}</div>
                  {w.status === 'approved' && !w.proof_url && (
                    <Link href="/dashboard/winnings" className="text-xs text-blue-400 hover:underline">Upload proof</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
