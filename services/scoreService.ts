import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SCORES = 5

/**
 * Add or update a golf score for a user.
 * Enforces rolling 5-score logic: if user has 5+ scores, the oldest is removed.
 * Blocks editing if scores are locked (snapshotted in active draw).
 */
export async function upsertScore(
  userId: string,
  score: number,
  playedDate: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Validate score range
  if (score < 1 || score > 45) {
    return { success: false, error: 'Score must be between 1 and 45 (Stableford format)' }
  }

  // Check if a score on this date already exists and is locked
  const { data: existing } = await supabase
    .from('golf_scores')
    .select('id, is_locked')
    .eq('user_id', userId)
    .eq('played_date', playedDate)
    .single()

  if (existing?.is_locked) {
    return { success: false, error: 'This score is locked — it has been included in an active draw and cannot be edited.' }
  }

  // Get current scores ordered by date ascending (oldest first)
  const { data: currentScores } = await supabase
    .from('golf_scores')
    .select('id, played_date, is_locked')
    .eq('user_id', userId)
    .order('played_date', { ascending: true })

  // If at max and the new date is not already in the list, remove the oldest unlocked score
  if (currentScores && currentScores.length >= MAX_SCORES && !existing) {
    const oldestUnlocked = currentScores.find(s => !s.is_locked)
    if (oldestUnlocked) {
      await supabase.from('golf_scores').delete().eq('id', oldestUnlocked.id)
    } else {
      return { success: false, error: 'All 5 scores are locked by an active draw. New scores can be added after the draw is published.' }
    }
  }

  // Upsert score
  const { error } = await supabase
    .from('golf_scores')
    .upsert({
      user_id: userId,
      score,
      played_date: playedDate,
      is_locked: false,
    }, { onConflict: 'user_id,played_date' })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Get user's current scores in reverse chronological order (most recent first)
 */
export async function getUserScores(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_date', { ascending: false })
    .limit(MAX_SCORES)

  return { scores: data || [], error }
}

/**
 * Delete a score — blocked if locked
 */
export async function deleteScore(
  userId: string,
  scoreId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('golf_scores')
    .select('is_locked')
    .eq('id', scoreId)
    .eq('user_id', userId)
    .single()

  if (!data) return { success: false, error: 'Score not found' }
  if (data.is_locked) return { success: false, error: 'Score is locked by an active draw' }

  const { error } = await supabase
    .from('golf_scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
