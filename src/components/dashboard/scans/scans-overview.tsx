"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Smartphone, 
  Monitor, 
  Globe, 
  TrendingUp,
  Users,
  Clock,
  Map
} from "lucide-react"

export function ScansOverview() {
  const stats = [
    {
      title: "Total Scans",
      value: "2,543",
      change: "+12.3%",
      timeFrame: "from last month",
      icon: TrendingUp,
      iconColor: "text-blue-500",
    },
    {
      title: "Unique Users",
      value: "1,325",
      change: "+8.1%",
      timeFrame: "from last month",
      icon: Users,
      iconColor: "text-violet-500",
    },
    {
      title: "Avg. Duration",
      value: "2m 45s",
      change: "+3.2%",
      timeFrame: "from last month",
      icon: Clock,
      iconColor: "text-green-500",
    },
    {
      title: "Top Location",
      value: "United States",
      subtitle: "32% of scans",
      icon: Map,
      iconColor: "text-orange-500",
    },
    {
      title: "Mobile",
      value: "68%",
      subtitle: "1,729 scans",
      icon: Smartphone,
      iconColor: "text-pink-500",
    },
    {
      title: "Desktop",
      value: "24%",
      subtitle: "612 scans",
      icon: Monitor,
      iconColor: "text-indigo-500",
    },
    {
      title: "Top Browser",
      value: "Chrome",
      subtitle: "45% of scans",
      icon: Globe,
      iconColor: "text-teal-500",
    },
    {
      title: "Top Device",
      value: "iPhone",
      subtitle: "23% of scans",
      icon: Smartphone,
      iconColor: "text-pink-500",
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.timeFrame}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
