"use client"

import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Star,
  Building2,
  DollarSign
} from "lucide-react"
import { DaySchedule } from "@/types/schedule"

interface ListDayViewProps {
  schedule?: DaySchedule
}

export function ListDayView({ schedule }: ListDayViewProps) {
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
  )
}
