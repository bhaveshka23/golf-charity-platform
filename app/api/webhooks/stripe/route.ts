import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan
      const stripeSubId = session.subscription as string
      if (!userId || !plan) break
      await admin.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: stripeSubId,
        plan,
        status: 'active',
        start_date: new Date().toISOString(),
      })
      await admin.from('users').update({ subscription_status: 'active', subscription_plan: plan }).eq('id', userId)
      await admin.from('payments').insert({
        user_id: userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        type: 'subscription',
        status: 'completed',
        stripe_payment_id: session.payment_intent as string,
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string }
      const subId = invoice.subscription
      if (!subId) break
      const { data: sub } = await admin.from('subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
      if (sub) {
        await admin.from('users').update({ subscription_status: 'active' }).eq('id', sub.user_id)
        await admin.from('payments').insert({
          user_id: sub.user_id,
          amount: invoice.amount_paid / 100,
          type: 'subscription',
          status: 'completed',
          stripe_payment_id: invoice.payment_intent || null,
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
      const subId = invoice.subscription
      if (!subId) break
      const { data: sub } = await admin.from('subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
      if (sub) {
        await admin.from('users').update({ subscription_status: 'past_due' }).eq('id', sub.user_id)
        await admin.from('subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', subId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription
      const { data: sub } = await admin.from('subscriptions').select('user_id').eq('stripe_subscription_id', stripeSub.id).single()
      if (sub) {
        await admin.from('users').update({ subscription_status: 'cancelled', subscription_plan: null }).eq('id', sub.user_id)
        await admin.from('subscriptions').update({ status: 'cancelled', end_date: new Date().toISOString() }).eq('stripe_subscription_id', stripeSub.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
