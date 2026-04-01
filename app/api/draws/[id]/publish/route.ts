import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishDraw } from '@/services/drawService'
import { sendDrawResultsEmail } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/draws/[id]/publish — admin only
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { logic } = await request.json()
  const result = await publishDraw(id, logic || 'random')

  // Send draw result emails to all participants
  const adminSupabase = createAdminClient()
  const { data: entries } = await adminSupabase
    .from('draw_entries')
    .select('user_id, profiles(email, full_name)')
    .eq('draw_id', id)

  const draw = await adminSupabase.from('draws').select('month, year').eq('id', id).single()
  const monthName = draw.data ? new Date(draw.data.year, draw.data.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : ''

  if (entries) {
    for (const entry of entries) {
      const p = (entry as any).profiles
      if (p?.email) {
        await sendDrawResultsEmail(p.email, p.full_name || 'there', monthName).catch(() => {})
      }
    }
  }

  return NextResponse.json({ message: 'Draw published successfully', result })
}
