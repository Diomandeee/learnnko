"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWeeklyDeliveries } from "@/hooks/use-weekly-deliveries"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Truck,
  Package,
  AlertCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouteStore } from "@/store/route-store"

interface DeliveryScheduleProps {
  shops: any[]
}

export function DeliverySchedule({ shops }: DeliveryScheduleProps) {
  const { toast } = useToast()
  const { 
    currentWeek,
    weeklyDeliveries,
    totalVolume,
    changeWeek,
    error
  } = useWeeklyDeliveries(shops)

  const { addLocations, clearRoute } = useRouteStore()

  const generateDeliveryRoute = () => {
    if (weeklyDeliveries.length === 0) {
      toast({
        title: "No deliveries",
        description: "There are no deliveries scheduled for this week",
        variant: "destructive"
      })
      return
    }
    
    clearRoute()
    const shopsForDelivery = weeklyDeliveries.map(delivery => delivery.shop)
    addLocations(shopsForDelivery)

    toast({
      title: "Route Generated",
      description: `Created route for ${shopsForDelivery.length} deliveries`
    })
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Week {currentWeek} Deliveries</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="secondary">
                  Week {currentWeek}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeWeek(currentWeek + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={generateDeliveryRoute}
              disabled={weeklyDeliveries.length === 0}
              className="w-full"
            >
              <Truck className="mr-2 h-4 w-4" />
              Generate Route for Week {currentWeek}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
       

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {weeklyDeliveries.map(({ shop, volume }) => (
                  <div
                    key={shop.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{shop.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Package className="h-3 w-3" />
                            {volume} units
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {shop.delivery_frequency?.toLowerCase() || 'weekly'}
                          </Badge>
                          <Badge variant="outline">
                            First: Week {shop.first_delivery_week}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {weeklyDeliveries.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No deliveries scheduled for this week
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Weekly Volume:</span>
              <span className="text-xl font-bold">{totalVolume.toFixed(1)} units</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Average Per Partner:</span>
              <span>
                {weeklyDeliveries.length > 0 
                  ? (totalVolume / weeklyDeliveries.length).toFixed(1) 
                  : 0} units
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Partners This Week:</span>
              <span>{weeklyDeliveries.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
