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
