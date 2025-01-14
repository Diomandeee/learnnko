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
