import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})


export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    name: 'Monthly',
    amount: 2999, // £29.99 in pence
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    name: 'Yearly',
    amount: 29900, // £299 in pence (saves ~£60)
    interval: 'year' as const,
  },
}

// Portion of subscription that goes to prize pool (40%)
export const PRIZE_POOL_PERCENTAGE = 0.4

// Minimum charity contribution (10%)
export const MIN_CHARITY_PERCENTAGE = 10
