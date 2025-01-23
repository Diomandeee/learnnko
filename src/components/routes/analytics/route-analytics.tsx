"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitStats } from "./visit-stats"
import { VisitChart } from "./visit-chart"
import { LeadsAnalytics } from "./leads-analytics"

export function RouteAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Visit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitStats />
          <VisitChart />
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}
