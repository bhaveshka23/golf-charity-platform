import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SCORES = 5

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(MAX_SCORES)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const score = Number(body.score)
  const date = body.date

  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
  }
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get existing scores ordered oldest first
  const { data: existing } = await admin
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Rolling window: delete oldest if at max
  if (existing && existing.length >= MAX_SCORES) {
    await admin.from('scores').delete().eq('id', existing[0].id)
  }

  const { data, error } = await admin
    .from('scores')
    .insert({ user_id: user.id, score, date })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
