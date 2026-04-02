import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, PRIZE_POOL_PERCENTAGE, MIN_CHARITY_PERCENTAGE } from '@/lib/stripe'
import { sendSubscriptionConfirmation, sendSubscriptionCancellation } from '@/lib/resend'

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  plan: 'monthly' | 'yearly'
) {
  const supabase = createAdminClient()

  // Get or create Stripe customer
  let stripeCustomerId: string

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (sub?.stripe_customer_id) {
    stripeCustomerId = sub.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } })
    stripeCustomerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?cancelled=true`,
    metadata: { userId, plan },
  })

  return session
}

export async function handleStripeWebhook(event: any) {
  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { userId, plan } = session.metadata
      const stripeSubId = session.subscription

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as any
      const renewalDate = new Date(stripeSub.current_period_end * 1000).toISOString()
      const amount = stripeSub.items.data[0].price.unit_amount || 0


      const { error: upsertError } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        renewal_date: renewalDate,
        stripe_customer_id: session.customer,
        stripe_subscription_id: stripeSubId,
        amount,
      }, { onConflict: 'stripe_subscription_id' })

      if (upsertError) {
        console.error('Webhook Supabase Upsert Error:', upsertError)
        throw new Error(upsertError.message)
      }

      // Record charity donation for this billing period
      const { data: userCharity } = await supabase
        .from('user_charities')
        .select('charity_id, contribution_percentage')
        .eq('user_id', userId)
        .single()

      if (userCharity) {
        const donationAmount = Math.floor(amount * (userCharity.contribution_percentage / 100))
        await supabase.from('donations').insert({
          user_id: userId,
          charity_id: userCharity.charity_id,
          amount: donationAmount,
          type: 'subscription_split',
        })
      }

      // Get user profile for email
      const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single()
      if (profile) {
        await sendSubscriptionConfirmation(profile.email, profile.full_name || 'there', plan)
      }

      // In-app notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'subscription_alert',
        title: 'Subscription Active!',
        message: `Your ${plan} subscription is now active. Welcome to the platform!`,
      })
      break
    }

    case 'customer.subscription.updated': {
      const stripeSub = event.data.object
      const userId = await getUserIdFromCustomer(stripeSub.customer)
      if (!userId) break

      const renewalDate = new Date(stripeSub.current_period_end * 1000).toISOString()
      let status: 'active' | 'inactive' | 'lapsed' | 'cancelled' = 'active'

      if (stripeSub.status === 'canceled') status = 'cancelled'
      else if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') status = 'lapsed'
      else if (stripeSub.status === 'active') status = 'active'

      await supabase.from('subscriptions')
        .update({ status, renewal_date: renewalDate })
        .eq('stripe_subscription_id', stripeSub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const userId = await getUserIdFromCustomer(invoice.customer)
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'lapsed' })
        .eq('user_id', userId)

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'subscription_alert',
        title: 'Payment Failed',
        message: 'Your subscription payment failed. Your access has been restricted. Please update your payment method.',
      })
      break
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object
      const userId = await getUserIdFromCustomer(stripeSub.customer)
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', stripeSub.id)

      const endDate = new Date(stripeSub.current_period_end * 1000).toLocaleDateString('en-GB')
      const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single()
      if (profile) {
        await sendSubscriptionCancellation(profile.email, profile.full_name || 'there', endDate)
      }
      break
    }
  }
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.user_id || null
}

export async function cancelSubscription(userId: string) {
  const supabase = createAdminClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single()

  if (!sub?.stripe_subscription_id) return { error: 'No active subscription found' }

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  return { success: true }
}
