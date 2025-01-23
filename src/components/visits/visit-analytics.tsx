"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVisits } from "@/hooks/use-visits"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { 
  Activity,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
} from "lucide-react"

interface VisitAnalyticsProps {
  className?: string
}

export function VisitAnalytics({ className }: VisitAnalyticsProps) {
  const { visits, loading } = useVisits()

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>Loading analytics...</CardContent>
      </Card>
    )
  }

  // Calculate analytics
  const totalVisits = visits?.length || 0
  const managerMeetings = visits?.filter(visit => visit.managerPresent).length || 0
  const samplesDropped = visits?.filter(visit => visit.samplesDropped).length || 0
  const scheduledVisits = visits?.filter(visit => visit.nextVisitDate).length || 0

  // Create monthly data for chart
  const monthlyData = visits?.reduce((acc, visit) => {
    const month = new Date(visit.date).toLocaleString('default', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(monthlyData || {}).map(([month, count]) => ({
    month,
    visits: count
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Visit Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 grid-cols-2">
          <StatCard 
            title="Total Visits"
            value={totalVisits}
            icon={Activity}
            description="All time visits"
          />
          <StatCard 
            title="Manager Meetings"
            value={managerMeetings}
            icon={Users}
            description="With management"
          />
          <StatCard 
            title="Samples Dropped"
            value={samplesDropped}
            icon={Briefcase}
            description="Sample deliveries"
          />
          <StatCard 
            title="Scheduled"
            value={scheduledVisits}
            icon={Calendar}
            description="Upcoming visits"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Monthly Visit Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="visits" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  description: string
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
