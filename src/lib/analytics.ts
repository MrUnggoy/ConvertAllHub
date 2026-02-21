// Google Analytics 4 and AdSense Integration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXX'

// Initialize Google Analytics 4
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  })

  // Set session start time
  window.sessionStart = Date.now()
  
  console.log('📊 Analytics initialized:', GA_MEASUREMENT_ID)
}

// Initialize AdSense
export const initializeAdSense = () => {
  if (typeof window === 'undefined') return

  // Load AdSense script
  const script = document.createElement('script')
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
  script.async = true
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)

  console.log('💰 AdSense initialized:', ADSENSE_CLIENT_ID)
}

// Track revenue events
export const trackRevenue = (eventName: string, value: number, currency = 'USD') => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      currency: currency,
      value: value,
      event_category: 'revenue'
    })
  }
}

// Track conversion funnel
export const trackConversionFunnel = (step: string, toolId: string, additionalData?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', 'conversion_funnel', {
      funnel_step: step,
      tool_id: toolId,
      event_category: 'conversion',
      ...additionalData
    })
  }
}

// Track ad performance
export const trackAdPerformance = (action: 'impression' | 'click', slotId: string, zoneId: string) => {
  if (window.gtag) {
    window.gtag('event', `ad_${action}`, {
      ad_slot_id: slotId,
      ad_zone_id: zoneId,
      event_category: 'advertising'
    })
  }
}

// Track user engagement
export const trackUserEngagement = (action: string, category: string, label?: string, value?: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Track Pro upgrade events
export const trackProUpgrade = (step: 'prompt_shown' | 'checkout_started' | 'payment_completed', trigger: string, toolId?: string) => {
  if (window.gtag) {
    window.gtag('event', `pro_upgrade_${step}`, {
      upgrade_trigger: trigger,
      tool_id: toolId,
      event_category: 'monetization'
    })
  }
}

// Enhanced ecommerce tracking for subscriptions
export const trackSubscription = (action: 'purchase' | 'cancel' | 'upgrade', planType: string, value: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      transaction_id: `sub_${Date.now()}`,
      value: value,
      currency: 'USD',
      items: [{
        item_id: `convertall_${planType}`,
        item_name: `ConvertAll ${planType.charAt(0).toUpperCase() + planType.slice(1)}`,
        category: 'subscription',
        quantity: 1,
        price: value
      }]
    })
  }
}

// Page view tracking with enhanced data
export const trackPageView = (pagePath?: string, pageTitle?: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    })
  }
}

// Custom dimensions for better segmentation
export const setUserProperties = (properties: {
  user_tier?: 'free' | 'pro'
  signup_date?: string
  total_conversions?: number
  favorite_tool?: string
}) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      custom_map: {
        custom_dimension_1: 'user_tier',
        custom_dimension_2: 'signup_date',
        custom_dimension_3: 'total_conversions',
        custom_dimension_4: 'favorite_tool'
      }
    })
    
    window.gtag('event', 'user_properties_set', properties)
  }
}

// Extend window type
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    sessionStart: number
    adsbygoogle: any[]
  }
}