import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.warn('Stripe publishable key not found. Pro features will not work.')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Stripe product and price IDs (replace with your actual IDs)
export const STRIPE_PRODUCTS = {
  monthly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_pro',
    price: 9.99,
    interval: 'month'
  },
  yearly: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly_pro', 
    price: 99.99,
    interval: 'year',
    discount: 17
  }
}

// Create checkout session
export const createCheckoutSession = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        successUrl: successUrl || `${window.location.origin}/upgrade-success`,
        cancelUrl: cancelUrl || window.location.href
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Redirect to Stripe Checkout
export const redirectToCheckout = async (priceId: string) => {
  try {
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const session = await createCheckoutSession(priceId)
    
    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    })

    if (result.error) {
      throw new Error(result.error.message)
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

// Create customer portal session (for managing subscriptions)
export const createPortalSession = async () => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const session = await response.json()
    window.location.href = session.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

// Validate subscription status
export const validateSubscription = async (customerId: string) => {
  try {
    const response = await fetch(`/api/validate-subscription?customerId=${customerId}`)
    
    if (!response.ok) {
      throw new Error('Failed to validate subscription')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error validating subscription:', error)
    return { isActive: false, tier: 'free' }
  }
}

// Usage tracking for Pro features
export const trackUsage = async (feature: string, usage: number) => {
  try {
    await fetch('/api/track-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature,
        usage,
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
  }
}