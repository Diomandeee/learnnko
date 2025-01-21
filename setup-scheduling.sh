#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Updating shift calendar with stacked layout and actions...${NC}"

# Create a helper function for shift positioning
cat > "src/lib/scheduling/utils.ts" << 'EOF'
import { addMinutes, differenceInMinutes, format, isBefore } from "date-fns";

export const CELL_HEIGHT = 60;
export const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM

export function getShiftPosition(shift: any) {
  const start = new Date(shift.startTime);
  const startHour = start.getHours() + start.getMinutes() / 60 - 6; // Subtract 6 for offset
  const duration = differenceInMinutes(new Date(shift.endTime), start) / 60;
  
  return {
    top: `${startHour * CELL_HEIGHT}px`,
    height: `${duration * CELL_HEIGHT}px`,
  };
}

export function overlapsWithShift(shift1: any, shift2: any) {
  const start1 = new Date(shift1.startTime);
  const end1 = new Date(shift1.endTime);
  const start2 = new Date(shift2.startTime);
  const end2 = new Date(shift2.endTime);

  return isBefore(start1, end2) && isBefore(start2, end1);
}

export function calculateShiftStack(shifts: any[]) {
  const stacks: any[][] = [];
  
  shifts.forEach(shift => {
    let added = false;
    
    for (const stack of stacks) {
      if (!stack.some(s => overlapsWithShift(s, shift))) {
        stack.push(shift);
        added = true;
        break;
      }
    }
    
    if (!added) {
      stacks.push([shift]);
    }
  });

  return stacks;
}
EOF

