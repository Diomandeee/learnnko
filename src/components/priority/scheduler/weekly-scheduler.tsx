"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Plus,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Clock
} from "lucide-react"
import { CollapsibleDay } from "./collapsible-day"
import { TimeBlockDialog } from "./time-block-dialog"
import { ScheduleSettings } from "./schedule-settings"
import { useScheduleStore } from "@/store/schedule-store"
import { usePriorityStore } from "@/store/priority-store"
import { generateScheduleForWeek } from "@/lib/generate-schedule"
import { toast } from "@/components/ui/use-toast"
import { addDays, subDays, startOfWeek, format } from "date-fns"
import { useScheduleView } from "@/contexts/schedule-view-context"

export function WeeklyScheduler() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [timeBlockOpen, setTimeBlockOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const { viewMode, toggleView } = useScheduleView()
  
  const { 
    currentSchedule: schedule,
    timeBlocks,
    updateSchedule,
    addTimeBlock,
    removeTimeBlock
  } = useScheduleStore()

  const { selectedShops } = usePriorityStore()

  const handleGenerateSchedule = async () => {
    if (selectedShops.length === 0) {
      toast({
        title: "No locations selected",
        description: "Please select priority locations first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const newSchedule = await generateScheduleForWeek(currentWeekStart);
      updateSchedule(newSchedule);
      
      toast({
        title: "Schedule generated",
        description: `Created schedule with ${newSchedule.days.reduce((sum, day) => 
          sum + day.visits.length, 0)} total visits`
      });
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleView}
            >
              {viewMode === 'list' ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule View
                </>
              ) : (
                <>
                  <LayoutList className="h-4 w-4 mr-2" />
                  List View
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeBlockOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Week
            </Button>
            <div className="font-medium">
              Week of {format(currentWeekStart, 'MMM d, yyyy')}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextWeek}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Daily Schedules */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <CollapsibleDay
                key={index}
                day={index}
                schedule={schedule?.days[index]}
                date={addDays(currentWeekStart, index)}
                timeBlocks={timeBlocks.filter(block => block.day === index)}
                onRemoveTimeBlock={removeTimeBlock}
              />
            ))}
          </div>

          {/* Generate Schedule Button */}
          <Button
            className="w-full"
            onClick={handleGenerateSchedule}
            disabled={isGenerating || selectedShops.length === 0}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Weekly Schedule
              </>
            )}
          </Button>

          {selectedShops.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Select priority locations to generate a schedule
            </p>
          )}
        </div>
      </CardContent>

      {/* Dialogs */}
      <TimeBlockDialog
        open={timeBlockOpen}
        onOpenChange={setTimeBlockOpen}
        onAddBlock={addTimeBlock}
      />
      <ScheduleSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </Card>
  )
}
