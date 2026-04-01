import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationUpdate } from '@/lib/resend'

// POST /api/admin/winners/[id]/verify — admin approve/reject
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

  const { action, adminNote } = await request.json() // action: 'approve' | 'reject'
  const status = action === 'approve' ? 'approved' : 'rejected'

  const adminSupabase = createAdminClient()
  const { data: verification } = await adminSupabase
    .from('winner_verifications')
    .update({ status, admin_note: adminNote })
    .eq('id', id)
    .select('user_id, profiles(email, full_name)')
    .single()

  if (verification) {
    const p = (verification as any).profiles
    // Send email notification
    if (p?.email) {
      await sendVerificationUpdate(p.email, p.full_name || 'there', status, adminNote).catch(() => {})
    }
    // In-app notification
    await adminSupabase.from('notifications').insert({
      user_id: verification.user_id,
      type: 'winner_status',
      title: status === 'approved' ? '✅ Verification Approved!' : '❌ Verification Update',
      message: status === 'approved'
        ? 'Your prize verification was approved. Payment is being processed.'
        : `Your verification was not approved.${adminNote ? ` Note: ${adminNote}` : ''}`,
    })
  }

  return NextResponse.json({ message: `Verification ${status}` })
}

// PATCH /api/admin/winners/[id]/verify — mark as paid
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminSupabase = createAdminClient()
  await adminSupabase
    .from('winner_verifications')
    .update({ payment_status: 'paid' })
    .eq('id', id)

  return NextResponse.json({ message: 'Payment marked as completed' })
}
