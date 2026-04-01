import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snapshotDrawEntries, simulateDraw, publishDraw } from '@/services/drawService'

// GET /api/draws — list draws (public: published only, admin: all)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false })

  if (!user) {
    query = query.eq('status', 'published')
  } else {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      query = query.eq('status', 'published')
    }
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draws: data })
}

// POST /api/draws — admin: create draw + snapshot
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { month, year, drawLogic } = await request.json()
  const adminSupabase = createAdminClient()

  // Create draw record
  const { data: draw, error } = await adminSupabase
    .from('draws')
    .insert({ month, year, draw_logic: drawLogic || 'random', status: 'draft' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Snapshot eligible subscribers
  const enrolledCount = await snapshotDrawEntries(draw.id)

  return NextResponse.json({ draw, enrolledCount, message: `Draw created. ${enrolledCount} subscribers enrolled.` })
}
