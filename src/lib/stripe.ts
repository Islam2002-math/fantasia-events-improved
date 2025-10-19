import Stripe from 'stripe'

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const stripe = new Stripe(key)
  return stripe
}
