import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const [
    { data: draws },
    { data: myWinners },
    { data: myScores },
    { data: profile },
  ] = await Promise.all([
    admin.from('draws').select('*').eq('published', true).order('draw_month', { ascending: false }),
    admin.from('winners').select('*, draws(draw_month)').eq('user_id', user.id),
    admin.from('scores').select('score').eq('user_id', user.id),
    admin.from('users').select('subscription_status').eq('id', user.id).single(),
  ])

  const myScoreValues = myScores?.map((s) => s.score) || []
  const isActive = profile?.subscription_status === 'active'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Monthly Draws</h1>
        <p className="text-gray-500 mt-1">Match 3, 4, or 5 of your scores to the draw numbers to win.</p>
      </div>

      {!isActive && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium text-sm">Active subscription required</p>
            <p className="text-amber-400/70 text-xs mt-0.5">Subscribe to participate in draws.</p>
          </div>
          <Link href="/dashboard/subscribe" className="btn-primary px-4 py-2 rounded-lg text-sm shrink-0">Subscribe</Link>
        </div>
      )}

      {/* Your current numbers */}
      {myScoreValues.length > 0 && (
        <div className="card-flat rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Your Numbers</h2>
          <div className="flex gap-3 flex-wrap">
            {myScoreValues.map((s, i) => (
              <div key={i} className="score-ball">{s}</div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-3">
            These are your current Stableford scores. They are matched against each draw.
          </p>
        </div>
      )}

      {myScoreValues.length === 0 && isActive && (
        <div className="card-flat rounded-2xl p-6">
          <p className="text-gray-500 text-sm">
            You haven&apos;t added any scores yet.{' '}
            <Link href="/dashboard/scores" className="text-[#166534] hover:underline">Add your scores</Link>{' '}
            to participate in draws.
          </p>
        </div>
      )}

      {/* Draws list */}
      <div className="space-y-4">
        {draws && draws.length > 0 ? (
          draws.map((draw) => {
            const drawNums = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5]
            const matchedNums = myScoreValues.filter((s) => drawNums.includes(s))
            const matchCount = matchedNums.length
            const winner = myWinners?.find((w) => w.draw_id === draw.id)

            return (
              <div key={draw.id} className="card-flat rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg">{draw.draw_month}</h3>
                    {matchCount >= 3 && (
                      <span className="text-xs bg-[#166534]/20 text-[#166534] px-2 py-0.5 rounded-full mt-1.5 inline-block font-medium">
                        🎉 You matched {matchCount} number{matchCount > 1 ? 's' : ''}!
                      </span>
                    )}
                    {matchCount > 0 && matchCount < 3 && (
                      <span className="text-xs bg-white/10 text-gray-500 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                        {matchCount} match{matchCount > 1 ? 'es' : ''} — need 3 to win
                      </span>
                    )}
                  </div>
                  {winner && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      winner.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400'
                      : winner.status === 'approved' ? 'bg-blue-500/20 text-blue-400'
                      : winner.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {winner.status.charAt(0).toUpperCase() + winner.status.slice(1)}
                    </span>
                  )}
                </div>

                {/* Draw balls */}
                <div className="flex gap-3 flex-wrap">
                  {drawNums.map((n, i) => (
                    <div
                      key={i}
                      className={`score-ball transition-all ${
                        myScoreValues.includes(n)
                          ? 'border-[#166534] bg-[#166534]/20 text-[#166534]'
                          : ''
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>

                {winner && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Prize amount</span>
                    <span className="text-[#166534] font-bold text-lg">
                      £{Number(winner.prize_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                {winner && winner.status === 'pending' && !winner.proof_url && (
                  <div className="mt-3">
                    <Link href="/dashboard/winnings" className="text-sm text-blue-400 hover:underline">
                      → Upload proof to claim your prize
                    </Link>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="card-flat rounded-2xl p-12 text-center">
            <p className="text-gray-500">No draws published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
