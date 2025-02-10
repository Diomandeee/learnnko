"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MapPin,
  Star,
  Building2,
  DollarSign,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DaySchedule, TimeBlock } from "@/types/schedule"
import { TIME_SLOTS, TIME_BLOCK_COLORS } from "@/constants/time-slots"

interface ScheduleDayViewProps {
  schedule?: DaySchedule
  timeBlocks: TimeBlock[]
  onRemoveTimeBlock: (id: string) => void
}

export function ScheduleDayView({
  schedule,
  timeBlocks,
  onRemoveTimeBlock
}: ScheduleDayViewProps) {
  const timelineItems = useMemo(() => {
    const items: Array<{
      time: string
      blocks: TimeBlock[]
      visits: typeof schedule.visits
    }> = TIME_SLOTS.map(time => ({
      time,
      blocks: [],
      visits: []
    }))

    // Add time blocks
    timeBlocks.forEach(block => {
      const startIdx = TIME_SLOTS.indexOf(block.startTime)
      if (startIdx !== -1) {
        items[startIdx].blocks.push(block)
      }
    })

    // Add scheduled visits
    schedule?.visits.forEach(visit => {
      const startIdx = TIME_SLOTS.indexOf(visit.startTime)
      if (startIdx !== -1) {
        items[startIdx].visits.push(visit)
      }
    })

    return items
  }, [timeBlocks, schedule])

  return (
    <div className="space-y-2">
      {timelineItems.map(({ time, blocks, visits }) => (
        <div key={time} className="grid grid-cols-[80px,1fr] gap-4">
          <div className="text-sm text-muted-foreground">{time}</div>
          <div className="space-y-2">
            {blocks.map(block => (
              <div
                key={block.id}
                className={cn(
                  "rounded-lg border p-2 relative group",
                  TIME_BLOCK_COLORS[block.type]
                )}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => onRemoveTimeBlock(block.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="font-medium">{block.title}</div>
                <div className="text-sm">
                  {block.startTime} - {block.endTime}
                </div>
              </div>
            ))}

            {visits.map(visit => (
              <div
                key={visit.id}
                className="rounded-lg border border-yellow-200 bg-yellow-50 p-2"
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

                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {visit.startTime} - {visit.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {visit.shop.area}
                  </div>
                  {visit.shop.volume && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {visit.shop.volume}/wk
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
