"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { 
  CalendarIcon, 
  X, 
  Check, 
  Calendar as CalendarIcon2,
  Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
  onRemove?: () => Promise<void>
  disabled?: boolean
  className?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  description?: string
  label?: string
}

export function DateCell({
  date,
  onUpdate,
  onRemove,
  disabled = false,
  className,
  showTime = false,
  minDate,
  maxDate,
  description,
  label
}: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const handleSelect = async (newDate: Date | undefined) => {
    if (!newDate || !isValid(newDate)) return

    try {
      setIsUpdating(true)
      await onUpdate(newDate)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return

    try {
      setIsUpdating(true)
      await onRemove()
      setShowConfirmDialog(false)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date removed successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formattedDate = date ? format(date, "MM-dd-yyyy") : null
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={date ? "outline" : "ghost"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled || isUpdating}
          >
            <div className="flex items-center gap-2">
              {formattedDate ?? "Not set"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-3">
            {label && (
              <div className="font-medium">{label}</div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground">
                {description}
              </div>
            )}
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={handleSelect}
              disabled={disabled || isUpdating || (date => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              })}
              initialFocus
            />
            {onRemove && date && (
              <div className="border-t pt-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={disabled || isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Date
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirm Remove Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Date</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this date? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper function to format distance to now 
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}