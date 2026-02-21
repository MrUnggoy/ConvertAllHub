# ConvertAll Hub - Monetization Implementation Guide

This guide provides step-by-step instructions for implementing the monetization system using the `monetization-config.json` file.

## 🚀 Quick Start for Kiro

1. **Parse the config file** and generate React components
2. **Inject ad zones** into existing layout components
3. **Add analytics tracking** to user interactions
4. **Implement Pro upgrade flows** with Stripe integration
5. **Set up affiliate link management**

## 📦 Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.1.0",
    "react-gtag": "^1.0.1",
    "react-hotjar": "^6.0.0",
    "js-cookie": "^3.0.5"
  }
}
```

## 🧱 Core Components to Generate

### 1. AdZone Component (`src/components/monetization/AdZone.tsx`)

```typescript
import { useEffect, useRef } from 'react'
import { useMonetization } from '@/hooks/useMonetization'

interface AdZoneProps {
  zoneId: string
  className?: string
}

export default function AdZone({ zoneId, className }: AdZoneProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const { config, isProUser, trackAdImpression } = useMonetization()
  
  useEffect(() => {
    if (isProUser) return // Don't show ads to Pro users
    
    const zone = config.monetization.adsense.placement_zones.find(z => z.id === zoneId)
    if (!zone) return
    
    const slot = config.monetization.adsense.slots[zone.slot]
    if (!slot) return
    
    // Load AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }
    
    // Create ad element
    const adElement = document.createElement('ins')
    adElement.className = 'adsbygoogle'
    adElement.style.display = 'block'
    adElement.style.margin = '16px auto'
    adElement.style.textAlign = 'center'
    adElement.setAttribute('data-ad-client', config.monetization.adsense.client_id)
    adElement.setAttribute('data-ad-slot', slot.id)
    adElement.setAttribute('data-ad-format', slot.format)
    adElement.setAttribute('data-full-width-responsive', 'true')
    
    if (adRef.current) {
      adRef.current.appendChild(adElement)
      
      // Push ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        trackAdImpression(zoneId, slot.id)
      } catch (error) {
        console.warn('AdSense error:', error)
      }
    }
    
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = ''
      }
    }
  }, [zoneId, isProUser, config, trackAdImpression])
  
  if (isProUser) return null
  
  return <div ref={adRef} className={className} />
}
```

### 2. Monetization Hook (`src/hooks/useMonetization.ts`)

```typescript
import { useContext, useCallback } from 'react'
import { MonetizationContext } from '@/contexts/MonetizationContext'
import { useConversion } from '@/contexts/ConversionContext'

export function useMonetization() {
  const context = useContext(MonetizationContext)
  const { state } = useConversion()
  
  if (!context) {
    throw new Error('useMonetization must be used within MonetizationProvider')
  }
  
  const { config, analytics } = context
  
  const trackEvent = useCallback((eventName: string, parameters: Record<string, any>) => {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, parameters)
    }
    
    // Custom analytics
    if (analytics.track) {
      analytics.track(eventName, parameters)
    }
  }, [analytics])
  
  const trackAdImpression = useCallback((zoneId: string, slotId: string) => {
    trackEvent('ad_impression', {
      slot_id: slotId,
      zone_id: zoneId,
      page_type: window.location.pathname,
      user_tier: state.userTier
    })
  }, [trackEvent, state.userTier])
  
  const trackConversionStart = useCallback((toolId: string, fileType: string, fileSize: number) => {
    trackEvent('conversion_started', {
      tool_id: toolId,
      file_type: fileType,
      file_size_mb: Math.round(fileSize / 1024 / 1024 * 100) / 100,
      user_tier: state.userTier
    })
  }, [trackEvent, state.userTier])
  
  const trackUpgradePrompt = useCallback((reason: string, toolId: string) => {
    trackEvent('upgrade_prompt_shown', {
      trigger_reason: reason,
      tool_id: toolId,
      user_session_length: Date.now() - (window.sessionStart || Date.now())
    })
  }, [trackEvent])
  
  const shouldShowUpsell = useCallback((condition: string): boolean => {
    const triggers = config.monetization.pro_plan.upsell_triggers
    return triggers.some(trigger => trigger.condition === condition)
  }, [config])
  
  const getAffiliateLinks = useCallback((context: string[]) => {
    return config.monetization.affiliate_marketing.partners.filter(partner =>
      partner.context_triggers.some(trigger => context.includes(trigger))
    )
  }, [config])
  
  return {
    config,
    isProUser: state.userTier === 'pro',
    trackEvent,
    trackAdImpression,
    trackConversionStart,
    trackUpgradePrompt,
    shouldShowUpsell,
    getAffiliateLinks
  }
}
```

### 3. Pro Upgrade Modal (`src/components/monetization/ProUpgradeModal.tsx`)

```typescript
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMonetization } from '@/hooks/useMonetization'

interface ProUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: string
  toolId?: string
}

