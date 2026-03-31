import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const winnerId = formData.get('winner_id') as string

  if (!file || !winnerId) return NextResponse.json({ error: 'File and winner_id required' }, { status: 400 })

  const admin = createAdminClient()

  // Verify winner belongs to user
  const { data: winner } = await admin.from('winners').select('id').eq('id', winnerId).eq('user_id', user.id).single()
  if (!winner) return NextResponse.json({ error: 'Winner record not found' }, { status: 404 })

  const ext = file.name.split('.').pop()
  const path = `proofs/${user.id}/${winnerId}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await admin.storage
    .from('winner-proofs')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('winner-proofs').getPublicUrl(path)

  await admin.from('winners').update({ proof_url: publicUrl, status: 'pending' }).eq('id', winnerId)

  return NextResponse.json({ url: publicUrl })
}
