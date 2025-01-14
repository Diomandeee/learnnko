"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  List
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Added missing import

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SHIFT_COLORS = {
  COFFEE: {
    bg: 'bg-blue-500/90',
    hover: 'hover:bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600'
  },
  WINE: {
    bg: 'bg-purple-500/90',
    hover: 'hover:bg-purple-600',
    text: 'text-white',
    border: 'border-purple-600'
  },
};

type ViewType = 'day' | 'week' | 'month';

interface Shift {
  id: string;
  type: 'COFFEE' | 'WINE';
  startTime: string;
  endTime: string;
  status: string;
  assignedStaff: Array<{
    staff: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export function ShiftCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('week');
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, [weekStart]);

  const fetchShifts = async () => {
    try {
      const weekEnd = addWeeks(weekStart, 1);
      const response = await fetch(`/api/scheduling/shifts?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignedStaffDisplay = (shift: Shift) => {
    if (!shift.assignedStaff || shift.assignedStaff.length === 0) {
      return "Unassigned";
    }
    return shift.assignedStaff
      .map(assignment => assignment.staff.name)
      .join(', ');
  };

  const calculateOverlappingShifts = (shifts: Shift[]) => {
    const sortedShifts = [...shifts].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const overlaps = new Map<string, { count: number; index: number }>();
    
    sortedShifts.forEach((shift, index) => {
      const currentStart = new Date(shift.startTime).getTime();
      const currentEnd = new Date(shift.endTime).getTime();
      let overlapCount = 0;
      let overlapIndex = 0;
      
      sortedShifts.forEach((compareShift, compareIndex) => {
        if (shift.id !== compareShift.id) {
          const compareStart = new Date(compareShift.startTime).getTime();
          const compareEnd = new Date(compareShift.endTime).getTime();
          
          if (currentStart < compareEnd && currentEnd > compareStart) {
            overlapCount++;
            if (compareIndex < index) overlapIndex++;
          }
        }
      });
      
      overlaps.set(shift.id, {
        count: overlapCount,
        index: overlapIndex
      });
    });
    
    return overlaps;
  };

  const getShiftStyles = (shift: Shift, overlaps: Map<string, { count: number; index: number }>) => {
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);
    
    const startHour = startTime.getHours() + (startTime.getMinutes() / 60);
    const endHour = endTime.getHours() + (endTime.getMinutes() / 60);
    const duration = endHour - startHour;

    const overlapInfo = overlaps.get(shift.id) || { count: 0, index: 0 };
    const totalSlots = overlapInfo.count + 1;
    const slotWidth = 90 / totalSlots;
    const leftOffset = (overlapInfo.index * slotWidth) + 5;

    return {
      position: 'absolute' as const,
      top: `${(startHour / 24) * 100}%`,
      height: `${(duration / 24) * 100}%`,
      left: `${leftOffset}%`,
      width: `${slotWidth}%`,
      minHeight: '60px',
    };
  };

  const renderShift = (shift: Shift, overlaps: Map<string, { count: number; index: number }>) => {
    const assignedTo = getAssignedStaffDisplay(shift);
    const timeDisplay = `${format(new Date(shift.startTime), "h:mm a")} - ${format(new Date(shift.endTime), "h:mm a")}`;

    return (
      <div
        key={shift.id}
        style={getShiftStyles(shift, overlaps)}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`
                  h-full rounded-md border p-2 cursor-pointer
                  ${SHIFT_COLORS[shift.type].bg}
                  ${SHIFT_COLORS[shift.type].border}
                  ${SHIFT_COLORS[shift.type].hover}
                  ${SHIFT_COLORS[shift.type].text}
                  transition-all duration-200
                  flex flex-col justify-between
                `}
              >
                <div className="text-xs font-medium truncate">
                  {timeDisplay}
                </div>
                <div className="text-xs font-semibold truncate mt-1">
                  {assignedTo}
                </div>
                <div className="text-[10px] opacity-75 truncate mt-1">
                  {shift.type} Service
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px]">
              <div className="space-y-2">
                <div className="font-semibold">{shift.type} Service</div>
                <div>{timeDisplay}</div>
                <div className="text-sm">
                  Status: <Badge variant="outline">{shift.status}</Badge>
                </div>
                <div className="text-sm">
                  {assignedTo === "Unassigned" ? (
                    <span className="text-yellow-500 font-medium">⚠️ Unassigned</span>
                  ) : (
                    <>
                      Staff: <span className="font-medium">{assignedTo}</span>
                    </>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      const newDate = direction === 'prev' 
        ? subWeeks(weekStart, 1) 
        : addWeeks(weekStart, 1);
      setWeekStart(newDate);
      setCurrentDate(newDate);
    } else {
      const newDate = direction === 'prev' 
        ? addDays(currentDate, -1) 
        : addDays(currentDate, 1);
      setCurrentDate(newDate);
      setWeekStart(startOfWeek(newDate));
    }
  };

  const renderTimeGrid = () => {
    const days = view === 'week' 
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : [currentDate];

    return (
      <div className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden">
        {/* Time labels column */}
        <div className="bg-background">
          <div className="sticky top-0 z-20 bg-background p-2">
            <span className="text-sm font-medium">Time</span>
          </div>
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="h-24 border-t p-1">
                <span className="text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0), "ha")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {days.map((date) => {
          const dayShifts = shifts.filter(shift => 
            isSameDay(new Date(shift.startTime), date)
          );
          const overlaps = calculateOverlappingShifts(dayShifts);

          return (
            <div 
              key={date.toISOString()}
              className={cn(
                "relative bg-background",
                view === 'day' && "col-span-7"
              )}
            >
              <div className="sticky top-0 z-20 bg-background p-2 text-center border-b">
                <div className="text-sm font-medium">
                  {format(date, "EEE")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(date, "MMM d")}
                </div>
              </div>
              
              <div className="relative h-[calc(24*6rem)]">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-24 border-t"
                  />
                ))}
                {dayShifts.map((shift) => renderShift(shift, overlaps))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-lg font-semibold min-w-[200px]">
            {view === 'week' 
              ? `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
              : format(currentDate, "MMMM d, yyyy")
            }
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-6">
          <Select 
            value={view} 
            onValueChange={(value: ViewType) => setView(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Daily View
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Weekly View
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${SHIFT_COLORS.COFFEE.bg}`}></div>
              <span className="text-sm">Coffee Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${SHIFT_COLORS.WINE.bg}`}></div>
              <span className="text-sm">Wine Service</span>
            </div>
          </div>
        </div>
      </div>

      {renderTimeGrid()}
    </Card>
  );
}
