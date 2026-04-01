export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed' | 'cancelled'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'draft' | 'simulated' | 'published'
export type DrawLogic = 'random' | 'algorithmic'
export type MatchType = 'five' | 'four' | 'three'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'
export type NotificationType = 'draw_result' | 'winner_status' | 'subscription_alert' | 'general'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  renewal_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  currency: string
  amount: number
  created_at: string
  updated_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number
  played_date: string
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  website_url: string | null
  upcoming_events: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCharity {
  id: string
  user_id: string
  charity_id: string
  contribution_percentage: number
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  user_id: string
  charity_id: string
  amount: number
  currency: string
  type: 'subscription_split' | 'independent'
  created_at: string
}

export interface Draw {
  id: string
  month: number
  year: number
  status: DrawStatus
  draw_logic: DrawLogic
  winning_numbers: number[] | null
  jackpot_rolled_over: boolean
  jackpot_carry_forward: number
  created_at: string
  updated_at: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  scores_snapshot: number[]
  is_locked: boolean
  created_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  match_type: MatchType
  winner_user_ids: string[]
  prize_amount: number
  created_at: string
}

export interface PrizePool {
  id: string
  draw_id: string
  total_pool: number
  jackpot_pool: number
  four_match_pool: number
  three_match_pool: number
  jackpot_carry_forward: number
  currency: string
  created_at: string
}

export interface WinnerVerification {
  id: string
  user_id: string
  draw_id: string
  proof_url: string | null
  proof_file_path: string | null
  status: VerificationStatus
  payment_status: PaymentStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// Joined / enriched types
export interface UserCharityWithCharity extends UserCharity {
  charity: Charity
}

export interface DrawEntryWithUser extends DrawEntry {
  profile: Profile
}

export interface WinnerVerificationWithUser extends WinnerVerification {
  profile: Profile
  draw: Draw
}
