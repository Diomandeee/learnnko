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
