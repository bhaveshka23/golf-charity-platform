export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type WinnerStatus = 'pending' | 'approved' | 'rejected' | 'paid'
export type PaymentType = 'subscription' | 'prize_payout' | 'charity_donation'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  subscription_status: SubscriptionStatus
  subscription_plan: SubscriptionPlan | null
  charity_id: string | null
  charity_percentage: number
  role: UserRole
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  total_donations: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: string
  start_date: string
  end_date: string | null
  created_at: string
}

export interface Draw {
  id: string
  draw_month: string
  number1: number
  number2: number
  number3: number
  number4: number
  number5: number
  published: boolean
  jackpot_amount: number
  created_at: string
}

export interface Winner {
  id: string
  user_id: string
  draw_id: string
  match_count: 3 | 4 | 5
  prize_amount: number
  proof_url: string | null
  status: WinnerStatus
  created_at: string
  user?: User
  draw?: Draw
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  type: PaymentType
  status: PaymentStatus
  stripe_payment_id: string | null
  created_at: string
}
