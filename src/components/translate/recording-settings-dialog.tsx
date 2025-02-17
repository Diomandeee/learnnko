"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useRecordingSettings } from "@/store/use-recording-settings"

export function RecordingSettingsDialog() {
  const { maxDuration, setMaxDuration } = useRecordingSettings()
  const [localDuration, setLocalDuration] = useState(maxDuration)

  const handleDurationChange = (values: number[]) => {
    setLocalDuration(values[0])
    setMaxDuration(values[0])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Recording Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recording Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Maximum Recording Duration (seconds)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localDuration]}
                onValueChange={handleDurationChange}
                min={5}
                max={120}
                step={5}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono">
                {localDuration}s
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
