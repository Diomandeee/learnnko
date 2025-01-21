import { 
 format, 
 addDays, 
 startOfWeek, 
 endOfWeek,
 isSameDay,
 differenceInMinutes,
 addMinutes
} from 'date-fns';
import type { Shift, Break } from '@/types/scheduling';

interface TimeSlot {
 date: Date;
 hour: number;
 minutes: number;
 isOccupied: boolean;
 shifts: Shift[];
}

export function generateTimeSlots(
 date: Date,
 shifts: Shift[],
 interval: number = 15
): TimeSlot[] {
 const slots: TimeSlot[] = [];
 const startHour = 6; // 6 AM
 const endHour = 24; // 12 AM

 for (let hour = startHour; hour <= endHour; hour++) {
   for (let minutes = 0; minutes < 60; minutes += interval) {
     const slotDate = new Date(date);
     slotDate.setHours(hour, minutes, 0, 0);

     const overlappingShifts = shifts.filter(shift => {
       const start = new Date(shift.startTime);
       const end = new Date(shift.endTime);
       return slotDate >= start && slotDate < end;
     });

     slots.push({
       date: slotDate,
       hour,
       minutes,
       isOccupied: overlappingShifts.length > 0,
       shifts: overlappingShifts
     });
   }
 }

 return slots;
}

export function calculateBreakTiming(shift: Shift, breakItem: Break) {
 const shiftStart = new Date(shift.startTime);
 const [breakHour, breakMinute] = breakItem.startTime.split(':').map(Number);
 
 const breakStart = new Date(shiftStart);
 breakStart.setHours(breakHour, breakMinute, 0, 0);
 
 const breakEnd = addMinutes(breakStart, breakItem.duration);

 return {
   start: differenceInMinutes(breakStart, shiftStart) / 60,
   duration: breakItem.duration / 60
 };
}

export function getShiftDimensions(shift: Shift, cellHeight: number) {
 const start = new Date(shift.startTime);
 const end = new Date(shift.endTime);
 
 const startHour = start.getHours() + start.getMinutes() / 60 - 6; // Subtract 6 for calendar start time
 const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

 return {
   top: startHour * cellHeight,
   height: duration * cellHeight
 };
}

export function getWeekRange(date: Date) {
 const start = startOfWeek(date);
 const end = endOfWeek(date);
 
 const days = [];
 let current = start;

 while (current <= end) {
   days.push(current);
   current = addDays(current, 1);
 }

 return days;
}

export function groupShiftsByDay(shifts: Shift[]) {
 const grouped = new Map<string, Shift[]>();

 shifts.forEach(shift => {
   const date = format(new Date(shift.startTime), 'yyyy-MM-dd');
   const dayShifts = grouped.get(date) || [];
   grouped.set(date, [...dayShifts, shift]);
 });

 return grouped;
}

export function calculateShiftStats(shift: Shift) {
 const start = new Date(shift.startTime);
 const end = new Date(shift.endTime);
 const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
 
 const standardHourlyRate = 20;
 const laborCost = duration * standardHourlyRate * shift.assignedStaff.length;
 
 const totalBreakTime = shift.breaks.reduce((total, breakItem) => 
   total + breakItem.duration, 0
 ) / 60; // Convert to hours

 const netWorkingHours = duration - totalBreakTime;

 return {
   duration,
   laborCost,
   totalBreakTime,
   netWorkingHours,
   staffCount: shift.assignedStaff.length,
   isUnderstaffed: shift.requiredRoles && 
     shift.assignedStaff.length < shift.requiredRoles.minStaff,
   staffingDeficit: shift.requiredRoles ? 
     Math.max(0, shift.requiredRoles.minStaff - shift.assignedStaff.length) : 0
 };
}
