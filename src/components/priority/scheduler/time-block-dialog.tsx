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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeBlock, TimeBlockType } from "@/types/schedule"

interface TimeBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBlock: (block: TimeBlock) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const BLOCK_TYPES: { value: TimeBlockType; label: string }[] = [
  { value: "TEAM_MEETING", label: "Team Meeting" },
  { value: "CLIENT_MEETING", label: "Client Meeting" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "BREAK", label: "Break" },
  { value: "OTHER", label: "Other" }
]

export function TimeBlockDialog({
  open,
  onOpenChange,
  onAddBlock
}: TimeBlockDialogProps) {
  const [block, setBlock] = useState<Partial<TimeBlock>>({
    type: "TEAM_MEETING",
    day: 0,
    startTime: "09:00",
    endTime: "10:00",
    recurrent: true
  })

  const handleSubmit = () => {
    if (!block.title || !block.type || !block.startTime || !block.endTime) {
      return
    }

    onAddBlock({
      id: crypto.randomUUID(),
      title: block.title,
      type: block.type,
      day: block.day || 0,
      startTime: block.startTime,
      endTime: block.endTime,
      description: block.description,
      recurrent: block.recurrent || false
    })

    onOpenChange(false)
    setBlock({
      type: "TEAM_MEETING",
      day: 0,
      startTime: "09:00",
      endTime: "10:00",
      recurrent: true
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Block</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={block.title || ""}
              onChange={(e) => setBlock({ ...block, title: e.target.value })}
              placeholder="Enter block title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={block.type}
                onValueChange={(value: TimeBlockType) => 
                  setBlock({ ...block, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Day</Label>
              <Select
                value={block.day?.toString()}
                onValueChange={(value) => 
                  setBlock({ ...block, day: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={block.startTime}
                onChange={(e) => 
                  setBlock({ ...block, startTime: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={block.endTime}
                onChange={(e) => 
                  setBlock({ ...block, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description (Optional)</Label>
            <Input
              value={block.description || ""}
              onChange={(e) => 
                setBlock({ ...block, description: e.target.value })
              }
              placeholder="Add description"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Recurring Weekly</Label>
            <Switch
              checked={block.recurrent}
              onCheckedChange={(checked) => 
                setBlock({ ...block, recurrent: checked })
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
          <Button onClick={handleSubmit}>
            Add Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
