import { prisma } from "@/lib/db/prisma";
import { addDays, addWeeks, addMonths, setHours, setMinutes } from "date-fns";

type RecurrencePattern = {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  count?: number;
};

interface RecurringShift {
  baseShift: any;
  pattern: RecurrencePattern;
}

export async function createRecurringShifts(recurringShift: RecurringShift) {
  const { baseShift, pattern } = recurringShift;
  const shifts = [];
  let currentDate = new Date(baseShift.startTime);
  let occurrences = 0;

  while (
    (!pattern.endDate || currentDate <= pattern.endDate) &&
    (!pattern.count || occurrences < pattern.count)
  ) {
    // Skip if the day doesn't match the pattern
    if (pattern.daysOfWeek && !pattern.daysOfWeek.includes(currentDate.getDay())) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    // Create the shift
    const shiftStartTime = new Date(currentDate);
    setHours(shiftStartTime, new Date(baseShift.startTime).getHours());
    setMinutes(shiftStartTime, new Date(baseShift.startTime).getMinutes());

    const shiftEndTime = new Date(currentDate);
    setHours(shiftEndTime, new Date(baseShift.endTime).getHours());
    setMinutes(shiftEndTime, new Date(baseShift.endTime).getMinutes());

    const shift = await prisma.shift.create({
      data: {
        type: baseShift.type,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        requiredRoles: baseShift.requiredRoles,
        status: 'DRAFT',
        breaks: {
          create: baseShift.breaks.map((breakItem: any) => {
            const breakStartTime = new Date(shiftStartTime);
            breakStartTime.setMinutes(
              breakStartTime.getMinutes() + breakItem.offsetMinutes
            );
            return {
              startTime: breakStartTime,
              duration: breakItem.duration
            };
          })
        }
      },
      include: {
        breaks: true
      }
    });

    shifts.push(shift);
    occurrences++;

    // Increment date based on frequency
    switch (pattern.frequency) {
      case 'DAILY':
        currentDate = addDays(currentDate, pattern.interval);
        break;
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, pattern.interval);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, pattern.interval);
        break;
    }
  }

  return shifts;
}
