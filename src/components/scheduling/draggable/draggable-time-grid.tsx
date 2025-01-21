"use client";

import { useRef, useState } from "react";
import { useSchedule } from "@/components/scheduling/providers/schedule-provider";
import { addDays, format, isSameDay } from "date-fns";
import { CELL_HEIGHT, getTimeFromPosition } from "@/lib/scheduling/utils";
import { DraggedShift, ScheduleCell } from "@/types/scheduling";
import { useToast } from "@/components/ui/use-toast";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM

interface DraggableTimeGridProps {
  shifts: DraggedShift[];
  onShiftMove: (shiftId: string, cell: ScheduleCell, time: Date) => void;
}

export function DraggableTimeGrid({ shifts, onShiftMove }: DraggableTimeGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { weekStart, view } = useSchedule();
  const [dragImage] = useState(() => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    return img;
  });
  const { toast } = useToast();

  const days = view === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [weekStart];

  const handleDragStart = (e: React.DragEvent, shift: DraggedShift) => {
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      shiftId: shift.id,
      originalDate: shift.startTime,
    }));
  };

  const handleDragOver = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = getTimeFromPosition(rect.top, y, date);

    // Show visual indicator for drop target
    const cell = e.currentTarget as HTMLElement;
    cell.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const cell = e.currentTarget as HTMLElement;
    cell.style.backgroundColor = '';
  };

  const handleDrop = async (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    const cell = e.currentTarget as HTMLElement;
    cell.style.backgroundColor = '';

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const rect = gridRef.current!.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const time = getTimeFromPosition(rect.top, y, date);

      const scheduleCell: ScheduleCell = {
        date,
        hour,
        shifts: shifts.filter(s => isSameDay(new Date(s.startTime), date)),
      };

      onShiftMove(data.shiftId, scheduleCell, time);
    } catch (error) {
      console.error('Drop error:', error);
      toast({
        title: "Error",
        description: "Failed to move shift",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden"
    >
      {/* Time labels column */}
      <div className="bg-background">
        <div className="sticky top-0 z-20 bg-background p-2">
          <span className="text-sm font-medium">Time</span>
        </div>
        <div>
          {HOURS.map((hour) => (
            <div 
              key={hour} 
              style={{ height: `${CELL_HEIGHT}px` }}
              className="border-t p-1"
            >
              <span className="text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0), "ha")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day columns */}
      {days.map((date) => (
        <div 
          key={date.toISOString()}
          className="relative bg-background"
        >
          <div className="sticky top-0 z-20 bg-background p-2 text-center border-b">
            <div className="text-sm font-medium">
              {format(date, "EEE")}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(date, "MMM d")}
            </div>
          </div>

          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${CELL_HEIGHT}px` }}
                className="border-t relative"
                onDragOver={(e) => handleDragOver(e, date, hour)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, date, hour)}
              />
            ))}

            {shifts
              .filter((shift) => isSameDay(new Date(shift.startTime), date))
              .map((shift) => (
                <div
                  key={shift.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, shift)}
                  className="absolute left-0 right-0 mx-1"
                  style={{
                    top: `${getTimeFromPosition(0, new Date(shift.startTime).getHours(), date)}px`,
                    height: `${CELL_HEIGHT}px`,
                  }}
                >
                  {/* Shift content here */}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