# Update the shift calendar component
cat > "src/components/scheduling/calendar/shift-calendar.tsx" << 'EOF'
"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CELL_HEIGHT, HOURS, getShiftPosition, calculateShiftStack } from "@/lib/scheduling/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { EditShiftDialog } from "@/components/scheduling/dialogs/edit-shift-dialog";
import { CreateShiftDialog } from "@/components/scheduling/dialogs/create-shift-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AssignmentDialog } from "@/components/scheduling/dialogs/assignment-dialog";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  UserPlus,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ShiftCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const { toast } = useToast();
  const calendarRef = useRef(null);

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
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (shiftData) => {
    try {
      const response = await fetch('/api/scheduling/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) throw new Error('Failed to create shift');

      toast({
        title: "Success",
        description: "Shift created successfully",
      });

      fetchShifts();
      setCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
    }
  };

  const handleUpdateShift = async (shiftData) => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${selectedShift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData),
      });

      if (!response.ok) throw new Error('Failed to update shift');

      toast({
        title: "Success",
        description: "Shift updated successfully",
      });

      fetchShifts();
      setEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shift",
        variant: "destructive",
      });
    }
  };

  const handleDeleteShift = async () => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${selectedShift.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete shift');

      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });

      fetchShifts();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
    }
  };

  const handleAssignStaff = async (staffIds) => {
    try {
      await Promise.all(
        staffIds.map((staffId) =>
          fetch(`/api/scheduling/shifts/${selectedShift.id}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffId }),
          })
        )
      );

      toast({
        title: "Success",
        description: "Staff assigned successfully",
      });

      fetchShifts();
      setAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    const newDate = addDays(currentDate, days);
    setCurrentDate(newDate);
    setWeekStart(startOfWeek(newDate));
  };

  const renderShift = (shift: any, stack: number, totalStacks: number) => {
    const position = getShiftPosition(shift);
    const width = `${100 / totalStacks}%`;
    const left = `${(stack * 100) / totalStacks}%`;

    return (
      <div
        key={shift.id}
        className={cn(
          "absolute rounded-md border p-2 cursor-pointer transition-all",
          shift.type === 'COFFEE' ? 'bg-blue-500/90 hover:bg-blue-600/90' : 'bg-purple-500/90 hover:bg-purple-600/90',
          'text-white'
        )}
        style={{
          ...position,
          width,
          left,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium">
              {format(new Date(shift.startTime), "h:mm a")}
            </div>
            <div className="text-xs">
              {shift.assignedStaff?.length || 0} staff
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setSelectedShift(shift);
                setAssignDialogOpen(true);
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Staff
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedShift(shift);
                setEditDialogOpen(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Shift
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setSelectedShift(shift);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderDay = (date: Date) => {
    const dayShifts = shifts.filter(shift => isSameDay(new Date(shift.startTime), date));
    const stacks = calculateShiftStack(dayShifts);

    return (
      <div key={date.toISOString()} className="relative bg-background">
        <div className="sticky top-0 z-20 bg-background p-2 text-center border-b">
          <div className="text-sm font-medium">
            {format(date, "EEE")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d")}
          </div>
        </div>

        <div className="relative">
          {HOURS.map((hour, index) => (
            <div
              key={hour}
              className={cn(
                "border-t h-[60px] relative group",
                index % 2 === 0 ? "bg-muted/50" : ""
              )}
              onClick={() => {
                setSelectedDate(date);
                setSelectedHour(hour);
                setCreateDialogOpen(true);
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}

          {stacks.map((stack, stackIndex) =>
            stack.map(shift => renderShift(shift, stackIndex, stacks.length))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-lg font-semibold">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </div>

          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono">
            {shifts.length} shifts
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-px bg-muted rounded-lg overflow-hidden" ref={calendarRef}>
        {/* Time column */}
        <div className="bg-background">
          <div className="sticky top-0 z-20 bg-background p-2">
            <span className="text-sm font-medium">Time</span>
          </div>
          <div>
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="border-t h-[60px] p-1"
              >
                <span className="text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0), "ha")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(renderDay)}
      </div>

      {/* Dialogs */}
      {selectedDate && (
        <CreateShiftDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          onShiftCreated={handleCreateShift}
        />
      )}

      {selectedShift && (
        <>
          <EditShiftDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            shift={selectedShift}
            onShiftUpdated={handleUpdateShift}
          />

          <AssignmentDialog
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            shift={selectedShift}
            onAssign={handleAssignStaff}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this shift? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteShift}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  );
}
EOF


# Create helper types for the calendar
cat > "src/types/scheduling/calendar.ts" << 'EOF'
export interface ShiftStack {
  shifts: any[];
  width: number;
  left: number;
}

export interface TimeSlot {
  date: Date;
  hour: number;
}

export interface ShiftPosition {
  top: string;
  height: string;
  left: string;
  width: string;
}
EOF

# Update the shift styles utility
cat > "src/lib/scheduling/styles.ts" << 'EOF'
export const SHIFT_STYLES = {
  COFFEE: {
    background: 'bg-blue-500/90 hover:bg-blue-600/90',
    text: 'text-white',
    border: 'border-blue-600',
  },
  WINE: {
    background: 'bg-purple-500/90 hover:bg-purple-600/90',
    text: 'text-white',
    border: 'border-purple-600',
  },
};

export const TIME_SLOT_STYLES = {
  base: 'border-t relative transition-colors',
  even: 'bg-muted/50',
  odd: 'bg-background',
  hover: 'hover:bg-accent/50',
};
EOF

# Add collision detection utilities
cat > "src/lib/scheduling/collision.ts" << 'EOF'
export function detectCollision(shift1: any, shift2: any): boolean {
  const start1 = new Date(shift1.startTime);
  const end1 = new Date(shift1.endTime);
  const start2 = new Date(shift2.startTime);
  const end2 = new Date(shift2.endTime);

  return start1 < end2 && start2 < end1;
}

export function getStackPosition(shift: any, shifts: any[]): number {
  let stack = 0;
  const overlapping = shifts.filter(s => detectCollision(shift, s));
  
  while (overlapping.some(s => s.stack === stack)) {
    stack++;
  }
  
  return stack;
}

export function calculateStackWidth(totalStacks: number): string {
  const minWidth = 150; // minimum width in pixels
  return `min(${100 / totalStacks}%, ${minWidth}px)`;
}
EOF

# Update the types for shifts
cat > "src/types/scheduling/shift.ts" << 'EOF'
import { ShiftType, ShiftStatus } from "@prisma/client";

export interface Shift {
  id: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  notes?: string;
  requiredRoles: any;
  assignedStaff: ShiftAssignment[];
  breaks: Break[];
  createdAt: string;
  updatedAt: string;
  stack?: number;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  status: string;
  staff: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Break {
  id: string;
  startTime: string;
  duration: number;
}
EOF

echo -e "${GREEN}✓ Updated shift calendar with stacked layout and working actions${NC}"
echo -e "${BLUE}The calendar now supports:"
echo "- Stacked shifts per day"
echo "- Working edit, delete, and assign actions"
echo "- Improved collision detection"
echo "- Better shift positioning${NC}"

# Create a migrations directory if it doesn't exist
mkdir -p prisma/migrations

echo -e "${BLUE}Remember to run prisma migrate if you haven't:${NC}"
echo "npx prisma generate"
echo "npx prisma migrate dev"