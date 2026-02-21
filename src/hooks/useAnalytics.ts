export function useAnalytics() {
  const trackConversionStarted = (toolId: string, fileType: string, fileSize: number) => {
    console.log('Analytics: Conversion started', { toolId, fileType, fileSize })
  }

  const trackConversionCompleted = (toolId: string, processingTime: number, success: boolean) => {
    console.log('Analytics: Conversion completed', { toolId, processingTime, success })
  }

  const trackUpgradePromptShown = (trigger: string, toolId: string) => {
    console.log('Analytics: Upgrade prompt shown', { trigger, toolId })
  }

  const trackUserEngagement = (event: string, toolId: string) => {
    console.log('Analytics: User engagement', { event, toolId })
  }

  return {
    trackConversionStarted,
    trackConversionCompleted,
    trackUpgradePromptShown,
    trackUserEngagement
  }
}