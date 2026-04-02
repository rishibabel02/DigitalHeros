import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/services/subscriptionService'
import { PLANS } from '@/lib/stripe'

// POST /api/subscription/checkout
export async function POST(request: NextRequest) {
  try {
    // Guard: check required env vars are present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[checkout] STRIPE_SECRET_KEY is not set')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('[checkout] NEXT_PUBLIC_APP_URL is not set')
      return NextResponse.json({ error: 'App URL not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan. Must be "monthly" or "yearly"' }, { status: 400 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]

    // Use email from auth directly — avoids hitting profiles table (RLS recursion risk)
    const email = user.email!

    console.log(`[checkout] Creating session for user=${user.id} plan=${plan} email=${email}`)

    const session = await createCheckoutSession(user.id, email, planConfig.priceId, plan)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[checkout] Error:', err?.message || err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
