import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const charity = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    website_url: formData.get('website_url') as string || null,
    upcoming_events: formData.get('upcoming_events') as string || null,
    is_featured: formData.get('is_featured') === 'true',
    is_active: true,
  }

  // If setting as featured, unfeature all others first
  if (charity.is_featured) {
    const adminSupabase = createAdminClient()
    await adminSupabase.from('charities').update({ is_featured: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('charities').insert(charity)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.redirect(new URL('/admin/charities', request.url))
}
