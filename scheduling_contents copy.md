### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/calendar/shift-calendar.tsx
```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO, addMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
 Calendar, 
 ChevronLeft, 
 ChevronRight,
 Calendar as CalendarIcon,
 Clock as ClockIcon
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
   };
 }>;
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
 const calendarRef = useRef<HTMLDivElement>(null);
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

 const renderBreak = (shift: Shift, breakItem: Break) => {
   const breakStart = new Date(breakItem.startTime);
   const breakStartHour = breakStart.getHours() + (breakStart.getMinutes() / 60) - 6;
   const breakDuration = breakItem.duration / 60; // Convert minutes to hours

   return (
     <div
       key={breakItem.id}
       className="absolute left-0 right-0 bg-yellow-300/30 pointer-events-none"
       style={{
         top: `${breakStartHour * CELL_HEIGHT}px`,
         height: `${breakDuration * CELL_HEIGHT}px`,
       }}
     />
   );
 };

 const renderShift = (shift: Shift, overlaps: Map<string, { count: number; index: number }>) => {
   const assignedTo = getAssignedStaffDisplay(shift);
   const timeDisplay = `${format(new Date(shift.startTime), "h:mm a")} - ${format(new Date(shift.endTime), "h:mm a")}`;

   return (
     <div
       key={shift.id}
       style={getShiftStyles(shift, overlaps)}
       onClick={(e) => handleShiftClick(shift, e)}
       className="relative"
     >
       <div 
         className={`
           absolute top-0 left-0 right-0 bottom-0 rounded-md border p-2 cursor-pointer
           ${SHIFT_COLORS[shift.type].bg}
           ${SHIFT_COLORS[shift.type].border}
           ${SHIFT_COLORS[shift.type].hover}
           ${SHIFT_COLORS[shift.type].text}
           transition-all duration-200
         `}
         onMouseDown={(e) => handleMouseDown(shift, 'move', e)}
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
         
         {/* Render breaks */}
         {shift.breaks?.map(breakItem => renderBreak(shift, breakItem))}
         
         {/* Resize handle */}
         <div
           className="absolute bottom-0 right-0 w-4 h-4 cursor-ns-resize"
           onMouseDown={(e) => handleMouseDown(shift, 'resize', e)}
         />
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
             
             <div className="relative">
               {HOURS.map((hour) => (
                 <div
                   key={hour}
                   style={{ height: `${CELL_HEIGHT}px` }}
                   className="border-t cursor-pointer hover:bg-accent/50 transition-colors"
                   onClick={() => handleTimeSlotClick(date, hour)}
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
           <div className="flex items-center space-x-2">
             <div className="w-3 h-3 rounded bg-yellow-300/30"></div>
             <span className="text-sm">Break</span>
           </div>
         </div>
       </div>
     </div>

     <div className="overflow-auto" ref={calendarRef}>
       {renderTimeGrid()}
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/calendar/staff-calendar.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/forms/shift-form.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/forms/staff-form.tsx
```typescript
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
      hourlyRate: 15,
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/lists/shift-list.tsx
```typescript
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
import { AssignmentDialog } from "@/components/scheduling/dialogs/assignment-dialog";

const getShiftTypeColor = (type: ShiftType) => {
  return type === "COFFEE" ? "blue" : "purple";
};

const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "DRAFT":
      return "gray";
    case "PUBLISHED":
      return "green";
    case "IN_PROGRESS":
      return "blue";
    case "COMPLETED":
      return "purple";
    default:
      return "gray";
  }
};

export function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/scheduling/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      }
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

  const handleAssignStaff = async (staffIds: string[]) => {
    if (!selectedShift) return;

    try {
      const responses = await Promise.all(
        staffIds.map((staffId) =>
          fetch(`/api/scheduling/shifts/${selectedShift.id}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffId, roleId: selectedShift.requiredRoles[0]?.roleId }),
          })
        )
      );

      if (responses.every(r => r.ok)) {
        toast({
          title: "Success",
          description: "Staff assigned successfully",
        });
        fetchShifts(); // Refresh the shifts list
      } else {
        throw new Error("Failed to assign one or more staff members");
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Shift deleted successfully",
        });
        fetchShifts(); // Refresh the shifts list
      } else {
        throw new Error("Failed to delete shift");
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
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
      <div className="space-y-4">
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
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No shifts found. Create your first shift to get started.
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      {format(new Date(shift.startTime), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.startTime), "h:mm a")} -{" "}
                      {format(new Date(shift.endTime), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getShiftTypeColor(shift.type)}>
                        {shift.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setAssignmentDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(shift.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Shift
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
      </div>

      {selectedShift && (
        <AssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          shift={selectedShift}
          onAssign={handleAssignStaff}
        />
      )}
    </>
  );
}

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/lists/staff-list.tsx
```typescript
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

interface StaffListProps {
  onEdit?: (staff: Staff) => void;
  onDelete?: (staffId: string) => void;
  onViewSchedule?: (staffId: string) => void;
}

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

export function StaffList({ onEdit, onDelete, onViewSchedule }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/scheduling/staff');
        if (response.ok) {
          const data = await response.json();
          setStaff(data);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                        <DropdownMenuItem onSelect={() => onEdit?.(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onViewSchedule?.(member.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => onDelete?.(member.id)}
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
    </div>
  );
}

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/shared/shift-card.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/assignment-dialog.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/create-shift-dialog.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/edit-shift-dialog.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/shift-dialog.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/scheduling/dialogs/staff-dialog.tsx
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/staff/route.ts
```typescript
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
        hourlyRate: body.hourlyRate || 15,
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/route.ts
```typescript
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

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/[id]/route.ts
```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request, { params: { id } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const shift = await prisma.shift.update({
      where: { id },
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
    return new NextResponse(`Failed to update shift: ${error.message}`, { 
      status: 500 
    });
  }
}

```
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/scheduling/shifts/[id]/assignments/route.ts
```typescript
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

```
________________________________________________________________________________
