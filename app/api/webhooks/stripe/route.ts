import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { handleStripeWebhook } from '@/services/subscriptionService'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await handleStripeWebhook(event)
  return NextResponse.json({ received: true })
}
