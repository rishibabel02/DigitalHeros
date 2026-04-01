import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/services/subscriptionService'
import { PLANS } from '@/lib/stripe'

// POST /api/subscription/checkout
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const planConfig = PLANS[plan as keyof typeof PLANS]
  const session = await createCheckoutSession(user.id, profile?.email || user.email!, planConfig.priceId, plan)

  return NextResponse.json({ url: session.url })
}
