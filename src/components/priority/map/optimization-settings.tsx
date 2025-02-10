"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface OptimizationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OptimizationSettings({
  open,
  onOpenChange
}: OptimizationSettingsProps) {
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
          <DialogTitle>Route Optimization Settings</DialogTitle>
          <DialogDescription>
            Configure how routes are optimized and generated
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Stops</Label>
              <Slider
                value={[localSettings.maxStops]}
                onValueChange={(value) => 
                  setLocalSettings({ ...localSettings, maxStops: value[0] })
                }
                min={5}
                max={20}
                step={1}
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.maxStops} stops
              </span>
            </div>

            <div className="space-y-2">
              <Label>Time Per Stop (minutes)</Label>
              <Slider
                value={[localSettings.timePerStop]}
                onValueChange={(value) => 
                  setLocalSettings({ ...localSettings, timePerStop: value[0] })
                }
                min={15}
                max={60}
                step={5}
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.timePerStop} minutes
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={localSettings.startTime}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={localSettings.endTime}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Travel Time Between Stops (minutes)</Label>
            <Slider
              value={[localSettings.maxTravelTime]}
              onValueChange={(value) => 
                setLocalSettings({ ...localSettings, maxTravelTime: value[0] })
              }
              min={15}
              max={90}
              step={15}
            />
            <span className="text-sm text-muted-foreground">
              {localSettings.maxTravelTime} minutes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Prefer Higher Rated</Label>
                <div className="text-sm text-muted-foreground">
                  Prioritize locations with better ratings
                </div>
              </div>
              <Switch
                checked={localSettings.preferHigherRated}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, preferHigherRated: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Avoid Traffic</Label>
                <div className="text-sm text-muted-foreground">
                  Consider traffic conditions in route planning
                </div>
              </div>
              <Switch
                checked={localSettings.avoidTraffic}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, avoidTraffic: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Prioritize Unvisited</Label>
              <div className="text-sm text-muted-foreground">
                Give higher priority to locations not yet visited
              </div>
            </div>
            <Switch
              checked={localSettings.prioritizeUnvisited}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, prioritizeUnvisited: checked })
              }
            />
          </div>
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
