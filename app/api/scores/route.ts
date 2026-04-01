import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertScore, getUserScores, deleteScore } from '@/services/scoreService'

// GET /api/scores — get current user's scores
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scores, error } = await getUserScores(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ scores })
}

// POST /api/scores — add/update a score
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { score, playedDate } = body

  if (!score || !playedDate) {
    return NextResponse.json({ error: 'Score and date are required' }, { status: 400 })
  }

  const result = await upsertScore(user.id, Number(score), playedDate)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ message: 'Score saved successfully' })
}

// DELETE /api/scores/[id]
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scoreId } = await request.json()
  const result = await deleteScore(user.id, scoreId)

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ message: 'Score deleted' })
}
