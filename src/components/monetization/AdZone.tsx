interface AdZoneProps {
  zoneId: string
  className?: string
}

export default function AdZone({ zoneId, className }: AdZoneProps) {
  return (
    <div className={className}>
      {/* Placeholder for ads */}
      <div className="text-xs text-gray-400 text-center py-2">
        Ad Zone: {zoneId}
      </div>
    </div>
  )
}