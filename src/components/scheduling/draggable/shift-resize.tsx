"use client";

import { useEffect, useRef, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CELL_HEIGHT } from "@/lib/scheduling/utils";
import { ShiftResizeHandle } from './shift-resize-handle';
import { addMinutes, differenceInMinutes, set } from 'date-fns';

interface ShiftResizeProps {
  shiftId: string;
  startTime: Date;
  endTime: Date;
  minDuration?: number; // minimum duration in minutes
  maxDuration?: number; // maximum duration in minutes
  onResizeComplete: (newStartTime: Date, newEndTime: Date) => Promise<void>;
}

export function ShiftResize({
  shiftId,
  startTime,
  endTime,
  minDuration = 60,
  maxDuration = 480,
  onResizeComplete
}: ShiftResizeProps) {
  const [resizing, setResizing] = useState(false);
  const [tempEndTime, setTempEndTime] = useState(endTime);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleResize = (deltaPixels: number) => {
    if (!resizeRef.current) return;

    // Convert pixels to minutes (15-minute increments)
    const minutesPerPixel = 15 / (CELL_HEIGHT / 4);
    const deltaMinutes = Math.round(deltaPixels * minutesPerPixel / 15) * 15;

    const newEndTime = new Date(tempEndTime.getTime() + deltaMinutes * 60 * 1000);
    const duration = differenceInMinutes(newEndTime, startTime);

    // Validate duration constraints
    if (duration < minDuration || duration > maxDuration) return;

    setTempEndTime(newEndTime);
  };

  const handleResizeComplete = async () => {
    try {
      await onResizeComplete(startTime, tempEndTime);
      toast({
        title: "Success",
        description: "Shift duration updated",
      });
    } catch (error) {
      console.error('Resize error:', error);
      setTempEndTime(endTime); // Reset to original
      toast({
        title: "Error",
        description: "Failed to update shift duration",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      ref={resizeRef}
      className="absolute inset-0"
      style={{
        height: `${differenceInMinutes(tempEndTime, startTime) * (CELL_HEIGHT / 60)}px`
      }}
    >
      <ShiftResizeHandle
        onResize={handleResize}
        onResizeEnd={handleResizeComplete}
      />
    </div>
  );
}
