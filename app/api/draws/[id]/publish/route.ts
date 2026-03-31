import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use admin client to check role — avoids RLS recursion
  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get draw
  const { data: draw } = await admin.from('draws').select('*').eq('id', id).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })

  const drawNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5]

  // Find all active subscribers with scores
  const { data: activeUsers } = await admin
    .from('users')
    .select('id')
    .eq('subscription_status', 'active')

  if (activeUsers) {
    for (const u of activeUsers) {
      const { data: scores } = await admin
        .from('scores')
        .select('score')
        .eq('user_id', u.id)

      if (!scores || scores.length === 0) continue

      const userScores = scores.map((s) => s.score)
      const matches = userScores.filter((s) => drawNumbers.includes(s)).length

      if (matches >= 3) {
        // Calculate prize share (simplified — equal split placeholder)
        const prizeAmount = matches === 5 ? draw.jackpot_amount * 0.4
          : matches === 4 ? draw.jackpot_amount * 0.35
          : draw.jackpot_amount * 0.25

        await admin.from('winners').insert({
          user_id: u.id,
          draw_id: id,
          match_count: matches,
          prize_amount: prizeAmount,
          status: 'pending',
        })
      }
    }
  }

  // Publish draw
  const { data, error } = await admin.from('draws').update({ published: true }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
