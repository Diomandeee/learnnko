"use client"

import { formatDistanceToNow as formatDistance } from "date-fns"
import { Visit } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VisitHistoryProps {
  visits: Visit[]
}

export function VisitHistory({ visits }: VisitHistoryProps) {
  if (!visits.length) {
    return <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visit #{visit.visitNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(visit.date), new Date(), { addSuffix: true })}
              </p>
            </div>

            {visit.managerPresent && (
              <p className="text-sm">
                Manager present: {visit.managerName || "Yes"}
              </p>
            )}

            {visit.samplesDropped && (
              <p className="text-sm">
                Samples: {visit.sampleDetails || "Dropped off"}
              </p>
            )}

            {visit.notes && (
              <p className="text-sm text-muted-foreground">{visit.notes}</p>
            )}

            {visit.nextVisitDate && (
              <p className="text-xs text-muted-foreground">
                Next visit planned: {formatDistance(new Date(visit.nextVisitDate), new Date(), { addSuffix: true })}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
