import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // Use admin client — avoids RLS on draws table for public published draws
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('draws')
    .select('*')
    .eq('published', true)
    .order('draw_month', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use admin client to check role — avoids RLS recursion on users table
  const adminCheck = createAdminClient()
  const { data: profile } = await adminCheck.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { draw_month, mode } = await req.json()
  if (!draw_month) return NextResponse.json({ error: 'draw_month required' }, { status: 400 })

  let numbers: number[]

  if (mode === 'algorithmic') {
    // Weighted by most frequent user scores
    const admin = createAdminClient()
    const { data: scores } = await admin.from('scores').select('score')
    const freq: Record<number, number> = {}
    scores?.forEach(({ score }) => { freq[score] = (freq[score] || 0) + 1 })
    const pool = Array.from({ length: 45 }, (_, i) => i + 1)
    const weighted = pool.flatMap((n) => Array(freq[n] || 1).fill(n))
    const picked = new Set<number>()
    while (picked.size < 5) {
      picked.add(weighted[Math.floor(Math.random() * weighted.length)])
    }
    numbers = Array.from(picked).sort((a, b) => a - b)
  } else {
    // Random
    const pool = Array.from({ length: 45 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    numbers = pool.slice(0, 5).sort((a, b) => a - b)
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('draws').insert({
    draw_month,
    number1: numbers[0],
    number2: numbers[1],
    number3: numbers[2],
    number4: numbers[3],
    number5: numbers[4],
    published: false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
