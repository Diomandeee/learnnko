"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useVisits } from "@/hooks/use-visits"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VisitCalendar() {
  const { visits } = useVisits()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Create a map of dates to visit counts
  const visitDates = visits?.reduce((acc, visit) => {
    const date = new Date(visit.date).toDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const modifiers = {
    hasVisits: (date: Date) => {
      return !!visitDates?.[date.toDateString()]
    }
  }

  const modifiersStyles = {
    hasVisits: {
      backgroundColor: 'var(--primary)',
      color: 'white',
      borderRadius: '50%'
    }
  }

  return (
    <div className="p-4 rounded-lg border">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />

      {selectedDate && visitDates?.[selectedDate.toDateString()] > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            Visits on {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {visits?.filter(visit => 
              new Date(visit.date).toDateString() === selectedDate.toDateString()
            ).map(visit => (
              <Card key={visit.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{visit.coffeeShopId}</p>
                    <p className="text-sm text-muted-foreground">
                      Visit #{visit.visitNumber}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {visit.managerPresent && (
                      <Badge variant="outline">Manager Present</Badge>
                    )}
                    {visit.samplesDropped && (
                      <Badge variant="outline">Samples Dropped</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