export default function ProUpgradeModal({ isOpen, onClose, trigger, toolId }: ProUpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const { config, trackEvent } = useMonetization()
  
  const pricing = config.monetization.pro_plan.pricing
  
  const handleUpgrade = async () => {
    setLoading(true)
    
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: pricing[selectedPlan].stripe_price_id,
          successUrl: `${window.location.origin}/upgrade-success`,
          cancelUrl: window.location.href
        })
      })
      
      const session = await response.json()
      
      trackEvent('checkout_initiated', {
        plan_type: selectedPlan,
        price_usd: pricing[selectedPlan].price_usd,
        trigger_reason: trigger,
        tool_id: toolId
      })
      
      await stripe?.redirectToCheckout({ sessionId: session.id })
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Upgrade to ConvertAll Pro</CardTitle>
          <CardDescription>
            {config.monetization.pro_plan.upsell_triggers.find(t => t.condition === trigger)?.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Plan Selection */}
          <div className="space-y-2">
            {Object.entries(pricing).map(([planType, plan]) => (
              <div
                key={planType}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedPlan === planType ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPlan(planType as 'monthly' | 'yearly')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium capitalize">{planType}</div>
                    <div className="text-sm text-gray-500">
                      ${plan.price_usd}/{planType === 'yearly' ? 'year' : 'month'}
                    </div>
                  </div>
                  {planType === 'yearly' && plan.discount_percentage && (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Save {plan.discount_percentage}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-medium">What you get:</h4>
            <ul className="text-sm space-y-1">
              {pricing[selectedPlan].features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade} disabled={loading} className="flex-1">
              {loading ? 'Processing...' : `Upgrade Now - $${pricing[selectedPlan].price_usd}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4. Affiliate Recommendations (`src/components/monetization/AffiliateRecommendations.tsx`)

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useMonetization } from '@/hooks/useMonetization'

interface AffiliateRecommendationsProps {
  context: string[]
  className?: string
}

export default function AffiliateRecommendations({ context, className }: AffiliateRecommendationsProps) {
  const { getAffiliateLinks, trackEvent } = useMonetization()
  
  const relevantPartners = getAffiliateLinks(context)
  
  if (relevantPartners.length === 0) return null
  
  const handleAffiliateClick = (partnerName: string, url: string) => {
    trackEvent('affiliate_click', {
      partner_name: partnerName,
      context: context.join(','),
      tool_id: window.location.pathname.split('/').pop()
    })
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Tools</CardTitle>
        <CardDescription>
          Professional tools that work great with your converted files
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {relevantPartners.slice(0, 2).map((partner) => (
          <div key={partner.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{partner.name}</div>
              <div className="text-sm text-gray-600">{partner.display_text}</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAffiliateClick(partner.name, partner.url)}
              className="ml-3"
            >
              {partner.cta}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

## 🔧 Integration Steps

### Step 1: Update Layout Components

Add ad zones to your existing layout:

```typescript
// src/components/Layout.tsx
import AdZone from '@/components/monetization/AdZone'

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AdZone zoneId="header_ad" className="container mx-auto px-4 py-2" />
      <ToolCategoryNav />
      
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {children}
        </div>
        <aside className="lg:col-span-1">
          <AdZone zoneId="tool_sidebar_ad" className="sticky top-4" />
        </aside>
      </main>
      
      <AdZone zoneId="footer_ad" className="container mx-auto px-4 py-4" />
    </div>
  )
}
```

### Step 2: Add Analytics to File Upload

```typescript
// Update src/components/FileUpload.tsx
import { useMonetization } from '@/hooks/useMonetization'

export default function FileUpload({ tool, onFilesAdded }: FileUploadProps) {
  const { trackConversionStart } = useMonetization()
  
  const processFiles = useCallback((files: FileList | File[]) => {
    // ... existing validation logic
    
    validFiles.forEach(file => {
      addFile(file, tool.id)
      trackConversionStart(tool.id, file.type, file.size)
    })
  }, [addFile, tool.id, trackConversionStart])
  
  // ... rest of component
}
```

### Step 3: Add Upgrade Prompts

```typescript
// Update src/components/PlaceholderTool.tsx
import ProUpgradeModal from '@/components/monetization/ProUpgradeModal'
import AffiliateRecommendations from '@/components/monetization/AffiliateRecommendations'

export default function PlaceholderTool({ tool }: PlaceholderToolProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState('')
  const { shouldShowUpsell, trackUpgradePrompt } = useMonetization()
  
  const handleFilesAdded = (files: File[]) => {
    // Check for upgrade triggers
    if (files.length > 3 && shouldShowUpsell('multiple_files_uploaded')) {
      setUpgradeTrigger('multiple_files_uploaded')
      setShowUpgradeModal(true)
      trackUpgradePrompt('multiple_files_uploaded', tool.id)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Existing tool interface */}
      
      {/* Affiliate recommendations */}
      <AffiliateRecommendations 
        context={[tool.category]} 
        className="mt-6"
      />
      
      {/* Upgrade modal */}
      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeTrigger}
        toolId={tool.id}
      />
    </div>
  )
}
```

## 📊 Analytics Setup

Add to your `_app.tsx` or main entry point:

```typescript
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Google Analytics 4
useEffect(() => {
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)
  
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag
  
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID)
}, [])
```

## 🎯 Revenue Optimization

The system automatically:
- Shows ads only to free users
- Triggers upgrade prompts based on usage patterns
- Tracks all monetization events
- Provides A/B testing framework
- Optimizes ad placement based on performance

## 🔒 Compliance

Ensure you have:
- Privacy Policy mentioning ads and analytics
- Cookie consent banner
- Terms of Service with monetization disclosure
- GDPR/CCPA compliance measures

## 📈 Monitoring

Set up alerts for:
- Daily revenue drops > 20%
- Ad performance below thresholds
- Conversion rate changes
- User upgrade patterns

This system will automatically maximize revenue while maintaining a great user experience for both free and Pro users.