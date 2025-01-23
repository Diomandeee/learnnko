import {  differenceInMinutes, isBefore } from "date-fns";

export const CELL_HEIGHT = 60;
export const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM

interface Shift {
  startTime: string | Date;
  endTime: string | Date;
}

export function getShiftPosition(shift: Shift) {
  const start = new Date(shift.startTime);
  const startHour = start.getHours() + start.getMinutes() / 60 - 6; // Subtract 6 for offset
  const duration = differenceInMinutes(new Date(shift.endTime), start) / 60;
  
  return {
    top: `${startHour * CELL_HEIGHT}px`,
    height: `${duration * CELL_HEIGHT}px`,
  };
}

export function overlapsWithShift(shift1: Shift, shift2: Shift) {
  const start1 = new Date(shift1.startTime);
  const end1 = new Date(shift1.endTime);
  const start2 = new Date(shift2.startTime);
  const end2 = new Date(shift2.endTime);

  return isBefore(start1, end2) && isBefore(start2, end1);
}

export function calculateShiftStack(shifts: Shift[]) {
  const stacks: Shift[][] = [];
  
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
