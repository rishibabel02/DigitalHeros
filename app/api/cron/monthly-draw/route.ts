import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snapshotDrawEntries } from '@/services/drawService'
import { resend, EMAIL_FROM } from '@/lib/resend'

// Vercel Cron: runs on 1st of every month (configured in vercel.json)
export async function GET(request: NextRequest) {
  // Validate Vercel cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Check if draw already exists for this month
  const { data: existing } = await supabase
    .from('draws')
    .select('id')
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'Draw already exists for this month', drawId: existing.id })
  }

  // Create the draw
  const { data: draw, error } = await supabase
    .from('draws')
    .insert({ month, year, draw_logic: 'random', status: 'draft' })
    .select()
    .single()

  if (error || !draw) {
    return NextResponse.json({ error: error?.message || 'Failed to create draw' }, { status: 500 })
  }

  // Snapshot all active subscribers
  const enrolledCount = await snapshotDrawEntries(draw.id)

  // Notify admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('role', 'admin')

  if (admins) {
    for (const admin of admins) {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: admin.email,
        subject: `🎰 Monthly Draw Created — ${now.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
            <h1 style="color:#a855f7;">Monthly Draw Ready</h1>
            <p style="color:#a0a0b0;">The ${now.toLocaleString('en-GB', { month: 'long', year: 'numeric' })} draw has been automatically created.</p>
            <ul style="color:#a0a0b0;">
              <li><strong style="color:#f0f0f5;">${enrolledCount}</strong> subscribers enrolled with their score snapshots</li>
              <li>Draw logic: Random (change in admin panel before publishing)</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/draws" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">Go to Admin Panel</a>
          </div>
        `,
      }).catch(() => {})
    }
  }

  return NextResponse.json({
    message: 'Monthly draw created successfully',
    drawId: draw.id,
    month,
    year,
    enrolledCount,
  })
}
