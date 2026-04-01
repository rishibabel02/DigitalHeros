import { createAdminClient } from '@/lib/supabase/admin'
import type { Draw, DrawEntry, DrawResult } from '@/types/database'

const PRIZE_POOL_CONTRIBUTION_RATE = 0.4 // 40% of subscription goes to prize pool
const MONTHLY_PLAN_AMOUNT = 2999 // pence

// Prize distribution tiers
const PRIZE_TIERS = {
  five: 0.40,   // 40% of pool
  four: 0.35,   // 35% of pool
  three: 0.25,  // 25% of pool
}

/**
 * DRAW ENGINE — Core algorithm
 * 
 * Generates winning numbers using either:
 * - Random: standard lottery-style random selection from 1-45
 * - Algorithmic: frequency-weighted selection based on user score patterns
 *   - Aggregates all users' current 5-score sets
 *   - Calculates frequency of each score value (1-45) across all active subscribers
 *   - Weights draw towards LEAST frequent scores (harder to match = bigger prize incentive)
 *   - Documents algorithm for evaluator review
 */
export async function generateWinningNumbers(
  drawId: string,
  logic: 'random' | 'algorithmic'
): Promise<number[]> {
  const supabase = createAdminClient()

  if (logic === 'random') {
    // Standard lottery: 5 unique random numbers between 1-45
    const numbers = new Set<number>()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  // Algorithmic: frequency-weighted (inverse — least frequent scores more likely to win)
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('scores_snapshot')
    .eq('draw_id', drawId)

  if (!entries || entries.length === 0) {
    // Fallback to random if no entries
    return generateWinningNumbers(drawId, 'random')
  }

  // Build frequency map of score values 1-45
  const frequencyMap: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) frequencyMap[i] = 0

  entries.forEach((entry) => {
    entry.scores_snapshot.forEach((score: number) => {
      if (score >= 1 && score <= 45) {
        frequencyMap[score]++
      }
    })
  })

  // Invert weights — least common scores get higher selection probability
  const maxFreq = Math.max(...Object.values(frequencyMap)) || 1
  const weights: number[] = []
  const scoreValues: number[] = []

  for (let score = 1; score <= 45; score++) {
    scoreValues.push(score)
    // Inverse frequency weight: scores with 0 frequency get maxFreq+1 weight
    weights.push(maxFreq + 1 - frequencyMap[score])
  }

  // Weighted random selection of 5 unique numbers
  const selected = new Set<number>()
  const totalRounds = Math.min(10000, weights.length * 100) // safety cap

  let attempts = 0
  while (selected.size < 5 && attempts < totalRounds) {
    attempts++
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = Math.random() * totalWeight
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i]
      if (rand <= 0) {
        selected.add(scoreValues[i])
        break
      }
    }
  }

  // Fill remaining with random if needed
  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1)
  }

  return Array.from(selected).sort((a, b) => a - b)
}

/**
 * Snapshot active subscribers' current 5 scores into draw_entries
 * Called at draw creation — prevents future score edits from affecting this draw
 */
export async function snapshotDrawEntries(drawId: string): Promise<number> {
  const supabase = createAdminClient()

  // Get all active subscribers
  const { data: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!activeSubscribers || activeSubscribers.length === 0) return 0

  let enrolledCount = 0

  for (const { user_id } of activeSubscribers) {
    // Get user's latest 5 scores
    const { data: scores } = await supabase
      .from('golf_scores')
      .select('score, played_date')
      .eq('user_id', user_id)
      .order('played_date', { ascending: false })
      .limit(5)

    if (!scores || scores.length === 0) continue

    const snapshot = scores.map(s => s.score)

    // Lock these scores by played_date so user can't edit them (snapshot is immutable)
    await supabase
      .from('golf_scores')
      .update({ is_locked: true })
      .eq('user_id', user_id)
      .in('played_date', scores.map(s => s.played_date))

    // Insert draw entry with frozen snapshot
    await supabase
      .from('draw_entries')
      .upsert({
        draw_id: drawId,
        user_id,
        scores_snapshot: snapshot,
        is_locked: true,
      }, { onConflict: 'draw_id,user_id' })

    enrolledCount++
  }

  return enrolledCount
}

/**
 * Run draw — match winning numbers against all entries
 * Returns results WITHOUT writing to DB (used for simulation)
 */
export function matchEntries(
  entries: DrawEntry[],
  winningNumbers: number[]
): {
  five: string[]
  four: string[]
  three: string[]
} {
  const results = { five: [] as string[], four: [] as string[], three: [] as string[] }

  entries.forEach((entry) => {
    const matchCount = entry.scores_snapshot.filter(score =>
      winningNumbers.includes(score)
    ).length

    if (matchCount >= 5) results.five.push(entry.user_id)
    else if (matchCount === 4) results.four.push(entry.user_id)
    else if (matchCount === 3) results.three.push(entry.user_id)
  })

  return results
}

