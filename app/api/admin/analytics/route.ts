import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/analytics
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminSupabase = createAdminClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: charityTotals },
    { data: draws },
    { data: poolData },
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminSupabase.from('donations').select('charity_id, amount, charities(name)'),
    adminSupabase.from('draws').select('id, month, year, status').order('year', { ascending: false }).limit(12),
    adminSupabase.from('prize_pool').select('total_pool, currency'),
  ])

  // Aggregate charity totals
  const charityMap: Record<string, { name: string; total: number }> = {}
  charityTotals?.forEach((d: any) => {
    const key = d.charity_id
    if (!charityMap[key]) charityMap[key] = { name: d.charities?.name || 'Unknown', total: 0 }
    charityMap[key].total += d.amount
  })

  const totalPrizePool = poolData?.reduce((sum, p) => sum + p.total_pool, 0) || 0

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    activeSubscribers: activeSubscribers || 0,
    totalPrizePool,
    charityTotals: Object.entries(charityMap).map(([id, data]) => ({ id, ...data })),
    draws: draws || [],
  })
}
