"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  QrCode, 
  Scan, 
  Users, 
  Clock,
} from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Total Scans",
      value: "2,543",
      change: "+12.5%",
      description: "from last month",
      icon: Scan,
      color: "text-blue-500",
    },
    {
      title: "Active QR Codes",
      value: "24",
      change: "+3",
      description: "new this month",
      icon: QrCode,
      color: "text-purple-500",
    },
    {
      title: "Unique Visitors",
      value: "1,832",
      change: "+8.2%",
      description: "from last month",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Avg. Session",
      value: "2m 45s",
      change: "+12.3%",
      description: "from last month",
      icon: Clock,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                {stat.change}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
