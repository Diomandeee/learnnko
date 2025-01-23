import { Shift } from '@/types/scheduling/shift';
import { Staff } from '@/types/scheduling/staff';

export function calculateShiftHours(startTime: Date | string, endTime: Date | string): number {
 const start = new Date(startTime);
 const end = new Date(endTime);
 const diffMs = end.getTime() - start.getTime();
 return diffMs / (1000 * 60 * 60);
}

export function isWithinTimeRange(
 time: Date,
 rangeStart: Date,
 rangeEnd: Date
): boolean {
 return time >= rangeStart && time <= rangeEnd;
}

export function calculateBreakTiming(
 shiftStart: Date,
 shiftDuration: number
): { startTime: Date; duration: number } {
 // Break starts halfway through the shift
 const breakStart = new Date(shiftStart);
 breakStart.setHours(breakStart.getHours() + (shiftDuration / 2));

 return {
   startTime: breakStart,
   duration: 30,
 };
}

export function validateBreakTiming(
 breakStart: Date,
 breakDuration: number,
 shiftStart: Date,
 shiftEnd: Date
): boolean {
 const breakEnd = new Date(breakStart);
 breakEnd.setMinutes(breakEnd.getMinutes() + breakDuration);

 return (
   breakStart >= shiftStart &&
   breakEnd <= shiftEnd &&
   breakDuration >= 15 && // Minimum break duration
   breakDuration <= 60 // Maximum break duration
 );
}

interface WeeklyScheduleShift extends Omit<Shift, 'assignedStaff'> {
  assignedStaff: Array<{
    id: string;
    shiftId: string;
    staffId: string;
    status: string;
    staff: Staff | undefined;
  }>;
}

export function generateWeeklySchedule(
  startDate: Date,
  shifts: Shift[],
  staff: Staff[]
): Array<{
  date: Date;
  shifts: WeeklyScheduleShift[];
}> {
 const schedule = [];
 const currentDate = new Date(startDate);

 // Generate 7 days of schedule
 for (let i = 0; i < 7; i++) {
   const dayShifts = shifts.filter(shift => {
     const shiftDate = new Date(shift.startTime);
     return (
       shiftDate.getDate() === currentDate.getDate() &&
       shiftDate.getMonth() === currentDate.getMonth() &&
       shiftDate.getFullYear() === currentDate.getFullYear()
     );
   });

   schedule.push({
     date: new Date(currentDate),
     shifts: dayShifts.map(shift => ({
       ...shift,
       assignedStaff: shift.assignedStaff.map(assignment => {
         const staffMember = staff.find(s => s.id === assignment.staffId);
         return {
           ...assignment,
           staff: staffMember,
         };
       }),
     })),
   });

   currentDate.setDate(currentDate.getDate() + 1);
 }

 return schedule;
}

export function calculateStaffUtilization(
  staff: Staff,
  shifts: Shift[]
): number {
 const totalAssignedHours = shifts.reduce((total, shift) => {
   const assignedToStaff = shift.assignedStaff.some(
     assignment => assignment.staffId === staff.id
   );
   if (assignedToStaff) {
     return total + calculateShiftHours(shift.startTime, shift.endTime);
   }
   return total;
 }, 0);

 const maxPossibleHours = staff.maxHoursPerWeek;
 return (totalAssignedHours / maxPossibleHours) * 100;
}

export function getShiftRequirements(
 type: 'COFFEE' | 'WINE',
 expectedCustomers: number
): { role: string; count: number }[] {
 const requirements = [];

 if (type === 'COFFEE') {
   requirements.push(
     { role: 'BARISTA', count: Math.ceil(expectedCustomers / 30) },
     { role: 'MANAGER', count: 1 }
   );
 } else {
   requirements.push(
     { role: 'SOMMELIER', count: Math.ceil(expectedCustomers / 20) },
     { role: 'MANAGER', count: 1 }
   );
 }

 return requirements;
}

export function calculateLaborCost(
  shift: Shift,
  assignedStaff: Staff[]
): { total: number; byRole: Record<string, number> } {
 const hours = calculateShiftHours(shift.startTime, shift.endTime);
 
 const costByRole = assignedStaff.reduce((acc, staff) => {
   if (!acc[staff.role]) {
     acc[staff.role] = 0;
   }
   acc[staff.role] += staff.hourlyRate * hours;
   return acc;
 }, {} as Record<string, number>);

 const totalCost = Object.values(costByRole).reduce((a, b) => a + b, 0);

 return {
   total: totalCost,
   byRole: costByRole,
 };
}
