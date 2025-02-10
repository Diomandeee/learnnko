"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePriorityStore } from "@/store/priority-store"
import { 
  Clock, 
  MapPin, 
  BarChart2, 
  Calendar,
  Star,
  Building,
  User,
  DollarSign
} from "lucide-react"

export function RouteSummary() {
  const { 
    optimizedRoute, 
    routeMetrics, 
    settings 
  } = usePriorityStore()

  if (!optimizedRoute.length || !routeMetrics) return null

  // Calculate route statistics
  const routeStats = {
    totalPartners: optimizedRoute.filter(shop => shop.isPartner).length,
    totalLeads: optimizedRoute.filter(shop => shop.parlor_coffee_leads).length,
    totalUnvisited: optimizedRoute.filter(shop => !shop.visited).length,
    averagePriority: optimizedRoute.reduce((acc, shop) => 
      acc + (shop.priority || 0), 0) / optimizedRoute.length,
    potentialRevenue: optimizedRoute.reduce((acc, shop) => {
      if (!shop.volume) return acc
      const volume = parseFloat(shop.volume)
      if (isNaN(volume)) return acc
      return acc + (volume * 52 * 18) // Weekly volume * 52 weeks * $18
    }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Summary</CardTitle>
        <CardDescription>
          Optimized route with {optimizedRoute.length} stops
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Distance</div>
              <div className="text-2xl font-bold">
                {routeMetrics.totalDistance.toFixed(1)} km
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Duration</div>
              <div className="text-2xl font-bold">
                {Math.round(routeMetrics.totalDuration)} min
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Arrival Time</div>
              <div className="text-2xl font-bold">
                {routeMetrics.estimatedArrival}
              </div>
            </div>
          </div>

          {/* Route Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium">Location Types</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Partners</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalPartners}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Leads</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalLeads}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Unvisited</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalUnvisited}</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium">Route Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Avg Priority</span>
                  </div>
                  <Badge variant="outline">
                    {routeStats.averagePriority.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Potential ARR</span>
                  </div>
                  <Badge variant="outline">
                    ${routeStats.potentialRevenue.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          {/* Stop List */}
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h4 className="font-medium">Stops</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-2">
                {optimizedRoute.map((shop, index) => (
                  <div
                    key={shop.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{shop.title}</span>
                        {shop.isPartner && (
                          <Badge variant="success">Partner</Badge>
                        )}
                        {shop.parlor_coffee_leads && (
                          <Badge variant="warning">Lead</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {shop.address}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {shop.volume && (
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          {shop.volume}/wk
                        </Badge>
                      )}
                      {shop.priority && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          {shop.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
