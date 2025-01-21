import { format, addDays, isSameDay, differenceInHours, startOfDay, endOfDay } from "date-fns";
import type { Shift } from "@/types/scheduling";

const STANDARD_HOURLY_RATE = 20;

export function calculateShiftOverlaps(shifts: Shift[]) {
 const shiftGroups = new Map<string, Shift[]>();

 shifts.forEach(shift => {
   const date = format(new Date(shift.startTime), 'yyyy-MM-dd');
   const existing = shiftGroups.get(date) || [];
   shiftGroups.set(date, [...existing, shift]);
 });

 const overlaps = new Map<string, { count: number; index: number; }>();

 shiftGroups.forEach((dayShifts) => {
   const sorted = [...dayShifts].sort((a, b) => 
     new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
   );

   sorted.forEach((shift, index) => {
     let overlapCount = 0;
     let overlapIndex = 0;

     sorted.forEach((compareShift, compareIndex) => {
       if (shift.id === compareShift.id) return;

       const isOverlapping = checkOverlap(
         new Date(shift.startTime),
         new Date(shift.endTime),
         new Date(compareShift.startTime),
         new Date(compareShift.endTime)
       );

       if (isOverlapping) {
         overlapCount++;
         if (compareIndex < index) overlapIndex++;
       }
     });

     overlaps.set(shift.id, { count: overlapCount, index: overlapIndex });
   });
 });

 return overlaps;
}

export function checkOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
 return start1 < end2 && end1 > start2;
}

export function calculateShiftLaborCost(shift: Shift): number {
 const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
 return hours * STANDARD_HOURLY_RATE * shift.assignedStaff.length;
}

export function getShiftAnalytics(shifts: Shift[], date: Date) {
 const dayStart = startOfDay(date);
 const dayEnd = endOfDay(date);

 const dayShifts = shifts.filter(shift => 
   isSameDay(new Date(shift.startTime), date)
 );

 const uniqueStaff = new Set();
 let totalHours = 0;
 let totalCost = 0;

 dayShifts.forEach(shift => {
   const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
   totalHours += hours;

   shift.assignedStaff.forEach(assignment => {
     uniqueStaff.add(assignment.staff.id);
     totalCost += hours * STANDARD_HOURLY_RATE;
   });
 });

 return {
   totalShifts: dayShifts.length,
   uniqueStaff: uniqueStaff.size,
   totalHours,
   totalCost,
   understaffedShifts: dayShifts.filter(s => 
     s.requiredRoles && s.assignedStaff.length < s.requiredRoles.minStaff
   ).length
 };
}

export function getBreakPositions(breaks: { startTime: string; duration: number; }[], shiftStart: Date) {
 return breaks.map(breakItem => {
   const [hours, minutes] = breakItem.startTime.split(':').map(Number);
   const breakStart = new Date(shiftStart);
   breakStart.setHours(hours, minutes);

   return {
     start: differenceInHours(breakStart, shiftStart),
     duration: breakItem.duration / 60
   };
 });
}
