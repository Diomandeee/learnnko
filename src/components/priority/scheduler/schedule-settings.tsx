"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { usePriorityStore } from "@/store/priority-store"

interface ScheduleSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleSettings({
  open,
  onOpenChange
}: ScheduleSettingsProps) {
  const { settings, updateSettings } = usePriorityStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={localSettings.startTime}
                onChange={(e) => 
                  setLocalSettings({
                    ...localSettings,
                    startTime: e.target.value
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={localSettings.endTime}
                onChange={(e) => 
                  setLocalSettings({
                    ...localSettings,
                    endTime: e.target.value
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Regular Visit Duration (minutes)</Label>
            <Slider
              value={[localSettings.visitDuration]}
              onValueChange={(value) => 
                setLocalSettings({
                  ...localSettings,
                  visitDuration: value[0]
                })
              }
              min={15}
              max={60}
              step={15}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.visitDuration} minutes
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority Visit Duration (minutes)</Label>
            <Slider
              value={[localSettings.priorityVisitDuration]}
              onValueChange={(value) => 
                setLocalSettings({...localSettings,
                  priorityVisitDuration: value[0]
                })
              }
              min={30}
              max={90}
              step={15}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.priorityVisitDuration} minutes
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Travel Time Between Visits (minutes)</Label>
            <Slider
              value={[localSettings.maxTravelTime]}
              onValueChange={(value) => 
                setLocalSettings({
                  ...localSettings,
                  maxTravelTime: value[0]
                })
              }
              min={15}
              max={60}
              step={5}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.maxTravelTime} minutes
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prioritize Geographical Clusters</Label>
                <div className="text-sm text-muted-foreground">
                  Optimize for locations in the same area
                </div>
              </div>
              <Switch
                checked={localSettings.prioritizeClusters}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    prioritizeClusters: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Balance Weekly Distribution</Label>
                <div className="text-sm text-muted-foreground">
                  Spread priority visits across the week
                </div>
              </div>
              <Switch
                checked={localSettings.balanceWeekly}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    balanceWeekly: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Nearby Locations</Label>
                <div className="text-sm text-muted-foreground">
                  Add non-priority locations when convenient
                </div>
              </div>
              <Switch
                checked={localSettings.includeNearby}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    includeNearby: checked
                  })
                }
              />
            </div>
          </div>

          {localSettings.includeNearby && (
            <div className="space-y-2">
              <Label>Search Radius for Nearby Locations (km)</Label>
              <Slider
                value={[localSettings.nearbyRadius]}
                onValueChange={(value) => 
                  setLocalSettings({
                    ...localSettings,
                    nearbyRadius: value[0]
                  })
                }
                min={0.5}
                max={5}
                step={0.5}
              />
              <div className="text-sm text-muted-foreground">
                {localSettings.nearbyRadius} kilometers
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

