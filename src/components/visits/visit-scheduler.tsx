"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useVisits } from "@/hooks/use-visits"
import { format } from "date-fns"

export function VisitScheduler() {
  const { visits } = useVisits()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get upcoming scheduled visits
  const upcomingVisits = visits?.filter(visit => 
    visit.nextVisitDate && new Date(visit.nextVisitDate) > new Date()
  ).sort((a, b) => 
    new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime()
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="font-medium mb-2">Schedule New Visit</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        <Button className="w-full mt-4">
          Schedule Visit
        </Button>
      </div>

      <div>
        <h3 className="font-medium mb-2">Upcoming Scheduled Visits</h3>
        <div className="space-y-2">
          {upcomingVisits?.map(visit => (
            <Card key={visit.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{visit.coffeeShopId}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(visit.nextVisitDate!), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!upcomingVisits || upcomingVisits.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No upcoming visits scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
