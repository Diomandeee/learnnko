### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/calendar/shift-calendar copy.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO, addMinutes, isAfter, isBefore } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
 Calendar, 
 ChevronLeft, 
 ChevronRight,
 Calendar as CalendarIcon,
 Clock as ClockIcon,
 AlertTriangle,
 TrendingUp,
 Users,
 DollarSign
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

import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";

import { CreateShiftDialog } from "@/components/scheduling/dialogs/create-shift-dialog";
import { EditShiftDialog } from "@/components/scheduling/dialogs/edit-shift-dialog";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM
const CELL_HEIGHT = 80; // Height in pixels for each hour cell

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

type ViewType = 'day' | 'week';

interface Break {
 id?: string;
 startTime: string;
 duration: number;
}

interface Shift {
 id: string;
 type: 'COFFEE' | 'WINE';
 startTime: string;
 endTime: string;
 status: string;
 breaks: Break[];
 assignedStaff: Array<{
   staff: {
     id: string;
     name: string;
     email: string;
     hourlyRate: number;
   };
 }>;
 requiredRoles?: {
   minStaff: number;
 };
}

interface Analytics {
 laborCost: number;
 staffCount: number;
 utilization: number;
 warnings: string[];
}

export function ShiftCalendar() {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
 const [shifts, setShifts] = useState<Shift[]>([]);
 const [loading, setLoading] = useState(true);
 const [view, setView] = useState<ViewType>('week');
 const [createDialogOpen, setCreateDialogOpen] = useState(false);
 const [editDialogOpen, setEditDialogOpen] = useState(false);
 const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
 const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
 const [draggingShift, setDraggingShift] = useState<{ shift: Shift; type: 'move' | 'resize' } | null>(null);
 const [analytics, setAnalytics] = useState<Analytics | null>(null);
 const calendarRef = useRef<HTMLDivElement>(null);
 const { toast } = useToast();
 const [showLaborCost, setShowLaborCost] = useState(true);
 const [showStaffCount, setShowStaffCount] = useState(true);

 useEffect(() => {
   fetchShifts();
 }, [weekStart]);

 const fetchShifts = async () => {
   try {
     const weekEnd = addWeeks(weekStart, 1);
     const response = await fetch(
       `/api/scheduling/shifts?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
     );
     if (!response.ok) throw new Error('Failed to fetch shifts');
     const data = await response.json();
     setShifts(data);
     calculateAnalytics(data);
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

 const calculateAnalytics = (shifts: Shift[]) => {
   let totalLaborCost = 0;
   let staffSet = new Set();
   let totalShiftHours = 0;
   let totalStaffHours = 0;
   let warnings = [];

   shifts.forEach(shift => {
     const start = new Date(shift.startTime);
     const end = new Date(shift.endTime);
     const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
     totalShiftHours += shiftHours;

     shift.assignedStaff.forEach(assignment => {
       staffSet.add(assignment.staff.id);
       const staffCost = assignment.staff.hourlyRate * shiftHours;
       totalLaborCost += staffCost;
       totalStaffHours += shiftHours;
     });

     if (shift.assignedStaff.length === 0) {
       warnings.push(`Unassigned shift on ${format(start, 'MMM d, h:mm a')}`);
     }

     const requiredRoles = shift.requiredRoles as any;
     if (requiredRoles && shift.assignedStaff.length < requiredRoles.minStaff) {
       warnings.push(`Understaffed shift on ${format(start, 'MMM d, h:mm a')}`);
     }
   });

   setAnalytics({
     laborCost: totalLaborCost,
     staffCount: staffSet.size,
     utilization: totalStaffHours / (totalShiftHours || 1) * 100,
     warnings
   });
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
  
  const startHour = startTime.getHours() + (startTime.getMinutes() / 60) - 6; // Subtract 6 to account for starting at 6 AM
  const endHour = endTime.getHours() + (endTime.getMinutes() / 60) - 6;
  const duration = endHour - startHour;

  const overlapInfo = overlaps.get(shift.id) || { count: 0, index: 0 };
  const totalSlots = overlapInfo.count + 1;
  const slotWidth = 100 / totalSlots;
  const leftOffset = (overlapInfo.index * slotWidth) + 5;

  return {
    position: 'absolute' as const,
    top: `${startHour * CELL_HEIGHT}px`,
    height: `${duration * CELL_HEIGHT}px`,
    left: `${leftOffset}%`,
    width: `${slotWidth}%`,
    minHeight: '50px',
  };
};

const handleTimeSlotClick = (date: Date, hour: number) => {
  setSelectedSlot({ date, hour });
  setCreateDialogOpen(true);
};

const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedShift(shift);
  setEditDialogOpen(true);
};

const getMousePosition = (e: MouseEvent): number => {
  const calendarRect = calendarRef.current?.getBoundingClientRect();
  if (!calendarRect) return 0;
  return e.clientY - calendarRect.top;
};

const getHourFromPosition = (position: number): number => {
  return Math.floor(position / CELL_HEIGHT) + 6; // Add 6 to account for starting at 6 AM
};

const handleMouseDown = (shift: Shift, type: 'move' | 'resize', e: React.MouseEvent) => {
  e.stopPropagation();
  setDraggingShift({ shift, type });
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!draggingShift) return;

  const position = getMousePosition(e);
  const hour = getHourFromPosition(position);
  const minutes = Math.round((position % CELL_HEIGHT) / CELL_HEIGHT * 60);
  
  // Update shift times based on drag type
  const { shift, type } = draggingShift;
  const shiftDate = new Date(shift.startTime);
  
  if (type === 'move') {
    const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    const newStartTime = new Date(shiftDate.setHours(hour, minutes));
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    // Update shift position visually (you'll need to add state for this)
    // We'll handle the actual update on mouse up
  } else if (type === 'resize') {
    const newEndTime = new Date(shiftDate.setHours(hour, minutes));
    // Update shift size visually
  }
};

const handleMouseUp = async () => {
  if (!draggingShift) return;

  try {
    // Save the updated shift times
    // This would be similar to your shift update logic in the edit dialog
    await updateShift(draggingShift.shift);
    
    toast({
      title: "Success",
      description: "Shift updated successfully",
    });
    
    fetchShifts();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update shift",
      variant: "destructive",
    });
  } finally {
    setDraggingShift(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
};

const updateShift = async (shift: Shift) => {
  const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shift),
  });

  if (!response.ok) {
    throw new Error('Failed to update shift');
  }

  return response.json();
};

const getShiftAnalytics = (shift: Shift) => {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);
  const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const laborCost = shift.assignedStaff.reduce((total, assignment) => {
    return total + (assignment.staff.hourlyRate * shiftHours);
  }, 0);

  const requiredRoles = shift.requiredRoles as any;
  const isUnderstaffed = requiredRoles && shift.assignedStaff.length < requiredRoles.minStaff;

  return {
    laborCost,
    staffCount: shift.assignedStaff.length,
    isUnderstaffed,
    shiftHours
  };
};

const renderBreak = (breakItem: Break) => {
  const startMinutes = parseInt(breakItem.startTime.split(":")[0]) * 60 + 
                      parseInt(breakItem.startTime.split(":")[1]);
  return (
    <div
      key={breakItem.id}
      className="absolute left-0 right-0 bg-yellow-300/30 pointer-events-none"
      style={{
        top: `${(startMinutes / 60) * CELL_HEIGHT}px`,
        height: `${(breakItem.duration / 60) * CELL_HEIGHT}px`,
      }}
    />
  );
};

const renderShift = (shift: Shift, overlaps: Map<string, { count: number; index: number }>) => {
  const shiftAnalytics = getShiftAnalytics(shift);
  const timeDisplay = `${format(new Date(shift.startTime), "h:mm a")} - ${format(new Date(shift.endTime), "h:mm a")}`;

  return (
    <TooltipProvider key={shift.id}>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div
            style={getShiftStyles(shift, overlaps)}
            onClick={(e) => handleShiftClick(shift, e)}
            className={cn(
              "absolute rounded-md border p-2 cursor-pointer",
              SHIFT_COLORS[shift.type].bg,
              SHIFT_COLORS[shift.type].text,
              SHIFT_COLORS[shift.type].border,
              shiftAnalytics.isUnderstaffed ? "border-yellow-400 border-2" : ""
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-medium">{timeDisplay}</div>
                <div className="text-xs mt-1">
                  {shift.assignedStaff.length} staff assigned
                </div>
              </div>
              <Badge variant={shiftAnalytics.isUnderstaffed ? "warning" : "success"}>
                ${shiftAnalytics.laborCost.toFixed(0)}
              </Badge>
            </div>

            {shift.breaks?.map(breakItem => renderBreak(breakItem))}

            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-ns-resize"
              onMouseDown={(e) => handleMouseDown(shift, 'resize', e)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <div className="font-medium">{shift.type} Service</div>
            <div className="text-sm">
              <div>Duration: {shiftAnalytics.shiftHours.toFixed(1)}h</div>
              <div>Labor Cost: ${shiftAnalytics.laborCost.toFixed(2)}</div>
              <div>Staff: {shiftAnalytics.staffCount}</div>
              {shiftAnalytics.isUnderstaffed && (
                <div className="text-yellow-500">⚠️ Understaffed</div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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

const renderAnalytics = () => {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Labor Cost</p>
            <h3 className="text-2xl font-bold">${analytics.laborCost.toFixed(2)}</h3>
          </div>
          <DollarSign className="h-8 w-8 text-muted-foreground" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
            <h3 className="text-2xl font-bold">{analytics.staffCount}</h3>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Utilization</p>
            <h3 className="text-2xl font-bold">{analytics.utilization.toFixed(1)}%</h3>
          </div>
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Warnings</p>
            <h3 className="text-2xl font-bold">{analytics.warnings.length}</h3>
          </div>
          <Popover>
            <PopoverTrigger>
              <AlertTriangle className={cn(
                "h-8 w-8",
                analytics.warnings.length > 0 ? "text-yellow-500" : "text-muted-foreground"
              )} />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                {analytics.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600">
                    • {warning}
                  </div>
                ))}
                {analytics.warnings.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No warnings to display
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Card>
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
    {renderAnalytics()}

    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-lg font-semibold">
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
            <div className="text-sm flex items-center">
              Coffee Service
              <Badge className="ml-2" variant="secondary">
                {shifts.filter(s => s.type === 'COFFEE').length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${SHIFT_COLORS.WINE.bg}`}></div>
            <div className="text-sm flex items-center">
              Wine Service
              <Badge className="ml-2" variant="secondary">
                {shifts.filter(s => s.type === 'WINE').length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-yellow-300/30"></div>
            <span className="text-sm">Break</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-l pl-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center",
              showLaborCost && "bg-accent"
            )}
            onClick={() => setShowLaborCost(!showLaborCost)}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Labor Cost
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center",
              showStaffCount && "bg-accent"
            )}
            onClick={() => setShowStaffCount(!showStaffCount)}
          >
            <Users className="w-4 h-4 mr-1" />
            Staff Count
          </Button>
        </div>
      </div>
    </div>

    <div className="overflow-auto" ref={calendarRef}>
      <div className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden">
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

        {getDays().map((date) => {
          const dayShifts = shifts.filter(shift => 
            isSameDay(new Date(shift.startTime), date)
          );
          const dayAnalytics = calculateDayAnalytics(dayShifts);
          const overlaps = calculateOverlappingShifts(dayShifts);

          return (
            <div 
              key={date.toISOString()}
              className={cn(
                "relative bg-background",
                view === 'day' && "col-span-7"
              )}
            >
              <div className="sticky top-0 z-20 bg-background p-2">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(date, "MMM d")}
                  </div>
                  {dayAnalytics && (
                    <div className="flex items-center space-x-2 mt-1">
                      {showLaborCost && (
                        <Badge variant="secondary">
                          ${dayAnalytics.laborCost.toFixed(0)}
                        </Badge>
                      )}
                      {showStaffCount && (
                        <Badge variant="outline">
                          {dayAnalytics.uniqueStaff} staff
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${CELL_HEIGHT}px` }}
                    className="border-t cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleTimeSlotClick(date, hour)}
                  />
                ))}
                {dayShifts.map(shift => renderShift(shift, overlaps))}
                
                <div className="absolute inset-0 pointer-events-none">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      style={{ 
                        top: `${(hour - 6) * CELL_HEIGHT}px`,
                        height: "1px"
                      }}
                      className="absolute w-full bg-accent/30"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {selectedSlot && (
      <CreateShiftDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedDate={selectedSlot.date}
        selectedHour={selectedSlot.hour}
        onShiftCreated={fetchShifts}
      />
    )}

    {selectedShift && (
      <EditShiftDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        shift={selectedShift}
        onShiftUpdated={fetchShifts}
        onShiftDeleted={() => {
          fetchShifts();
          setEditDialogOpen(false);
        }}
      />
    )}
  </Card>
);
}

// Helper functions
function calculateDayAnalytics(shifts: Shift[]) {
if (shifts.length === 0) return null;

const staffIds = new Set<string>();
let laborCost = 0;

shifts.forEach(shift => {
  shift.assignedStaff.forEach(assignment => {
    staffIds.add(assignment.staff.id);
    const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
    laborCost += hours * assignment.staff.hourlyRate;
  });
});

return {
  uniqueStaff: staffIds.size,
  laborCost
};
}

function getDays() {
return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i));
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/calendar/shift-calendar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
 Calendar, 
 ChevronLeft, 
 ChevronRight,
 Calendar as CalendarIcon,
 Clock,
  Clock as ClockIcon,
 AlertTriangle,
 TrendingUp,
 Users,
 DollarSign,
 GripHorizontal,
 Plus,

 X
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
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";

import { CreateShiftDialog } from "@/components/scheduling/dialogs/create-shift-dialog";
import { EditShiftDialog } from "@/components/scheduling/dialogs/edit-shift-dialog";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM
const CELL_HEIGHT = 80; // Height in pixels for each hour cell
const STANDARD_HOURLY_RATE = 20; // Fixed hourly rate
const MIN_SHIFT_WIDTH = 150; // Minimum width for shifts
const SHIFT_GAP = 4; // Gap between shifts

const SHIFT_COLORS = {
 COFFEE: {
   bg: 'bg-gradient-to-br from-blue-500/90 to-blue-600/90',
   hover: 'hover:from-blue-600/90 hover:to-blue-700/90',
   text: 'text-white',
   border: 'border-blue-600',
   shadow: 'shadow-blue-500/20'
 },
 WINE: {
   bg: 'bg-gradient-to-br from-purple-500/90 to-purple-600/90',
   hover: 'hover:from-purple-600/90 hover:to-purple-700/90',
   text: 'text-white',
   border: 'border-purple-600',
   shadow: 'shadow-purple-500/20'
 },
};

const TIME_MARKER_STYLES = {
 even: "bg-accent/5 transition-colors duration-200 hover:bg-accent/20",
 odd: "bg-transparent transition-colors duration-200 hover:bg-accent/10",
};

type ViewType = 'day' | 'week';

interface Break {
 id?: string;
 startTime: string;
 duration: number;
}

interface Shift {
 id: string;
 type: 'COFFEE' | 'WINE';
 startTime: string;
 endTime: string;
 status: string;
 breaks: Break[];
 assignedStaff: Array<{
   staff: {
     id: string;
     name: string;
     email: string;
     hourlyRate: number;
   };
 }>;
 requiredRoles?: {
   minStaff: number;
 };
}

interface Analytics {
 laborCost: number;
 staffCount: number;
 utilization: number;
 warnings: string[];
 weeklyHours: number;
}

interface DragState {
 shift: Shift;
 type: 'move' | 'resize';
 initialY: number;
 shiftStartY: number;
 shiftHeight: number;
}

interface DayAnalytics {
 uniqueStaff: number;
 laborCost: number;
 totalHours: number;
}

export function ShiftCalendar() {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
 const [shifts, setShifts] = useState<Shift[]>([]);
 const [loading, setLoading] = useState(true);
 const [view, setView] = useState<ViewType>('week');
 const [createDialogOpen, setCreateDialogOpen] = useState(false);
 const [editDialogOpen, setEditDialogOpen] = useState(false);
 const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
 const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
 const [dragState, setDragState] = useState<DragState | null>(null);
 const [analytics, setAnalytics] = useState<Analytics | null>(null);
 const [showLaborCost, setShowLaborCost] = useState(true);
 const [showStaffCount, setShowStaffCount] = useState(true);
 const calendarRef = useRef<HTMLDivElement>(null);
 const { toast } = useToast();

 useEffect(() => {
   fetchShifts();
 }, [weekStart]);

 useEffect(() => {
   document.addEventListener('mousemove', handleMouseMove);
   document.addEventListener('mouseup', handleMouseUp);

   return () => {
     document.removeEventListener('mousemove', handleMouseMove);
     document.removeEventListener('mouseup', handleMouseUp);
   };
 }, [dragState]);

 const fetchShifts = async () => {
   try {
     const weekEnd = addWeeks(weekStart, 1);
     const response = await fetch(
       `/api/scheduling/shifts?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
     );
     if (!response.ok) throw new Error('Failed to fetch shifts');
     const data = await response.json();
     setShifts(data);
     calculateAnalytics(data);
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

 const calculateAnalytics = (shifts: Shift[]) => {
   let totalLaborCost = 0;
   let staffSet = new Set();
   let totalHours = 0;
   let warnings = [];

   shifts.forEach(shift => {
     const start = new Date(shift.startTime);
     const end = new Date(shift.endTime);
     const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
     totalHours += shiftHours * shift.assignedStaff.length;

     shift.assignedStaff.forEach(assignment => {
       staffSet.add(assignment.staff.id);
       totalLaborCost += STANDARD_HOURLY_RATE * shiftHours;
     });

     if (shift.assignedStaff.length === 0) {
       warnings.push(`Unassigned shift on ${format(start, 'MMM d, h:mm a')}`);
     }

     if (shift.requiredRoles && shift.assignedStaff.length < shift.requiredRoles.minStaff) {
       warnings.push(`Understaffed shift on ${format(start, 'MMM d, h:mm a')}`);
     }
   });

   setAnalytics({
     laborCost: totalLaborCost,
     staffCount: staffSet.size,
     utilization: staffSet.size > 0 ? (totalHours / (staffSet.size * 40)) * 100 : 0,
     warnings,
     weeklyHours: totalHours
   });
 };

 const calculateDayAnalytics = (shifts: Shift[]): DayAnalytics => {
   const staffSet = new Set<string>();
   let laborCost = 0;
   let totalHours = 0;

   shifts.forEach(shift => {
     const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
     shift.assignedStaff.forEach(assignment => {
       staffSet.add(assignment.staff.id);
       laborCost += hours * STANDARD_HOURLY_RATE;
       totalHours += hours;
     });
   });

   return {
     uniqueStaff: staffSet.size,
     laborCost,
     totalHours
   };
 };

 const calculateOverlappingShifts = (shifts: Shift[], date: Date) => {
   const dayShifts = shifts.filter(shift => 
     isSameDay(new Date(shift.startTime), date)
   );

   return dayShifts.reduce((groups, shift) => {
     const overlappingGroup = groups.find(group => 
       group.some(existingShift => 
         isOverlapping(shift, existingShift)
       )
     );

     if (overlappingGroup) {
       overlappingGroup.push(shift);
     } else {
       groups.push([shift]);
     }

     return groups;
   }, [] as Shift[][]);
 };

 const isOverlapping = (shift1: Shift, shift2: Shift): boolean => {
   const start1 = new Date(shift1.startTime).getTime();
   const end1 = new Date(shift1.endTime).getTime();
   const start2 = new Date(shift2.startTime).getTime();
   const end2 = new Date(shift2.endTime).getTime();

   return start1 < end2 && end1 > start2;
 };

 const getShiftPosition = (shift: Shift, groupIndex: number, totalGroups: number): {
   top: number;
   height: number;
   left: string;
   width: string;
 } => {
   const start = new Date(shift.startTime);
   const end = new Date(shift.endTime);
   const top = (start.getHours() - 6 + start.getMinutes() / 60) * CELL_HEIGHT;
   const height = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * CELL_HEIGHT;
   const width = `${100 / totalGroups}%`;
   const left = `${(groupIndex * 100) / totalGroups}%`;

   return { top, height, left, width };
 };

 const handleTimeSlotClick = (date: Date, hour: number) => {
   setSelectedSlot({ date, hour });
   setCreateDialogOpen(true);
 };

 const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
   e.stopPropagation();
   setSelectedShift(shift);
   setEditDialogOpen(true);
 };

 const handleMouseDown = (shift: Shift, type: 'move' | 'resize', e: React.MouseEvent) => {
   e.stopPropagation();
   const shiftElement = e.currentTarget.parentElement;
   if (!shiftElement) return;

   const rect = shiftElement.getBoundingClientRect();
   setDragState({
     shift,
     type,
     initialY: e.clientY,
     shiftStartY: rect.top,
     shiftHeight: rect.height,
   });
 };

 const handleMouseMove = (e: MouseEvent) => {
   if (!dragState || !calendarRef.current) return;

   const calendarRect = calendarRef.current.getBoundingClientRect();
   const deltaY = e.clientY - dragState.initialY;
   let newY = dragState.shiftStartY + deltaY - calendarRect.top;
   
   // Snap to 15-minute intervals
   const snapInterval = CELL_HEIGHT / 4;
   newY = Math.round(newY / snapInterval) * snapInterval;

   const shiftElement = document.getElementById(`shift-${dragState.shift.id}`);
   if (shiftElement) {
     if (dragState.type === 'move') {
       shiftElement.style.top = `${newY}px`;
     } else if (dragState.type === 'resize') {
       const newHeight = Math.max(CELL_HEIGHT/2, dragState.shiftHeight + deltaY);
       const snappedHeight = Math.round(newHeight / snapInterval) * snapInterval;
       shiftElement.style.height = `${snappedHeight}px`;
     }
   }
 };

 const handleMouseUp = async () => {
   if (!dragState || !calendarRef.current) return;

   try {
     const shiftElement = document.getElementById(`shift-${dragState.shift.id}`);
     if (!shiftElement) return;

     const rect = shiftElement.getBoundingClientRect();
     const calendarRect = calendarRef.current.getBoundingClientRect();
     
     const startHour = 6 + (rect.top - calendarRect.top) / CELL_HEIGHT;
     const endHour = startHour + rect.height / CELL_HEIGHT;

     const shiftDate = new Date(dragState.shift.startTime);
     const newStartTime = new Date(shiftDate);
     newStartTime.setHours(
       Math.floor(startHour),
       Math.round((startHour % 1) * 60),
       0
     );

     const newEndTime = new Date(shiftDate);
     newEndTime.setHours(
       Math.floor(endHour),
       Math.round((endHour % 1) * 60),
       0
     );

     await updateShift({
       ...dragState.shift,
       startTime: newStartTime.toISOString(),
       endTime: newEndTime.toISOString(),
     });

     toast({
       title: "Success",
       description: "Shift updated successfully",
     });

     fetchShifts();
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update shift",
       variant: "destructive",
     });

     // Reset shift position
     const shiftElement = document.getElementById(`shift-${dragState.shift.id}`);
     if (shiftElement) {
       shiftElement.style.top = `${dragState.shiftStartY}px`;
       shiftElement.style.height = `${dragState.shiftHeight}px`;
     }
   } finally {
     setDragState(null);
   }
 };

 const updateShift = async (shift: Shift) => {
   const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
     method: 'PATCH',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(shift),
   });

   if (!response.ok) {
     throw new Error('Failed to update shift');
   }

   return response.json();
 };

 const renderAnalytics = () => {
   if (!analytics) return null;

   return (
     <div className="grid grid-cols-5 gap-4 mb-6">
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
             <h3 className="text-2xl font-bold">${analytics.laborCost.toFixed(2)}</h3>
           </div>
           <DollarSign className="h-8 w-8 text-muted-foreground" />
         </div>
       </Card>
       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
             <h3 className="text-2xl font-bold">{analytics.staffCount}</h3>
           </div>
           <Users className="h-8 w-8 text-muted-foreground" />
         </div>
       </Card>

       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
             <h3 className="text-2xl font-bold">{analytics.weeklyHours.toFixed(1)}h</h3>
           </div>
           <Clock className="h-8 w-8 text-muted-foreground" />
         </div>
       </Card>

       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-muted-foreground">Utilization</p>
             <h3 className="text-2xl font-bold">{analytics.utilization.toFixed(1)}%</h3>
           </div>
           <TrendingUp className="h-8 w-8 text-muted-foreground" />
         </div>
       </Card>

       <Card className="p-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-muted-foreground">Warnings</p>
             <h3 className="text-2xl font-bold">{analytics.warnings.length}</h3>
           </div>
           <Popover>
             <PopoverTrigger>
               <AlertTriangle className={cn(
                 "h-8 w-8",
                 analytics.warnings.length > 0 ? "text-yellow-500" : "text-muted-foreground"
               )} />
             </PopoverTrigger>
             <PopoverContent className="w-80">
               <div className="space-y-2">
                 {analytics.warnings.map((warning, index) => (
                   <div key={index} className="text-sm text-yellow-600 flex items-start">
                     <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                     {warning}
                   </div>
                 ))}
                 {analytics.warnings.length === 0 && (
                   <div className="text-sm text-muted-foreground">
                     No warnings to display
                   </div>
                 )}
               </div>
             </PopoverContent>
           </Popover>
         </div>
       </Card>
     </div>
   );
 };

 const renderTimeSlot = (date: Date, hour: number, isEven: boolean) => (
   <div
     key={hour}
     style={{ height: `${CELL_HEIGHT}px` }}
     className={cn(
       "border-t border-accent/20 relative group cursor-pointer",
       TIME_MARKER_STYLES[isEven ? "even" : "odd"]
     )}
     onClick={() => handleTimeSlotClick(date, hour)}
   >
     <div className="opacity-0 group-hover:opacity-100 absolute inset-2 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center transition-all duration-200">
       <Plus className="h-6 w-6 text-primary/40" />
     </div>
   </div>
 );

 const renderShift = (shift: Shift, groupIndex: number = 0, totalGroups: number = 1) => {
   const isUnderstaffed = shift.requiredRoles && shift.assignedStaff.length < shift.requiredRoles.minStaff;
   const shiftDuration = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
   const laborCost = shiftDuration * STANDARD_HOURLY_RATE * shift.assignedStaff.length;
   const position = getShiftPosition(shift, groupIndex, totalGroups);

   return (
     <div
       key={shift.id}
       id={`shift-${shift.id}`}
       className={cn(
         "absolute rounded-lg border-2 p-2 transition-shadow hover:shadow-lg",
         SHIFT_COLORS[shift.type].bg,
         SHIFT_COLORS[shift.type].border,
         SHIFT_COLORS[shift.type].text,
         SHIFT_COLORS[shift.type].shadow,
         isUnderstaffed ? "border-yellow-400" : "",
         dragState?.shift.id === shift.id ? "z-50 shadow-xl" : "z-10"
       )}
       style={{
         top: position.top,
         height: position.height,
         left: position.left,
         width: position.width,
       }}
       onClick={(e) => handleShiftClick(shift, e)}
     >
       <div className="relative h-full">
         <div 
           className="absolute inset-0 cursor-move"
           onMouseDown={(e) => handleMouseDown(shift, 'move', e)}
         />

         <div className="relative space-y-1">
           <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-medium">
                 {format(new Date(shift.startTime), "h:mm a")} - {format(new Date(shift.endTime), "h:mm a")}
               </div>
               <div className="text-xs opacity-90">
                 {shift.type} Service
               </div>
             </div>
             <Badge variant={isUnderstaffed ? "warning" : "secondary"} className="text-xs">
               ${laborCost.toFixed(0)}
             </Badge>
           </div>

           <div className="space-y-0.5 mt-1">
             {shift.assignedStaff.map(assignment => (
               <div key={assignment.staff.id} className="text-xs truncate opacity-90">
                 {assignment.staff.name}
               </div>
             ))}
           </div>

           {shift.breaks?.map((breakItem, index) => (
             <div
               key={index}
               className="absolute left-0 right-0 bg-yellow-300/20 border border-yellow-400/30"
               style={{
                 top: `${(parseInt(breakItem.startTime.split(':')[0]) * CELL_HEIGHT)}px`,
                 height: `${(breakItem.duration / 60) * CELL_HEIGHT}px`,
               }}
             />
           ))}

           {isUnderstaffed && (
             <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
               <AlertTriangle className="w-3 h-3 text-yellow-900" />
             </div>
           )}

           <div
             className="absolute bottom-0 right-0 w-6 h-6 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
             onMouseDown={(e) => handleMouseDown(shift, 'resize', e)}
           >
             <GripHorizontal className="w-4 h-4" />
           </div>
         </div>
       </div>
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
   <Card className="p-6 space-y-6">
     {renderAnalytics()}

     <div className="flex items-center justify-between">
       <div className="flex items-center space-x-4">
         <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
           <ChevronLeft className="h-4 w-4" />
         </Button>
         
         <div className="text-lg font-semibold">
           {view === 'week' 
             ? `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
             : format(currentDate, "MMMM d, yyyy")
           }
         </div>

         <Button variant="outline" size="icon" onClick={() => navigate('next')}>
           <ChevronRight className="h-4 w-4" />
         </Button>
       </div>

       <div className="flex items-center space-x-6">
         <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
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
             <div className={`w-3 h-3 rounded ${SHIFT_COLORS.COFFEE.bg}`} />
             <span className="text-sm">Coffee Service</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className={`w-3 h-3 rounded ${SHIFT_COLORS.WINE.bg}`} />
             <span className="text-sm">Wine Service</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-3 h-3 rounded bg-yellow-300/30" />
             <span className="text-sm">Break</span>
           </div>
         </div>
       </div>
     </div>

     <div className="overflow-auto" ref={calendarRef}>
       <div className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden">
         {/* Time labels column */}
         <div className="bg-background">
           <div className="sticky top-0 z-30 bg-background p-2 border-b">
             <span className="text-sm font-medium">Time</span>
           </div>
           <div>
             {HOURS.map((hour) => (
               <div 
                 key={hour} 
                 style={{ height: `${CELL_HEIGHT}px` }}
                 className="border-t border-accent/20 p-1"
               >
                 <span className="text-xs text-muted-foreground">
                   {format(new Date().setHours(hour, 0), "ha")}
                 </span>
               </div>
             ))}
           </div>
         </div>

         {/* Day columns */}
         {Array.from({ length: view === 'week' ? 7 : 1 }, (_, i) => {
           const date = view === 'week' ? addDays(weekStart, i) : currentDate;
           const dayShifts = shifts.filter(shift => 
             isSameDay(new Date(shift.startTime), date)
           );
           const overlappingGroups = calculateOverlappingShifts(shifts, date);
           const dayAnalytics = calculateDayAnalytics(dayShifts);
           const isToday = isSameDay(date, new Date());

           return (
             <div 
               key={date.toISOString()}
               className={cn(
                 "relative bg-background",
                 view === 'day' && "col-span-7",
                 isToday && "bg-accent/5"
               )}
             >
               <div className="sticky top-0 z-20 bg-background p-2 border-b">
                 <div className="flex flex-col items-center">
                   <div className={cn(
                     "text-sm font-medium",
                     isToday && "text-primary"
                   )}>
                     {format(date, "EEE")}
                   </div>
                   <div className="text-sm text-muted-foreground">
                     {format(date, "MMM d")}
                   </div>
                   {dayAnalytics && (
                     <div className="flex items-center space-x-2 mt-1">
                       {showLaborCost && (
                         <Badge variant="secondary" className="text-xs">
                           ${dayAnalytics.laborCost.toFixed(0)}
                         </Badge>
                       )}
                       {showStaffCount && (
                         <Badge variant="outline" className="text-xs">
                           {dayAnalytics.uniqueStaff} staff
                         </Badge>
                       )}
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="relative min-h-full">
                 {/* Time slots */}
                 {HOURS.map((hour, index) => 
                   renderTimeSlot(date, hour, index % 2 === 0)
                 )}

                 {/* Shifts */}
                 {overlappingGroups.map((group, groupIndex) => 
                   group.map(shift => 
                     renderShift(shift, groupIndex, overlappingGroups.length)
                   )
                 )}

                 {/* Current time indicator */}
                 {isToday && (
                   <div 
                     className="absolute left-0 right-0 flex items-center z-40 pointer-events-none"
                     style={{
                       top: `${((new Date().getHours() - 6) * CELL_HEIGHT) + 
                         ((new Date().getMinutes() / 60) * CELL_HEIGHT)}px`
                     }}
                   >
                     <div className="w-2 h-2 rounded-full bg-red-500 ml-1" />
                     <div className="h-px flex-1 bg-red-500" />
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>
     </div>

     {selectedSlot && (
       <CreateShiftDialog
         open={createDialogOpen}
         onOpenChange={setCreateDialogOpen}
         selectedDate={selectedSlot.date}
         selectedHour={selectedSlot.hour}
         onShiftCreated={fetchShifts}
       />
     )}
     {selectedShift && (
       <EditShiftDialog
         open={editDialogOpen}
         onOpenChange={setEditDialogOpen}
         shift={selectedShift}
         onShiftUpdated={fetchShifts}
         onShiftDeleted={() => {
           fetchShifts();
           setEditDialogOpen(false);
         }}
       />
     )}

     <div className="absolute bottom-4 right-4">
       <Button
         size="lg"
         onClick={() => {
           setSelectedSlot({ 
             date: new Date(),
             hour: new Date().getHours()
           });
           setCreateDialogOpen(true);
         }}
         className="shadow-lg"
       >
         <Plus className="w-4 h-4 mr-2" />
         New Shift
       </Button>
     </div>
   </Card>
 );
}

interface ShiftMetrics {
 duration: number;
 laborCost: number;
 isUnderstaffed: boolean;
}

function getShiftMetrics(shift: Shift): ShiftMetrics {
 const duration = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
 const laborCost = duration * STANDARD_HOURLY_RATE * shift.assignedStaff.length;
 const isUnderstaffed = shift.requiredRoles && shift.assignedStaff.length < shift.requiredRoles.minStaff;

 return {
   duration,
   laborCost,
   isUnderstaffed
 };
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/calendar/staff-calendar.tsx
"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useSchedulingStore } from "@/store/use-scheduling-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Staff, Availability } from "@/types/scheduling/staff";

interface StaffCalendarProps {
 staff: Staff;
 onAvailabilityChange?: (availability: Availability[]) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function StaffCalendar({ staff, onAvailabilityChange }: StaffCalendarProps) {
 const [selectedDate, setSelectedDate] = useState(new Date());
 const [weekStart, setWeekStart] = useState(startOfWeek(selectedDate));
 const { shifts } = useSchedulingStore();

 // Generate week days
 const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

 const navigateWeek = (direction: "prev" | "next") => {
   const newWeekStart = addDays(weekStart, direction === "prev" ? -7 : 7);
   setWeekStart(newWeekStart);
 };

 const getShiftsForDay = (date: Date) => {
   return shifts.filter((shift) =>
     isSameDay(new Date(shift.startTime), date) &&
     shift.assignedStaff.some((assignment) => assignment.staffId === staff.id)
   );
 };

 const getAvailabilityForDay = (dayOfWeek: number) => {
   return staff.availability.filter((a) => a.dayOfWeek === dayOfWeek);
 };

 const isAvailable = (date: Date, hour: number) => {
   const availability = getAvailabilityForDay(date.getDay());
   return availability.some((a) => {
     const start = parseInt(a.startTime.split(":")[0]);
     const end = parseInt(a.endTime.split(":")[0]);
     return hour >= start && hour < end;
   });
 };

 return (
   <Card className="p-4">
     <div className="flex items-center justify-between mb-4">
       <h3 className="text-lg font-medium">{staff.name}'s Schedule</h3>
       <div className="flex items-center space-x-4">
         <Button
           variant="outline"
           size="icon"
           onClick={() => navigateWeek("prev")}
         >
           <ChevronLeft className="h-4 w-4" />
         </Button>
         <span className="font-medium">
           {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
         </span>
         <Button
           variant="outline"
           size="icon"
           onClick={() => navigateWeek("next")}
         >
           <ChevronRight className="h-4 w-4" />
         </Button>
       </div>
     </div>

     <div className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden">
       {/* Time labels */}
       <div className="bg-background">
         <div className="sticky top-0 z-10 bg-background p-2">
           <span className="text-sm font-medium">Time</span>
         </div>
         <div className="space-y-px">
           {HOURS.map((hour) => (
             <div
               key={hour}
               className="h-12 border-t p-1"
             >
               <span className="text-xs text-muted-foreground">
                 {format(new Date().setHours(hour, 0), "ha")}
               </span>
             </div>
           ))}
         </div>
       </div>

       {/* Days columns */}
       {weekDays.map((date) => (
         <div key={date.toISOString()} className="relative bg-background">
           <div className="sticky top-0 z-10 bg-background p-2 text-center">
             <span className="text-sm font-medium">
               {format(date, "EEE")}
             </span>
             <br />
             <span className="text-sm text-muted-foreground">
               {format(date, "MMM d")}
             </span>
           </div>
           <div className="relative h-[calc(24*3rem)] space-y-px">
             {HOURS.map((hour) => (
               <div
                 key={hour}
                 className={`h-12 border-t ${
                   isAvailable(date, hour)
                     ? "bg-green-50"
                     : ""
                 }`}
               />
             ))}
             {getShiftsForDay(date).map((shift) => (
               <div
                 key={shift.id}
                 className="absolute left-0 right-0 mx-1 rounded bg-blue-500 p-1 text-xs text-white"
                 style={{
                   top: `${(new Date(shift.startTime).getHours() / 24) * 100}%`,
                   height: `${((new Date(shift.endTime).getHours() - new Date(shift.startTime).getHours()) / 24) * 100}%`,
                 }}
               >
                 <div className="font-medium">
                   {format(new Date(shift.startTime), "h:mma")} -{" "}
                   {format(new Date(shift.endTime), "h:mma")}
                 </div>
                 <div className="truncate">
                   {shift.type} Service
                 </div>
               </div>
             ))}
           </div>
         </div>
       ))}
     </div>
   </Card>
 );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/forms/shift-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShiftType } from "@prisma/client";
import { format } from "date-fns";

const shiftFormSchema = z.object({
  type: z.enum(['COFFEE', 'WINE']),
  startTime: z.string(),
  endTime: z.string(),
  date: z.date(),
  requiredRoles: z.array(z.object({
    roleId: z.string(),
    name: z.string(),
    requiredCertifications: z.array(z.string()),
    minStaffCount: z.number().min(1),
  })),
  notes: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ShiftForm({ initialData, onSubmit, onCancel }: ShiftFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: initialData || {
      type: 'COFFEE' as ShiftType,
      date: new Date(),
      startTime: format(new Date(), 'HH:mm'),
      endTime: format(new Date(), 'HH:mm'),
      requiredRoles: [],
      notes: '',
    },
  });

  const handleSubmit = async (data: ShiftFormValues) => {
    try {
      setLoading(true);
      // Combine date and time for startTime and endTime
      const [startHour, startMinute] = data.startTime.split(':');
      const [endHour, endMinute] = data.endTime.split(':');
      
      const startTime = new Date(data.date);
      startTime.setHours(parseInt(startHour), parseInt(startMinute));
      
      const endTime = new Date(data.date);
      endTime.setHours(parseInt(endHour), parseInt(endMinute));

      const shiftData = {
        ...data,
        startTime,
        endTime,
      };

      await onSubmit(shiftData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COFFEE">Coffee Service</SelectItem>
                  <SelectItem value="WINE">Wine Service</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={format(field.value, 'yyyy-MM-dd')}
                    onChange={e => field.onChange(new Date(e.target.value))}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={loading}
                  placeholder="Add any additional notes about this shift..."
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Shift" : "Create Shift"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/forms/staff-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StaffRole } from "@prisma/client";

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["BARISTA", "SOMMELIER", "MANAGER", "EXECUTIVE"]),
  certifications: z.array(z.string()),
  maxHoursPerWeek: z.number().min(1).max(40),
  hourlyRate: z.number().min(1),
  availability: z.array(z.object({
    dayOfWeek: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    recurring: z.boolean(),
  })),
});

type FormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const CERTIFICATIONS = [
  "Barista Level 1",
  "Barista Level 2",
  "Wine Service Level 1",
  "Wine Service Level 2",
  "Food Safety",
  "First Aid",
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function StaffForm({ initialData, onSubmit, onCancel }: StaffFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      role: "BARISTA",
      certifications: [],
      maxHoursPerWeek: 40,
      hourlyRate: 20,
      availability: DAYS_OF_WEEK.map((_, index) => ({
        dayOfWeek: index,
        startTime: "09:00",
        endTime: "17:00",
        recurring: true,
      })),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(StaffRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxHoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Hours per Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certifications</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {CERTIFICATIONS.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value?.includes(cert)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), cert]
                          : field.value?.filter((c) => c !== cert) || [];
                        field.onChange(newValue);
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="font-medium">Availability</h3>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm font-medium">{day}</div>
              <FormField
                control={form.control}
                name={`availability.${index}.startTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availability.${index}.endTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Staff" : "Add Staff"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/lists/shift-list.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Shift } from "@/types/scheduling";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
import { ShiftType, ShiftStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/scheduling/shifts');
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

  const handleDelete = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });
      
      // Remove the shift from local state
      setShifts(shifts.filter(shift => shift.id !== shiftId));
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete shift",
        variant: "destructive",
      });
    } finally {
      setDeleteShiftId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>
                  {format(new Date(shift.startTime), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(shift.startTime), "h:mm a")} -{" "}
                  {format(new Date(shift.endTime), "h:mm a")}
                </TableCell>
                <TableCell>
                  <Badge variant={shift.type === "COFFEE" ? "default" : "secondary"}>
                    {shift.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge>{shift.status}</Badge>
                </TableCell>
                <TableCell>{shift.assignedStaff.length} assigned</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Shift
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteShiftId(shift.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteShiftId} onOpenChange={() => setDeleteShiftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shift
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteShiftId && handleDelete(deleteShiftId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/providers/drag-drop-provider.tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { DraggedShift, ScheduleCell } from "@/types/scheduling";
import { useToast } from "@/components/ui/use-toast";

interface DragDropContextType {
  isDragging: boolean;
  activeShift: DraggedShift | null;
  validateShiftMove: (shift: DraggedShift, cell: ScheduleCell, time: Date) => Promise<boolean>;
  moveShift: (shift: DraggedShift, cell: ScheduleCell, time: Date) => Promise<void>;
  setIsDragging: (dragging: boolean) => void;
  setActiveShift: (shift: DraggedShift | null) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeShift, setActiveShift] = useState<DraggedShift | null>(null);
  const { toast } = useToast();

  const validateShiftMove = useCallback(async (
    shift: DraggedShift, 
    cell: ScheduleCell, 
    time: Date
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shift.id}/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: time,
          endTime: new Date(time.getTime() + 
            (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime())
          ),
        }),
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, []);

  const moveShift = useCallback(async (
    shift: DraggedShift,
    cell: ScheduleCell,
    time: Date
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shift.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: time,
          endTime: new Date(time.getTime() + 
            (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime())
          ),
        }),
      });

      if (!response.ok) throw new Error('Failed to update shift position');

      const updatedShift = await response.json();
      // You might want to update local state here
      
    } catch (error) {
      console.error('Move error:', error);
      toast({
        title: "Error",
        description: "Failed to update shift position",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        activeShift,
        validateShiftMove,
        moveShift,
        setIsDragging,
        setActiveShift,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
};
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/providers/schedule-provider.tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { addDays, startOfWeek } from "date-fns";

interface ScheduleContextType {
  currentDate: Date;
  weekStart: Date;
  view: "day" | "week";
  setCurrentDate: (date: Date) => void;
  setWeekStart: (date: Date) => void;
  setView: (view: "day" | "week") => void;
  navigateWeek: (direction: "prev" | "next") => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const [view, setView] = useState<"day" | "week">("week");

  const navigateWeek = useCallback((direction: "prev" | "next") => {
    const days = direction === "prev" ? -7 : 7;
    const newWeekStart = addDays(weekStart, days);
    setWeekStart(newWeekStart);
    setCurrentDate(newWeekStart);
  }, [weekStart]);

  return (
    <ScheduleContext.Provider
      value={{
        currentDate,
        weekStart,
        view,
        setCurrentDate,
        setWeekStart,
        setView,
        navigateWeek,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/shared/shift-card.tsx
"use client";

import { format } from "date-fns";
import { Shift } from "@/types/scheduling/shift";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, AlertCircle } from "lucide-react";

interface ShiftCardProps {
 shift: Shift;
 onClick?: () => void;
}

export function ShiftCard({ shift, onClick }: ShiftCardProps) {
 const staffingComplete = shift.requiredRoles.every(
   role => {
     const assigned = shift.assignedStaff.filter(
       a => a.roleId === role.roleId
     ).length;
     return assigned >= role.minStaffCount;
   }
 );

 return (
   <Card
     className={`cursor-pointer transition-shadow hover:shadow-md ${
       !staffingComplete ? 'border-yellow-500' : ''
     }`}
     onClick={onClick}
   >
     <CardHeader className="pb-2">
       <div className="flex items-center justify-between">
         <Badge
           variant={shift.type === 'COFFEE' ? 'default' : 'secondary'}
         >
           {shift.type}
         </Badge>
         <Badge
           variant={staffingComplete ? 'success' : 'warning'}
         >
           {staffingComplete ? 'Fully Staffed' : 'Needs Staff'}
         </Badge>
       </div>
       <CardTitle className="text-lg">
         {format(new Date(shift.startTime), "MMM d, yyyy")}
       </CardTitle>
     </CardHeader>
     <CardContent>
       <div className="space-y-2">
         <div className="flex items-center text-sm text-muted-foreground">
           <Clock className="mr-2 h-4 w-4" />
           {format(new Date(shift.startTime), "h:mm a")} -{" "}
           {format(new Date(shift.endTime), "h:mm a")}
         </div>
         <div className="flex items-center text-sm text-muted-foreground">
           <Users className="mr-2 h-4 w-4" />
           {shift.assignedStaff.length} staff assigned
         </div>
         {!staffingComplete && (
           <div className="flex items-center text-sm text-yellow-600">
             <AlertCircle className="mr-2 h-4 w-4" />
             Staffing incomplete
           </div>
         )}
         {shift.notes && (
           <div className="mt-2 text-sm text-muted-foreground">
             {shift.notes}
           </div>
         )}
       </div>
     </CardContent>
   </Card>
 );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/draggable-schedule.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/use-toast";

const CELL_HEIGHT = 60;
const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM

export function DraggableSchedule() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, [weekStart]);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/scheduling/shifts');
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
    }
  };

  const getGridPosition = (clientY: number) => {
    if (!containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - containerRect.top;
    const hour = Math.floor(relativeY / CELL_HEIGHT) + 6; // Add 6 to account for starting at 6 AM
    
    return {
      hour,
      minutes: Math.round((relativeY % CELL_HEIGHT) / CELL_HEIGHT * 60),
    };
  };

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/draggable-shift.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DraggableShiftProps {
  id: string;
  shift: any;
  index: number;
}

export function DraggableShift({ id, shift, index }: DraggableShiftProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'absolute' as const,
    top: `${index * 60}px`,
    left: 0,
    right: 0,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-2"
    >
      <Card className="p-2 cursor-move bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <Badge variant={shift.type === 'COFFEE' ? 'default' : 'secondary'}>
            {shift.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(shift.startTime), "h:mm a")}
          </span>
        </div>
        <div className="mt-1 text-sm">
          {shift.assignedStaff?.length || 0} staff assigned
        </div>
      </Card>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/draggable-time-grid.tsx
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/shift-preview.tsx
"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShiftType, StaffRole } from "@prisma/client";
import { validateShiftRules } from '@/lib/scheduling/collision';

interface ShiftPreviewProps {
  shiftId: string;
  type: ShiftType;
  startTime: Date;
  endTime: Date;
  assignedStaff: Array<{
    id: string;
    name: string;
    role: StaffRole;
  }>;
}

export function ShiftPreview({
  shiftId,
  type,
  startTime,
  endTime,
  assignedStaff
}: ShiftPreviewProps) {
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    violations: string[];
  }>({ isValid: true, violations: [] });

  useEffect(() => {
    const validateShift = async () => {
      const results = await validateShiftRules(
        { id: shiftId, type, startTime, endTime } as any,
        assignedStaff as any
      );
      setValidationResults(results);
    };

    validateShift();
  }, [shiftId, type, startTime, endTime, assignedStaff]);

  const shiftColors = {
    COFFEE: 'bg-blue-50 border-blue-200',
    WINE: 'bg-purple-50 border-purple-200'
  };

  return (
    <Card className={`p-2 ${shiftColors[type]} border-2 ${
      !validationResults.isValid ? 'border-red-300' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={type === 'COFFEE' ? 'default' : 'secondary'}>
            {type}
          </Badge>
          <div className="text-sm font-medium mt-1">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </div>
        </div>
        <Badge variant={validationResults.isValid ? 'success' : 'destructive'}>
          {assignedStaff.length} Staff
        </Badge>
      </div>

      {assignedStaff.length > 0 && (
        <div className="mt-2 space-y-1">
          {assignedStaff.map(staff => (
            <div key={staff.id} className="flex items-center justify-between text-xs">
              <span>{staff.name}</span>
              <Badge variant="outline" className="text-xs">
                {staff.role}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {!validationResults.isValid && (
        <div className="mt-2 space-y-1">
          {validationResults.violations.map((violation, index) => (
            <div key={index} className="text-xs text-red-600">
              ⚠️ {violation}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/shift-resize-handle.tsx
"use client";

import { useState, useRef } from "react";
import { GripVertical } from "lucide-react";

interface ShiftResizeHandleProps {
  onResize: (delta: number) => void;
  onResizeEnd: () => void;
}

export function ShiftResizeHandle({ onResize, onResizeEnd }: ShiftResizeHandleProps) {
  const [resizing, setResizing] = useState(false);
  const startYRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    startYRef.current = e.clientY;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const delta = e.clientY - startYRef.current;
    onResize(delta);
    startYRef.current = e.clientY;
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    onResizeEnd();
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center ${
        resizing ? 'bg-primary/20' : 'hover:bg-primary/10'
      }`}
      onMouseDown={handleMouseDown}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/draggable/shift-resize.tsx
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/assignment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Staff, Shift } from "@/types/scheduling";
import { useToast } from "@/components/ui/use-toast";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  onAssign: (staffIds: string[]) => Promise<void>;
}

export function AssignmentDialog({
  open,
  onOpenChange,
  shift,
  onAssign,
}: AssignmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableStaff();
    } else {
      setSelectedStaff([]); // Reset selections when dialog closes
    }
  }, [open]);

  const fetchAvailableStaff = async () => {
    try {
      const response = await fetch('/api/scheduling/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const staff: Staff[] = await response.json();
      
      // Filter out staff already assigned to this shift
      const assignedStaffIds = shift.assignedStaff.map(a => a.staffId);
      const availableStaff = staff.filter(s => !assignedStaffIds.includes(s.id));
      
      setAvailableStaff(availableStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available staff",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    try {
      setLoading(true);
      await onAssign(selectedStaff);
      setSelectedStaff([]); // Reset selections
      onOpenChange(false);
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign staff to shift",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Staff to Shift</DialogTitle>
          <DialogDescription>
            Select staff members to assign to this shift on {new Date(shift.startTime).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {availableStaff.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No available staff members to assign
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Certifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStaff([...selectedStaff, staff.id]);
                            } else {
                              setSelectedStaff(selectedStaff.filter(id => id !== staff.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>
                        <Badge>{staff.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {staff.certifications.map((cert) => (
                            <Badge key={cert} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || selectedStaff.length === 0}
          >
            {loading ? "Assigning..." : "Assign Selected Staff"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/create-shift-dialog.tsx
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/edit-shift-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Clock, UserPlus } from "lucide-react";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Staff {
 id: string;
 name: string;
 email: string;
 role: string;
}

interface Break {
 id?: string;
 startTime: string;
 duration: number;
}

interface EditShiftDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 shift: any;
 onShiftUpdated: () => void;
 onShiftDeleted: () => void;
}

export function EditShiftDialog({
 open,
 onOpenChange,
 shift,
 onShiftUpdated,
 onShiftDeleted
}: EditShiftDialogProps) {
 const [shiftType, setShiftType] = useState(shift.type);
 const [startTime, setStartTime] = useState(format(new Date(shift.startTime), "HH:mm"));
 const [endTime, setEndTime] = useState(format(new Date(shift.endTime), "HH:mm"));
 const [breaks, setBreaks] = useState<Break[]>(shift.breaks || []);
 const [loading, setLoading] = useState(false);
 const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
 const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
 const { toast } = useToast();

 useEffect(() => {
   if (open) {
     fetchAvailableStaff();
   }
 }, [open]);

 const fetchAvailableStaff = async () => {
   try {
     const response = await fetch('/api/scheduling/staff');
     if (!response.ok) throw new Error('Failed to fetch staff');
     const staff = await response.json();
     setAvailableStaff(staff);
   } catch (error) {
     console.error('Error fetching staff:', error);
     toast({
       title: "Error",
       description: "Failed to fetch available staff",
       variant: "destructive",
     });
   }
 };

 const handleAddBreak = () => {
   const shiftStart = new Date(shift.startTime);
   const newBreak: Break = {
     startTime: format(new Date(shiftStart).setHours(shiftStart.getHours() + 2), "HH:mm"),
     duration: 30
   };
   setBreaks([...breaks, newBreak]);
 };

 const handleRemoveBreak = (index: number) => {
   const newBreaks = [...breaks];
   newBreaks.splice(index, 1);
   setBreaks(newBreaks);
 };

 const handleUpdateBreak = (index: number, field: keyof Break, value: string | number) => {
   const newBreaks = [...breaks];
   newBreaks[index] = {
     ...newBreaks[index],
     [field]: value
   };
   setBreaks(newBreaks);
 };

 const handleAssignStaff = async () => {
   if (!selectedStaffId) return;

   try {
     setLoading(true);
     const response = await fetch(`/api/scheduling/shifts/${shift.id}/assignments`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         staffId: selectedStaffId,
       }),
     });

     if (!response.ok) {
       const error = await response.text();
       throw new Error(error);
     }

     toast({
       title: "Success",
       description: "Staff assigned successfully",
     });

     onShiftUpdated();
   } catch (error) {
     console.error('Error assigning staff:', error);
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to assign staff",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
     setSelectedStaffId(null);
   }
 };

 const handleRemoveStaffAssignment = async (staffId: string) => {
   try {
     setLoading(true);
     const response = await fetch(`/api/scheduling/shifts/${shift.id}/assignments?staffId=${staffId}`, {
       method: 'DELETE',
     });

     if (!response.ok) throw new Error('Failed to remove staff assignment');

     toast({
       title: "Success",
       description: "Staff removed from shift",
     });

     onShiftUpdated();
   } catch (error) {
     console.error('Error removing staff:', error);
     toast({
       title: "Error",
       description: "Failed to remove staff from shift",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

 const handleUpdateShift = async () => {
   try {
     setLoading(true);
     
     const shiftDate = new Date(shift.startTime);
     const [startHour, startMinute] = startTime.split(':');
     const [endHour, endMinute] = endTime.split(':');
     
     const newStartTime = new Date(shiftDate);
     newStartTime.setHours(parseInt(startHour), parseInt(startMinute));
     
     const newEndTime = new Date(shiftDate);
     newEndTime.setHours(parseInt(endHour), parseInt(endMinute));

     const formattedBreaks = breaks.map(breakItem => {
       const [breakHour, breakMinute] = breakItem.startTime.split(':');
       const breakDate = new Date(shiftDate);
       breakDate.setHours(parseInt(breakHour), parseInt(breakMinute));
       return {
         ...breakItem,
         startTime: breakDate.toISOString()
       };
     });

     const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         type: shiftType,
         startTime: newStartTime.toISOString(),
         endTime: newEndTime.toISOString(),
         breaks: formattedBreaks,
       }),
     });

     if (!response.ok) throw new Error('Failed to update shift');

     toast({
       title: "Success",
       description: "Shift updated successfully",
     });

     onShiftUpdated();
     onOpenChange(false);
   } catch (error) {
     console.error('Error updating shift:', error);
     toast({
       title: "Error",
       description: "Failed to update shift",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

 const handleDeleteShift = async () => {
   try {
     setLoading(true);
     
     const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
       method: 'DELETE',
     });

     if (!response.ok) throw new Error('Failed to delete shift');

     toast({
       title: "Success",
       description: "Shift deleted successfully",
     });

     onShiftDeleted();
     onOpenChange(false);
   } catch (error) {
     console.error('Error deleting shift:', error);
     toast({
       title: "Error",
       description: "Failed to delete shift",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="max-w-3xl">
       <DialogHeader>
         <DialogTitle>Edit Shift</DialogTitle>
       </DialogHeader>
       
       <div className="grid grid-cols-2 gap-8">
         <div className="space-y-4">
           <div className="space-y-2">
             <label className="text-sm font-medium">Date</label>
             <Input
               value={format(new Date(shift.startTime), "MMMM d, yyyy")}
               disabled
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Start Time</label>
               <Input
                 type="time"
                 value={startTime}
                 onChange={(e) => setStartTime(e.target.value)}
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium">End Time</label>
               <Input
                 type="time"
                 value={endTime}
                 onChange={(e) => setEndTime(e.target.value)}
               />
             </div>
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

           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <label className="text-sm font-medium">Breaks</label>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={handleAddBreak}
               >
                 Add Break
               </Button>
             </div>
             
             <div className="space-y-2">
               {breaks.map((breakItem, index) => (
                 <div key={index} className="flex items-center space-x-2 bg-accent/50 p-2 rounded-md">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   <Input
                     type="time"
                     value={breakItem.startTime}
                     onChange={(e) => handleUpdateBreak(index, 'startTime', e.target.value)}
                     className="w-32"
                   />
                   <Select
                     value={breakItem.duration.toString()}
                     onValueChange={(value) => handleUpdateBreak(index, 'duration', parseInt(value))}
                   >
                     <SelectTrigger className="w-32">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="15">15 minutes</SelectItem>
                       <SelectItem value="30">30 minutes</SelectItem>
                       <SelectItem value="45">45 minutes</SelectItem>
                       <SelectItem value="60">60 minutes</SelectItem>
                     </SelectContent>
                   </Select>
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => handleRemoveBreak(index)}
                   >
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </div>
               ))}
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <label className="text-sm font-medium">Assigned Staff</label>
             <div className="flex items-center space-x-2">
               <Select
                 value={selectedStaffId || ""}
                 onValueChange={setSelectedStaffId}
               >
                 <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder="Select staff member" />
                 </SelectTrigger>
                 <SelectContent>
                   {availableStaff.map((staff) => (
                     <SelectItem key={staff.id} value={staff.id}>
                       {staff.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button
                 type="button"
                 size="sm"
                 onClick={handleAssignStaff}
                 disabled={!selectedStaffId || loading}
               >
                 <UserPlus className="h-4 w-4" />
               </Button>
             </div>
           </div>

           <div className="border rounded-md">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Name</TableHead>
                   <TableHead>Role</TableHead>
                   <TableHead></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {shift.assignedStaff.length === 0 ? (
                   <TableRow>
                     <TableCell
                       colSpan={3}
                       className="text-center text-muted-foreground"
                     >
                       No staff assigned
                     </TableCell>
                   </TableRow>
                 ) : (
                   shift.assignedStaff.map((assignment: any) => (
                     <TableRow key={assignment.id}>
                       <TableCell>{assignment.staff.name}</TableCell>
                       <TableCell>
                         <Badge variant="outline">
                           {assignment.staff.role}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                         <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           onClick={() => handleRemoveStaffAssignment(assignment.staff.id)}
                           disabled={loading}
                         >
                           <Trash2 className="h-4 w-4 text-destructive" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </div>
         </div>
       </div>

       <div className="flex justify-between mt-6">
         <Button
           variant="destructive"
           onClick={handleDeleteShift}
           disabled={loading}
         >
           Delete Shift
         </Button>
         <div className="space-x-2">
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             disabled={loading}
           >
             Cancel
           </Button>
           <Button
             onClick={handleUpdateShift}
             disabled={loading}
           >
             {loading ? "Saving..." : "Save Changes"}
           </Button>
         </div>
       </div>
     </DialogContent>
   </Dialog>
 );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/shift-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShiftForm } from "@/components/scheduling/forms/shift-form";

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function ShiftDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ShiftDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Shift" : "Create New Shift"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the shift details below"
              : "Fill in the shift details below"}
          </DialogDescription>
        </DialogHeader>
        <ShiftForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/staff-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaffForm } from "@/components/scheduling/forms/staff-form";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function StaffDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: StaffDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the staff member details below"
              : "Fill in the staff member details below"}
          </DialogDescription>
        </DialogHeader>
        <StaffForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/analytics/shift-analytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users, AlertTriangle } from "lucide-react";

interface ShiftAnalyticsProps {
  shifts: any[];
  period: "day" | "week" | "month";
}

export function ShiftAnalytics({ shifts, period }: ShiftAnalyticsProps) {
  // Calculate key metrics
  const totalShifts = shifts.length;
  const unassignedShifts = shifts.filter(s => s.assignedStaff.length === 0).length;
  const totalHours = shifts.reduce((acc, shift) => {
    const duration = formatDistance(
      new Date(shift.endTime),
      new Date(shift.startTime)
    );
    return acc + parseInt(duration);
  }, 0);
  
  const laborCost = shifts.reduce((acc, shift) => {
    return acc + (shift.assignedStaff.length * 20 * parseInt(formatDistance(
      new Date(shift.endTime),
      new Date(shift.startTime)
    )));
  }, 0);

  // Prepare chart data
  const chartData = shifts.reduce((acc, shift) => {
    const date = new Date(shift.startTime).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.shifts += 1;
      existing.staff += shift.assignedStaff.length;
    } else {
      acc.push({
        date,
        shifts: 1,
        staff: shift.assignedStaff.length
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
            <p className="text-xs text-muted-foreground">
              {totalHours} total hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${laborCost}</div>
            <p className="text-xs text-muted-foreground">
              Based on hourly rates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalShifts - unassignedShifts) / totalShifts * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of shifts fully staffed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedShifts}</div>
            <Badge variant="destructive" className="mt-1">
              Understaffed shifts
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shifts" fill="#3b82f6" name="Shifts" />
                <Bar dataKey="staff" fill="#10b981" name="Staff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/middleware.ts
import { NextResponse } from 'next/server';
import { validateShiftRules } from '@/lib/scheduling/collision';

export async function validateShiftMiddleware(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.startTime || !body.endTime || !body.type) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Validate against business rules
    const validation = await validateShiftRules(body, body.assignedStaff || []);
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Shift validation failed', violations: validation.violations }),
        { status: 400 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Validation error' }),
      { status: 500 }
    );
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/staff/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      include: {
        availability: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Create staff member with availability
    const staff = await prisma.staff.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        maxHoursPerWeek: body.maxHoursPerWeek || 40,
        hourlyRate: body.hourlyRate || 20,
        certifications: body.certifications || [],
        availability: {
          create: body.availability.map((avail: any) => ({
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: avail.recurring || true,
          })),
        },
      },
      include: {
        availability: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_POST]", error);
    return new NextResponse(
      `Failed to create staff: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/staff/[id]/shifts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return new NextResponse("Date parameter is required", { status: 400 });
    }

    const date = new Date(dateParam);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const shifts = await prisma.shiftAssignment.findMany({
      where: {
        staffId: params.id,
        shift: {
          startTime: {
            gte: date,
            lt: nextDay,
          },
        },
      },
      include: {
        shift: true,
      },
      orderBy: {
        shift: {
          startTime: 'asc',
        },
      },
    });

    return NextResponse.json(shifts.map(assignment => assignment.shift));
  } catch (error) {
    console.error("[STAFF_SHIFTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    if (!body.startTime || !body.endTime || !body.type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: "DRAFT",
        requiredRoles: body.requiredRoles || [],
        notes: body.notes
      },
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      }
    });

    return NextResponse.json(shift);
  } catch (error) {
    return new NextResponse("Failed to create shift", { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const shifts = await prisma.shift.findMany({
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(shifts);
  } catch (error) {
    return new NextResponse("Failed to fetch shifts", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const shift = await prisma.shift.update({
      where: { id: params.id },
      data: {
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime)
      },
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      }
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFT_UPDATE]", error);
    return new NextResponse("Failed to update shift", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First delete related records to handle cascade
    await prisma.$transaction([
      // Delete shift assignments
      prisma.shiftAssignment.deleteMany({
        where: { shiftId: params.id }
      }),
      // Delete breaks
      prisma.break.deleteMany({
        where: { shiftId: params.id }
      }),
      // Finally delete the shift
      prisma.shift.delete({
        where: { id: params.id }
      })
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SHIFT_DELETE]", error);
    return new NextResponse("Failed to delete shift", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const shift = await prisma.shift.findUnique({
      where: { id: params.id },
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      }
    });

    if (!shift) {
      return new NextResponse("Shift not found", { status: 404 });
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFT_GET]", error);
    return new NextResponse("Failed to fetch shift", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/[id]/assignments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request, { params: { id } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        staffId,
        shiftId: id,
        status: "SCHEDULED"
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return new NextResponse("Failed to assign staff", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/time-off/time-off-overview.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  staff: {
    name: string;
  };
}

export function TimeOffOverview() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestType, setRequestType] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeOffRequests();
  }, []);

  const fetchTimeOffRequests = async () => {
    try {
      const response = await fetch('/api/directory/time-off');
      if (!response.ok) throw new Error('Failed to fetch time off requests');
      const data = await response.json();
      setTimeOffRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch time off requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTimeOff = async () => {
    if (!selectedDate || !requestType) {
      toast({
        title: "Error",
        description: "Please select a date and request type",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/directory/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: selectedDate,
          endDate: selectedDate,
          type: requestType
        }),
      });

      if (!response.ok) throw new Error('Failed to create time off request');

      toast({
        title: "Success",
        description: "Time off request submitted successfully",
      });

      fetchTimeOffRequests();
      setRequestType("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit time off request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Time Off Calendar</CardTitle>
          <CardDescription>View and manage time off requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Time Off</CardTitle>
            <CardDescription>Scheduled absences for the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : timeOffRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming time off requests</p>
              ) : (
                timeOffRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge>{request.type}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
            <CardDescription>Submit a new time off request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION">Vacation</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleRequestTimeOff}
                disabled={!selectedDate || !requestType}
              >
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/schedules/staff-schedule.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface StaffScheduleProps {
  staffId: string;
}

export function StaffSchedule({ staffId }: StaffScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaffShifts();
  }, [staffId, selectedDate]);

  const fetchStaffShifts = async () => {
    if (!selectedDate) return;

    try {
      const response = await fetch(`/api/scheduling/staff/${staffId}/shifts?date=${selectedDate.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
          <CardDescription>View staff schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule</CardTitle>
          <CardDescription>Shifts for selected date</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : shifts.length === 0 ? (
              <p className="text-center text-muted-foreground">No shifts scheduled for this date.</p>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift: any) => (
                  <div key={shift.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{shift.type} Shift</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge>{shift.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/availability/availability-manager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export function AvailabilityManager() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [availability, setAvailability] = useState<Availability[]>(
    DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      startTime: "09:00",
      endTime: "17:00",
      enabled: true
    }))
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStaff) {
      fetchAvailability();
    }
  }, [selectedStaff]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/directory/availability?staffId=${selectedStaff}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      
      setAvailability(DAYS_OF_WEEK.map((_, index) => {
        const existing = data.find((a: any) => a.dayOfWeek === index);
        return existing || {
          dayOfWeek: index,
          startTime: "09:00",
          endTime: "17:00",
          enabled: false
        };
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch availability",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/directory/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff,
          availability: availability.filter(a => a.enabled)
        }),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setAvailability(newAvailability);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Availability Preferences</CardTitle>
              <CardDescription>Set your regular working hours and preferences</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {/* Add staff members here */}
              </SelectContent>
            </Select>

            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex items-center space-x-4">
                <Switch
                  checked={availability[index].enabled}
                  onCheckedChange={(checked) => 
                    updateAvailability(index, 'enabled', checked)
                  }
                />
                <div className="flex-1">
                  <p className="font-medium">{day}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    className="w-32"
                    value={availability[index].startTime}
                    onChange={(e) => 
                      updateAvailability(index, 'startTime', e.target.value)
                    }
                    disabled={!availability[index].enabled}
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={availability[index].endTime}
                    onChange={(e) => 
                      updateAvailability(index, 'endTime', e.target.value)
                    }
                    disabled={!availability[index].enabled}
                  />
                </div>
              </div>
            ))}
          </div>  
        </CardContent>
      </Card>
    </div>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/staff/staff-directory.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "@/components/directory/staff/staff-list";
import { TimeOffOverview } from "@/components/directory/time-off/time-off-overview";
import { AvailabilityManager } from "@/components/directory/availability/availability-manager";
import { StaffSchedule } from "@/components/directory/schedules/staff-schedule";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StaffDialog } from "@/components/scheduling/dialogs/staff-dialog";
import { useToast } from "@/components/ui/use-toast";

export function StaffDirectory() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateStaff = async (data: any) => {
    try {
      const response = await fetch('/api/scheduling/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create staff member');

      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground">
            Manage staff, schedules, time off, and availability
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="schedule">Schedules</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <StaffList />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <StaffSchedule />
        </TabsContent>

        <TabsContent value="time-off" className="space-y-4">
          <TimeOffOverview />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>

      <StaffDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/staff/staff-list.tsx
"use client";

import { Staff } from "@/types/scheduling/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react";
import { StaffRole } from "@prisma/client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { StaffDialog } from "@/components/scheduling/dialogs/staff-dialog";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getRoleColor = (role: StaffRole) => {
  switch (role) {
    case 'BARISTA':
      return 'blue';
    case 'SOMMELIER':
      return 'purple';
    case 'MANAGER':
      return 'green';
    case 'EXECUTIVE':
      return 'orange';
    default:
      return 'gray';
  }
};

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/scheduling/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (updatedStaff: Staff) => {
    try {
      const response = await fetch(`/api/scheduling/staff/${updatedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaff),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
        fetchStaff(); // Refresh the staff list
      } else {
        throw new Error('Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setEditDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const handleViewSchedule = (staffId: string) => {
    router.push(`/dashboard/staff/${staffId}/schedule`);
  };

  const handleDelete = async (staffId: string) => {
    try {
      const response = await fetch(`/api/scheduling/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        });
        fetchStaff(); // Refresh the staff list
      } else {
        throw new Error('Failed to delete staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead>Max Hours</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No staff members found. Add your first staff member to get started.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{member.maxHoursPerWeek}h/week</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleEdit(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleViewSchedule(member.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StaffDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={selectedStaff}
        onSubmit={handleUpdate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedStaff && handleDelete(selectedStaff.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/directory/staff/staff-settings.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchStaffSettings,
  updateStaffSettings,
} from "@/lib/staff/settings";

interface StaffSettings {
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  preferredShifts: string[];
  emergencyContact: string;
  address: string;
  notes: string;
}

interface StaffSettingsProps {
  staffId: string;
}

export function StaffSettings({ staffId }: StaffSettingsProps) {
  const [settings, setSettings] = useState<StaffSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [staffId]);

  const loadSettings = async () => {
    try {
      const data = await fetchStaffSettings(staffId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      await updateStaffSettings(staffId, settings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Settings</CardTitle>
        <CardDescription>Manage staff member preferences and details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Maximum Hours per Week</label>
          <Input
            type="number"
            value={settings.maxHoursPerWeek}
            onChange={(e) => setSettings({
              ...settings,
              maxHoursPerWeek: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Maximum Hours per Day</label>
          <Input
            type="number"
            value={settings.maxHoursPerDay}
            onChange={(e) => setSettings({
              ...settings,
              maxHoursPerDay: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Emergency Contact</label>
          <Input
            value={settings.emergencyContact || ''}
            onChange={(e) => setSettings({
              ...settings,
              emergencyContact: e.target.value
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <Input
            value={settings.address || ''}
            onChange={(e) => setSettings({
              ...settings,
              address: e.target.value
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={settings.notes || ''}
            onChange={(e) => setSettings({
              ...settings,
              notes: e.target.value
            })}
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/directory/time-off/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const timeOff = await prisma.timeOff.create({
      data: {
        staffId: body.staffId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        type: body.type,
        status: "PENDING",
        notes: body.notes
      }
    });

    return NextResponse.json(timeOff);
  } catch (error) {
    return new NextResponse("Error creating time off request", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const timeOffRequests = await prisma.timeOff.findMany({
      include: {
        staff: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(timeOffRequests);
  } catch (error) {
    return new NextResponse("Error fetching time off requests", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/directory/availability/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Delete existing availability for this staff member
    await prisma.availability.deleteMany({
      where: { staffId: body.staffId }
    });

    // Create new availability records
    const availability = await prisma.$transaction(
      body.availability.map((avail: any) => 
        prisma.availability.create({
          data: {
            staffId: body.staffId,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: true
          }
        })
      )
    );

    return NextResponse.json(availability);
  } catch (error) {
    return new NextResponse("Error updating availability", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(availability);
  } catch (error) {
    return new NextResponse("Error fetching availability", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/directory/staff/[id]/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      select: {
        maxHoursPerWeek: true,
        maxHoursPerDay: true,
        preferredShifts: true,
        emergencyContact: true,
        address: true,
        notes: true,
      },
    });

    if (!staff) {
      return new NextResponse("Staff not found", { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    return new NextResponse("Error fetching staff settings", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(staff);
  } catch (error) {
    return new NextResponse("Error updating staff settings", { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/analytics.prisma
model AnalyticsSnapshot {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  date          DateTime
  metrics       Json
  type          String   // UTILIZATION, LABOR_COST, COVERAGE
  filters       Json?
  createdAt     DateTime @default(now())
}

model Report {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  type          String
  filters       Json
  schedule      Json?    // For automated reports
  lastRun       DateTime?
  createdBy     String   @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Alert {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String
  severity      String
  message       String
  metadata      Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}

model User {
 id            String       @id @default(auto()) @map("_id") @db.ObjectId
 email         String      @unique
 name          String?
 password      String
 role          Role        @default(USER)
 contacts      Contact[]
 bio           String?
 phoneNumber   String?
 preferences   Json?
 notifications Json?
 activities    Activity[]
 orders        Order[]
 quickNotes    QuickNote[]
 menuItems     MenuItem[]
 createdAt     DateTime    @default(now())
 updatedAt     DateTime    @updatedAt
 qrCodes       QRCode[]
 folders       Folder[]
}

model Activity {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 userId      String   @db.ObjectId
 user        User     @relation(fields: [userId], references: [id])
 contactId   String   @db.ObjectId
 type        String
 description String
 metadata    Json?
 createdAt   DateTime @default(now())
}

model Contact {
 id        String   @id @default(auto()) @map("_id") @db.ObjectId
 firstName String
 lastName  String
 email     String
 phone     String?
 company   String?
 notes     String?
 status    Status   @default(NEW)
 userId    String   @db.ObjectId
 user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

model MenuItem {
 id          String    @id @default(auto()) @map("_id") @db.ObjectId
 name        String
 price       Float
 category    String
 popular     Boolean   @default(false)
 active      Boolean   @default(true)
 createdAt   DateTime  @default(now())
 updatedAt   DateTime  @updatedAt
 userId      String    @db.ObjectId
 user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
 orderItems  OrderItem[]
}

model Order {
 id              String    @id @default(auto()) @map("_id") @db.ObjectId
 orderNumber     Int
 customerName    String
 status          OrderStatus @default(PENDING)
 timestamp       DateTime  @default(now())
 total          Float
 isComplimentary Boolean   @default(false)
 queueTime      Float
 preparationTime Float?
 startTime      DateTime?
 customerEmail  String?
 customerPhone  String?
 leadInterest   Boolean?
 notes          String?
 items          OrderItem[]
 userId         String    @db.ObjectId
 user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
 createdAt      DateTime  @default(now())
 updatedAt      DateTime  @updatedAt
}

model OrderItem {
 id          String    @id @default(auto()) @map("_id") @db.ObjectId
 menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
 menuItemId  String    @db.ObjectId
 order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
 orderId     String    @db.ObjectId
 quantity    Int
 price       Float
 createdAt   DateTime  @default(now())
 updatedAt   DateTime  @updatedAt
}

model QuickNote {
 id        String   @id @default(auto()) @map("_id") @db.ObjectId
 content   String
 userId    String   @db.ObjectId
 user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

model Folder {
 id        String    @id @default(auto()) @map("_id") @db.ObjectId
 name      String
 color     String?   @default("#94a3b8")
 createdAt DateTime  @default(now())
 updatedAt DateTime  @updatedAt
 qrCodes   QRCode[]
 userId    String    @db.ObjectId
 user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
 id            String         @id @default(auto()) @map("_id") @db.ObjectId
 name          String
 defaultUrl    String
 shortCode     String         @unique
 isActive      Boolean        @default(true)
 createdAt     DateTime       @default(now())
 updatedAt     DateTime       @updatedAt
 userId        String         @db.ObjectId
 user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
 folderId      String?        @db.ObjectId
 folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
 deviceRules   DeviceRule[]
 scheduleRules ScheduleRule[]
 design        QRDesign?
 scans         Scan[]
}

model QRDesign {
 id                  String   @id @default(auto()) @map("_id") @db.ObjectId
 size                Int      @default(300)
 backgroundColor     String   @default("#FFFFFF")
 foregroundColor     String   @default("#000000")
 logoImage          String?
 logoWidth          Int?
 logoHeight         Int?
 dotStyle           String    @default("squares")
 margin             Int       @default(20)
 errorCorrectionLevel String  @default("M")
 style              Json
 logoStyle          Json?
 imageRendering     String    @default("auto")
 qrCodeId           String    @unique @db.ObjectId
 qrCode            QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
 createdAt          DateTime  @default(now())
 updatedAt          DateTime  @updatedAt
}


model Scan {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 qrCodeId    String   @db.ObjectId
 qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
 userAgent   String?
 ipAddress   String?
 location    String?
 device      String?
 browser     String?
 os          String?
 timestamp   DateTime @default(now())
}

model DeviceRule {
 id         String   @id @default(auto()) @map("_id") @db.ObjectId
 qrCodeId   String   @db.ObjectId
 qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
 deviceType String
 browsers   String[]
 os         String[]
 targetUrl  String
 priority   Int
 createdAt  DateTime @default(now())
 updatedAt  DateTime @updatedAt
}

model ScheduleRule {
 id         String    @id @default(auto()) @map("_id") @db.ObjectId
 qrCodeId   String    @db.ObjectId
 qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
 startDate  DateTime
 endDate    DateTime?
 timeZone   String
 daysOfWeek Int[]
 startTime  String?
 endTime    String?
 targetUrl  String
 priority   Int
 createdAt  DateTime  @default(now())
 updatedAt  DateTime  @updatedAt
}

enum Role {
 USER
 ADMIN
}

enum Status {
 NEW
 CONTACTED
 QUALIFIED
 CONVERTED
 LOST
}

enum OrderStatus {
 PENDING
 IN_PROGRESS
 COMPLETED
 CANCELLED
}

// Scheduling models
model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences     Json?  // Store staff scheduling preferences
  maxShiftsPerWeek    Int     @default(5)
  preferredShiftLength Int     @default(8)  // in hours
  preferredDays       Int[]   // 0-6 for days of week
  blackoutDates       DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int       @default(8)
  notes            String?
}
model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json              // Array of required roles and counts
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int      // in minutes
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int      // 0-6 (Sunday-Saturday)
  startTime String   // 24h format "HH:mm"
  endTime   String   // 24h format "HH:mm"
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}


model SchedulingRule {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  isActive    Boolean  @default(true)
  
  // Rule types
  ruleType    RuleType @default(BASIC)
  
  // Rule conditions
  minStaffPerShift   Int?
  maxStaffPerShift   Int?
  requireCertification Boolean @default(false)
  requiredCertifications String[]
  
  // Time constraints
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[] // 0-6 for days of week
  preferredHours       String[] // ["09:00-17:00", "13:00-21:00"]
  
  // Staff requirements
  roleRequirements Json? // e.g. {"BARISTA": 2, "SOMMELIER": 1}
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AssignmentStatus {
  SCHEDULED
  CONFIRMED
  CHECKED_IN
  COMPLETED
  NO_SHOW
}


enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

model TimeOff {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String      @db.ObjectId
  staff       Staff       @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
________________________________________________________________________________
