import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, DollarSign, MousePointer, FileText, Image, Zap } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalConversions: number
  revenue: number
  adClicks: number
  topTools: Array<{ name: string; usage: number }>
  revenueBySource: Array<{ source: string; amount: number }>
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalConversions: 0,
    revenue: 0,
    adClicks: 0,
    topTools: [],
    revenueBySource: []
  })
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Simulate analytics data (in production, fetch from your analytics API)
  useEffect(() => {
    const simulatedData: AnalyticsData = {
      totalUsers: Math.floor(Math.random() * 10000) + 1000,
      totalConversions: Math.floor(Math.random() * 50000) + 5000,
      revenue: Math.floor(Math.random() * 1000) + 100,
      adClicks: Math.floor(Math.random() * 5000) + 500,
      topTools: [
        { name: 'PDF to Image', usage: Math.floor(Math.random() * 1000) + 500 },
        { name: 'PDF Text Extract', usage: Math.floor(Math.random() * 800) + 300 },
        { name: 'Image Converter', usage: Math.floor(Math.random() * 600) + 200 },
        { name: 'Background Remover', usage: Math.floor(Math.random() * 400) + 100 }
      ],
      revenueBySource: [
        { source: 'AdSense', amount: Math.floor(Math.random() * 500) + 50 },
        { source: 'Pro Subscriptions', amount: Math.floor(Math.random() * 400) + 30 },
        { source: 'Affiliate', amount: Math.floor(Math.random() * 200) + 20 }
      ]
    }
    setData(simulatedData)
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">ConvertAll Hub Performance Metrics</p>
        </div>
        
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalConversions)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.adClicks)}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tools</CardTitle>
            <CardDescription>Most used conversion tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topTools.map((tool, index) => (
                <div key={tool.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {index === 0 ? <FileText className="h-4 w-4 text-blue-600" /> : 
                       index === 1 ? <FileText className="h-4 w-4 text-green-600" /> :
                       <Image className="h-4 w-4 text-purple-600" />}
                    </div>
                    <span className="font-medium">{tool.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatNumber(tool.usage)}</div>
                    <div className="text-xs text-muted-foreground">uses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Income breakdown by monetization method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueBySource.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(source.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((source.amount / data.revenue) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Optimize your monetization strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Optimize Ad Placement
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              A/B Test Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Goal Progress</CardTitle>
          <CardDescription>Track progress toward financial independence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Current Monthly Revenue</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((data.revenue / 6000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Goal: $6,000/month</span>
              <span>{Math.round((data.revenue / 6000) * 100)}% complete</span>
            </div>
            {data.revenue >= 6000 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    🎉 Congratulations! You've reached your financial independence goal!
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}