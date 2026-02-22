import { cn } from '@/lib/utils'

export interface AdZoneConfig {
  id: string
  enabled: boolean
  type: 'ad' | 'promotion'
  content: {
    html?: string
    component?: React.ComponentType
  }
  label?: string
  position: 'top' | 'bottom' | 'sidebar'
}

interface AdZoneProps {
  config: AdZoneConfig
  className?: string
}

export default function AdZone({ config, className }: AdZoneProps) {
  if (!config.enabled) {
    return null
  }

  return (
    <div className={cn("rounded-lg border p-4 bg-gray-50 dark:bg-gray-900/50", className)}>
      {config.label && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{config.label}</p>
      )}
      {config.content.html && (
        <div dangerouslySetInnerHTML={{ __html: config.content.html }} />
      )}
      {config.content.component && <config.content.component />}
    </div>
  )
}
