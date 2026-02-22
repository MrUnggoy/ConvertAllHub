import { useState, useEffect, useCallback } from 'react'
import { useConversion } from '@/contexts/ConversionContext'
import { trackUsage } from '@/lib/stripe'

interface UsageLimits {
  dailyConversions: number
  maxFileSize: number // in bytes
  concurrentUploads: number
  batchProcessing: boolean
  priorityProcessing: boolean
  advancedFormats: boolean
}

interface UsageStats {
  conversionsToday: number
  conversionsThisMonth: number
  lastResetDate: string
}

const FREE_LIMITS: UsageLimits = {
  dailyConversions: 10,
  maxFileSize: 25 * 1024 * 1024, // 25MB
  concurrentUploads: 1,
  batchProcessing: false,
  priorityProcessing: false,
  advancedFormats: false
}

const PRO_LIMITS: UsageLimits = {
  dailyConversions: -1, // unlimited
  maxFileSize: 500 * 1024 * 1024, // 500MB
  concurrentUploads: 10,
  batchProcessing: true,
  priorityProcessing: true,
  advancedFormats: true
}

export function useProFeatures() {
  const { state } = useConversion()
  const [usageStats, setUsageStats] = useState<UsageStats>({
    conversionsToday: 0,
    conversionsThisMonth: 0,
    lastResetDate: new Date().toDateString()
  })

  const isProUser = state.userTier === 'pro'
  const limits = isProUser ? PRO_LIMITS : FREE_LIMITS

  // Load usage stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('convertall_usage_stats')
    if (savedStats) {
      const parsed = JSON.parse(savedStats)
      
      // Reset daily count if it's a new day
      const today = new Date().toDateString()
      if (parsed.lastResetDate !== today) {
        setUsageStats({
          conversionsToday: 0,
          conversionsThisMonth: parsed.conversionsThisMonth,
          lastResetDate: today
        })
      } else {
        setUsageStats(parsed)
      }
    }
  }, [])

  // Save usage stats to localStorage
  const saveUsageStats = useCallback((stats: UsageStats) => {
    localStorage.setItem('convertall_usage_stats', JSON.stringify(stats))
    setUsageStats(stats)
  }, [])

  // Check if user can perform an action
  const canPerformAction = useCallback((action: string, fileSize?: number): { allowed: boolean; reason?: string } => {
    switch (action) {
      case 'convert':
        if (limits.dailyConversions > 0 && usageStats.conversionsToday >= limits.dailyConversions) {
          return { allowed: false, reason: 'Daily conversion limit reached' }
        }
        if (fileSize && fileSize > limits.maxFileSize) {
          return { allowed: false, reason: `File size exceeds ${Math.round(limits.maxFileSize / 1024 / 1024)}MB limit` }
        }
        return { allowed: true }

      case 'batch_processing':
        if (!limits.batchProcessing) {
          return { allowed: false, reason: 'Batch processing requires Pro subscription' }
        }
        return { allowed: true }

      case 'priority_processing':
        if (!limits.priorityProcessing) {
          return { allowed: false, reason: 'Priority processing requires Pro subscription' }
        }
        return { allowed: true }

      case 'advanced_formats':
        if (!limits.advancedFormats) {
          return { allowed: false, reason: 'Advanced formats require Pro subscription' }
        }
        return { allowed: true }

      default:
        return { allowed: true }
    }
  }, [limits, usageStats])

  // Track usage
  const trackConversionUsage = useCallback(async (_toolId: string, fileSize: number) => {
    const newStats = {
      ...usageStats,
      conversionsToday: usageStats.conversionsToday + 1,
      conversionsThisMonth: usageStats.conversionsThisMonth + 1
    }
    
    saveUsageStats(newStats)
    
    // Track usage for analytics
    await trackUsage('conversion', 1)
    
    // Track file size for Pro users
    if (isProUser) {
      await trackUsage('file_size', fileSize)
    }
  }, [usageStats, saveUsageStats, isProUser])

  // Get upgrade suggestions based on usage
  const getUpgradeSuggestions = useCallback((): string[] => {
    if (isProUser) return []

    const suggestions: string[] = []
    
    if (usageStats.conversionsToday >= limits.dailyConversions * 0.8) {
      suggestions.push('You\'re approaching your daily conversion limit')
    }
    
    if (usageStats.conversionsThisMonth >= 50) {
      suggestions.push('Heavy usage detected - Pro could save you time')
    }

    return suggestions
  }, [isProUser, usageStats, limits])

  // Get usage percentage for display
  const getUsagePercentage = useCallback((type: 'daily' | 'monthly'): number => {
    if (isProUser) return 0 // Pro users have unlimited usage
    
    if (type === 'daily') {
      return limits.dailyConversions > 0 ? (usageStats.conversionsToday / limits.dailyConversions) * 100 : 0
    }
    
    // Monthly percentage (assuming 300 conversions per month for free users)
    return Math.min((usageStats.conversionsThisMonth / 300) * 100, 100)
  }, [isProUser, usageStats, limits])

  return {
    // User status
    isProUser,
    limits,
    usageStats,
    
    // Usage checking
    canPerformAction,
    trackConversionUsage,
    
    // Upgrade suggestions
    getUpgradeSuggestions,
    getUsagePercentage,
    
    // Convenience methods
    canUploadFile: (fileSize: number) => canPerformAction('convert', fileSize),
    canBatchProcess: () => canPerformAction('batch_processing'),
    canUsePriorityProcessing: () => canPerformAction('priority_processing'),
    canUseAdvancedFormats: () => canPerformAction('advanced_formats'),
    
    // Usage display
    remainingConversions: isProUser ? -1 : Math.max(0, limits.dailyConversions - usageStats.conversionsToday),
    maxFileSize: limits.maxFileSize,
    maxFileSizeMB: Math.round(limits.maxFileSize / 1024 / 1024)
  }
}