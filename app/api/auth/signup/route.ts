import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { name, email, password, charityId, charityPercentage } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
  }

  // Insert user profile
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    name,
    email,
    charity_id: charityId || null,
    charity_percentage: charityPercentage || 10,
  })

  if (profileError) {
    // Rollback auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // Return credentials so the client can sign in and get a session cookie
  return NextResponse.json({ success: true, email, password })
}
