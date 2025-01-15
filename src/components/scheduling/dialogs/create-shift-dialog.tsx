"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface CreateShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  selectedHour: number;
  onShiftCreated: () => void;
}

export function CreateShiftDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedHour,
  onShiftCreated,
}: CreateShiftDialogProps) {
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(selectedDate);
    date.setHours(selectedHour, 0, 0, 0);
    return format(date, "HH:mm");
  });
  const [duration, setDuration] = useState(4); // Default 4 hours
  const [shiftType, setShiftType] = useState<'COFFEE' | 'WINE'>('COFFEE');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Create start time from selected date and time
      const [hours, minutes] = startTime.split(':').map(Number);
      const shiftStartTime = new Date(selectedDate);
      shiftStartTime.setHours(hours, minutes, 0, 0);

      // Calculate end time based on duration
      const shiftEndTime = new Date(shiftStartTime);
      shiftEndTime.setHours(shiftStartTime.getHours() + duration);

      const response = await fetch('/api/scheduling/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: shiftType,
          startTime: shiftStartTime.toISOString(),
          endTime: shiftEndTime.toISOString(),
          status: 'DRAFT',
        }),
      });

      if (!response.ok) throw new Error('Failed to create shift');

      toast({
        title: "Success",
        description: "Shift created successfully",
      });

      onShiftCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              value={format(selectedDate, "MMMM d, yyyy")}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (hours)</label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map((hours) => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} hours
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shift Type</label>
            <Select
              value={shiftType}
              onValueChange={(value: 'COFFEE' | 'WINE') => setShiftType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COFFEE">Coffee Service</SelectItem>
                <SelectItem value="WINE">Wine Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Shift"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
