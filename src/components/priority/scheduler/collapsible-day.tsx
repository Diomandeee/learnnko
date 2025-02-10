"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MapPin,
  Star,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DaySchedule as DayScheduleType } from "@/types/schedule"
import { ListDayView } from "./list-day-view"
import { ScheduleDayView } from "./schedule-day-view"
import { useScheduleView } from "@/contexts/schedule-view-context"

interface CollapsibleDayProps {
  day: number
  schedule?: DayScheduleType
  date?: Date
  timeBlocks: any[]
  onRemoveTimeBlock: (id: string) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function CollapsibleDay({
  day,
  schedule,
  date,
  timeBlocks,
  onRemoveTimeBlock
}: CollapsibleDayProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { viewMode } = useScheduleView()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-none flex items-center justify-between p-4",
              isOpen && "border-b"
            )}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{DAYS[day]}</h3>
              {date && (
                <span className="text-sm text-muted-foreground">
                  {date.toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {schedule?.visits.length || 0} locations
              </Badge>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4">
            {viewMode === 'list' ? (
              <ListDayView 
                schedule={schedule}
              />
            ) : (
              <ScheduleDayView
                schedule={schedule}
                timeBlocks={timeBlocks}
                onRemoveTimeBlock={onRemoveTimeBlock}
              />
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