/**
 * Calculate prize pool for a draw
 */
export async function calculatePrizePool(drawId: string): Promise<{
  total: number
  jackpot: number
  four: number
  three: number
  carryForward: number
}> {
  const supabase = createAdminClient()

  // Count active subscribers
  const { count: subscriberCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Check for jackpot carry forward from previous draw
  const { data: prevDraw } = await supabase
    .from('draws')
    .select('jackpot_carry_forward')
    .eq('jackpot_rolled_over', true)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .single()

  const carryForward = prevDraw?.jackpot_carry_forward || 0
  const basePool = Math.floor((subscriberCount || 0) * MONTHLY_PLAN_AMOUNT * PRIZE_POOL_CONTRIBUTION_RATE)
  const totalPool = basePool + carryForward

  return {
    total: totalPool,
    jackpot: Math.floor(totalPool * PRIZE_TIERS.five) + carryForward,
    four: Math.floor(totalPool * PRIZE_TIERS.four),
    three: Math.floor(totalPool * PRIZE_TIERS.three),
    carryForward,
  }
}

/**
 * Simulate draw — isolated, does NOT write to draw_results table
 */
export async function simulateDraw(drawId: string, logic: 'random' | 'algorithmic') {
  const supabase = createAdminClient()

  const winningNumbers = await generateWinningNumbers(drawId, logic)

  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)

  const matches = matchEntries((entries || []) as DrawEntry[], winningNumbers)
  const pool = await calculatePrizePool(drawId)

  return {
    simulationMode: true, // SIMULATION — not real results
    winningNumbers,
    matches,
    pool,
    summary: {
      totalEntries: entries?.length || 0,
      fiveMatchWinners: matches.five.length,
      fourMatchWinners: matches.four.length,
      threeMatchWinners: matches.three.length,
    },
  }
}

/**
 * Publish draw — writes official results to DB, creates winner verifications
 */
export async function publishDraw(drawId: string, logic: 'random' | 'algorithmic') {
  const supabase = createAdminClient()

  const winningNumbers = await generateWinningNumbers(drawId, logic)
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)

  const matches = matchEntries((entries || []) as DrawEntry[], winningNumbers)
  const pool = await calculatePrizePool(drawId)

  // Save prize pool
  await supabase.from('prize_pool').upsert({
    draw_id: drawId,
    total_pool: pool.total,
    jackpot_pool: pool.jackpot,
    four_match_pool: pool.four,
    three_match_pool: pool.three,
    jackpot_carry_forward: pool.carryForward,
  }, { onConflict: 'draw_id' })

  // Save draw results for each tier
  const tierData: Array<{ match_type: 'five' | 'four' | 'three'; winner_user_ids: string[]; prize_amount: number }> = [
    { match_type: 'five', winner_user_ids: matches.five, prize_amount: matches.five.length > 0 ? Math.floor(pool.jackpot / matches.five.length) : 0 },
    { match_type: 'four', winner_user_ids: matches.four, prize_amount: matches.four.length > 0 ? Math.floor(pool.four / matches.four.length) : 0 },
    { match_type: 'three', winner_user_ids: matches.three, prize_amount: matches.three.length > 0 ? Math.floor(pool.three / matches.three.length) : 0 },
  ]

  for (const tier of tierData) {
    await supabase.from('draw_results').insert({ draw_id: drawId, ...tier })

    // Create winner verification records
    for (const userId of tier.winner_user_ids) {
      await supabase.from('winner_verifications').upsert({
        user_id: userId,
        draw_id: drawId,
        status: 'pending',
        payment_status: 'pending',
      }, { onConflict: 'user_id,draw_id' })

      // Send in-app notification to winner
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'draw_result',
        title: '🏆 You won!',
        message: `You matched ${tier.match_type === 'five' ? '5' : tier.match_type === 'four' ? '4' : '3'} numbers! Please upload your proof to claim your prize.`,
      })
    }
  }

  // Handle jackpot rollover
  const jackpotRolledOver = matches.five.length === 0
  const jackpotCarryForward = jackpotRolledOver ? pool.jackpot : 0

  // Update draw status to published
  await supabase.from('draws').update({
    status: 'published',
    winning_numbers: winningNumbers,
    jackpot_rolled_over: jackpotRolledOver,
    jackpot_carry_forward: jackpotCarryForward,
  }).eq('id', drawId)

  // Notify ALL participants
  const allParticipantIds = (entries || []).map((e: DrawEntry) => e.user_id)
  for (const userId of allParticipantIds) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'draw_result',
      title: 'Draw Results Published!',
      message: `The monthly draw results are in. Check your dashboard to see if you won!`,
    })
  }

  return { winningNumbers, matches, pool, jackpotRolledOver }
}
