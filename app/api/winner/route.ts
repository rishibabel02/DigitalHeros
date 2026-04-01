import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationUpdate } from '@/lib/resend'

// GET /api/winner — get current user's winner verifications
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('winner_verifications')
    .select('*, draws(month, year)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ verifications: data })
}

// POST /api/winner/upload — upload proof
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('proof') as File
  const verificationId = formData.get('verificationId') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only images and PDF allowed.' }, { status: 400 })
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB allowed.' }, { status: 400 })
  }

  const filePath = `${user.id}/${verificationId}/${Date.now()}-${file.name}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(filePath, arrayBuffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Get signed URL (time-limited, 7 days)
  const { data: signedUrl } = await supabase.storage
    .from('winner-proofs')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7)

  await supabase
    .from('winner_verifications')
    .update({ proof_file_path: filePath, proof_url: signedUrl?.signedUrl })
    .eq('id', verificationId)
    .eq('user_id', user.id)

  return NextResponse.json({ message: 'Proof uploaded successfully', url: signedUrl?.signedUrl })
}
