import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!sub?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  await stripe.subscriptions.cancel(sub.stripe_subscription_id)

  await admin.from('subscriptions').update({ status: 'cancelled' })
    .eq('stripe_subscription_id', sub.stripe_subscription_id)

  await admin.from('users').update({ subscription_status: 'cancelled', subscription_plan: null })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
