import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const formData = await request.formData()
  const charityId = formData.get('charityId') as string
  const percentage = parseInt(formData.get('percentage') as string)

  if (!charityId || isNaN(percentage) || percentage < 10 || percentage > 100) {
    return NextResponse.redirect(new URL('/dashboard/charity?error=invalid', request.url))
  }

  const adminSupabase = createAdminClient()
  await adminSupabase.from('user_charities').upsert({
    user_id: user.id,
    charity_id: charityId,
    contribution_percentage: percentage,
  }, { onConflict: 'user_id' })

  return NextResponse.redirect(new URL('/dashboard/charity?success=1', request.url))
}
