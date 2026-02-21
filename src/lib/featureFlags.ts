// Feature flags configuration
export interface FeatureFlags {
  // Tool availability flags
  enableAudioTools: boolean
  enableVideoTools: boolean
  enableOCRTools: boolean
  enableQRTools: boolean
  enableTextTools: boolean
  
  // UI/UX flags
  enableDarkMode: boolean
  enableProFeatures: boolean
  enableAnalytics: boolean
  enableAds: boolean
  
  // Performance flags
  enableClientSideProcessing: boolean
  enableBatchProcessing: boolean
  enableProgressTracking: boolean
  
  // Experimental flags
  enableExperimentalFeatures: boolean
  enableBetaTools: boolean
  enableAdvancedSettings: boolean
}

// Default feature flags - can be overridden by environment or remote config
const defaultFlags: FeatureFlags = {
  // Tool availability
  enableAudioTools: false, // Not implemented yet
  enableVideoTools: false, // Not implemented yet
  enableOCRTools: false,   // Not implemented yet
  enableQRTools: false,    // Not implemented yet
  enableTextTools: false, // Not implemented yet
  
  // UI/UX
  enableDarkMode: true,
  enableProFeatures: true,
  enableAnalytics: true,
  enableAds: true,
  
  // Performance
  enableClientSideProcessing: true,
  enableBatchProcessing: true,
  enableProgressTracking: true,
  
  // Experimental
  enableExperimentalFeatures: false,
  enableBetaTools: false,
  enableAdvancedSettings: false
}

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  const env = import.meta.env
  
  return {
    enableAnalytics: env.VITE_ENABLE_ANALYTICS !== 'false',
    enableAds: env.VITE_ENABLE_ADS !== 'false',
    enableExperimentalFeatures: env.VITE_ENABLE_EXPERIMENTAL === 'true',
    enableBetaTools: env.VITE_ENABLE_BETA_TOOLS === 'true'
  }
}

// Remote config (could be fetched from API in the future)
const getRemoteFlags = async (): Promise<Partial<FeatureFlags>> => {
  try {
    // In the future, this could fetch from a remote config service
    // For now, return empty object
    return {}
  } catch (error) {
    console.warn('Failed to fetch remote feature flags:', error)
    return {}
  }
}

// Local storage overrides (for development/testing)
const getLocalStorageFlags = (): Partial<FeatureFlags> => {
  try {
    const stored = localStorage.getItem('convertall-feature-flags')
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to parse local storage feature flags:', error)
    return {}
  }
}

// Combine all flag sources
let cachedFlags: FeatureFlags | null = null

export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  if (cachedFlags) {
    return cachedFlags
  }

  const environmentFlags = getEnvironmentFlags()
  const remoteFlags = await getRemoteFlags()
  const localFlags = getLocalStorageFlags()

  cachedFlags = {
    ...defaultFlags,
    ...environmentFlags,
    ...remoteFlags,
    ...localFlags
  }

  return cachedFlags
}

// Synchronous version for immediate use (uses cached or default flags)
export const getFeatureFlagsSync = (): FeatureFlags => {
  if (cachedFlags) {
    return cachedFlags
  }

  const environmentFlags = getEnvironmentFlags()
  const localFlags = getLocalStorageFlags()

  return {
    ...defaultFlags,
    ...environmentFlags,
    ...localFlags
  }
}

// Check if a specific feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlagsSync()
  return flags[feature]
}

// Update feature flags (for development/testing)
export const updateFeatureFlags = (updates: Partial<FeatureFlags>): void => {
  const currentFlags = getFeatureFlagsSync()
  const newFlags = { ...currentFlags, ...updates }
  
  cachedFlags = newFlags
  localStorage.setItem('convertall-feature-flags', JSON.stringify(updates))
}

// Reset feature flags to defaults
export const resetFeatureFlags = (): void => {
  cachedFlags = null
  localStorage.removeItem('convertall-feature-flags')
}

// Hook for React components
import { useState, useEffect } from 'react'

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlagsSync())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeatureFlags().then(newFlags => {
      setFlags(newFlags)
      setLoading(false)
    })
  }, [])

  return { flags, loading, isFeatureEnabled }
}

// Hook for checking a specific feature
export const useFeatureFlag = (feature: keyof FeatureFlags) => {
  const { flags, loading } = useFeatureFlags()
  return { enabled: flags[feature], loading }
}