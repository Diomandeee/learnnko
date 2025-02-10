"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Star,
  Building2,
  DollarSign
} from "lucide-react"
import { DaySchedule as DayScheduleType } from "@/types/schedule"

interface DayScheduleProps {
  day: number
  schedule?: DayScheduleType
  date?: Date
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function DaySchedule({
  day,
  schedule,
  date
}: DayScheduleProps) {
  // Group visits by area
  const visitsByArea = schedule?.visits.reduce((acc, visit) => {
    const area = visit.shop.area || 'Other';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(visit);
    return acc;
  }, {} as Record<string, typeof schedule.visits>) || {};

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{DAYS[day]}</h3>
          {date && (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </span>
          )}
        </div>
        <Badge variant="outline">
          {schedule?.visits.length || 0} locations
        </Badge>
      </div>

      <div className="space-y-6">
        {Object.entries(visitsByArea).map(([area, visits]) => (
          <div key={area} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {area}
            </h4>
            <div className="space-y-2">
              {visits.map(visit => (
                <div
                  key={visit.id}
                  className="rounded-lg border p-3 bg-card hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{visit.shop.title}</div>
                    <div className="flex items-center gap-1">
                      {visit.isPriority && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          Priority
                        </Badge>
                      )}
                      {visit.shop.isPartner && (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          Partner
                        </Badge>
                      )}
                    </div>
                  </div>

                  {visit.shop.volume && (
                    <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {visit.shop.volume}/wk
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!schedule?.visits.length && (
          <div className="text-center py-6 text-muted-foreground">
            No locations scheduled
          </div>
        )}
      </div>
    </Card>
  )
}
