import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UsageDashboardProps {
  onUpgradeClick: () => void
}

export default function UsageDashboard({ onUpgradeClick }: UsageDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Usage Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Free Plan: 5/10 conversions used
          </div>
          <Button size="sm" onClick={onUpgradeClick} className="w-full">
            Upgrade to Pro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}