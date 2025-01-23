"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"

interface VisitStats {
  totalVisits: number
  totalShops: number
  visitedShops: number
  visitRate: number
  leadsGenerated: number
  conversionRate: number
}

export function VisitStats() {
  const { shops, loading } = useShops()
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    totalShops: 0,
    visitedShops: 0,
    visitRate: 0,
    leadsGenerated: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (shops && shops.length > 0) {
      const visitedShops = shops.filter(shop => shop.visited).length
      const leadsGenerated = shops.filter(shop => shop.parlor_coffee_leads).length

      setStats({
        totalVisits: 0, // This would come from Visit records
        totalShops: shops.length,
        visitedShops,
        visitRate: (visitedShops / shops.length) * 100,
        leadsGenerated,
        conversionRate: (leadsGenerated / visitedShops) * 100 || 0
      })
    }
  }, [shops])

  if (loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Visit Rate"
        value={`${stats.visitRate.toFixed(1)}%`}
        description={`${stats.visitedShops} of ${stats.totalShops} shops`}
      />
      <StatCard
        title="Leads Generated"
        value={stats.leadsGenerated.toString()}
        description="Potential opportunities"
      />
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        description="Visits to leads"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
