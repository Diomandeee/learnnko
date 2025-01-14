import { prisma } from "@/lib/db/prisma";
import { 
  Shift, 
  StaffAssignment, 
  Break, 
  ShiftTemplate 
} from "@/types/scheduling";
import { calculateShiftHours } from "../utils/schedule-utils";
import { ShiftType, ShiftStatus, AssignmentStatus } from "@prisma/client";

export class ScheduleService {
  // Shift Operations
  static async createShift(shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> {
    return prisma.shift.create({
      data: {
        ...shiftData,
        requiredRoles: JSON.stringify(shiftData.requiredRoles),
      },
      include: {
        assignedStaff: true,
        breaks: true,
      },
    });
  }

  static async updateShift(
    id: string, 
    shiftData: Partial<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Shift> {
    return prisma.shift.update({
      where: { id },
      data: {
        ...shiftData,
        requiredRoles: shiftData.requiredRoles 
          ? JSON.stringify(shiftData.requiredRoles)
          : undefined,
      },
      include: {
        assignedStaff: true,
        breaks: true,
      },
    });
  }

  static async deleteShift(id: string): Promise<void> {
    await prisma.shift.delete({
      where: { id },
    });
  }

  static async getShiftsByDateRange(startDate: Date, endDate: Date): Promise<Shift[]> {
    return prisma.shift.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        assignedStaff: true,
        breaks: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  // Staff Assignment Operations
  static async assignStaffToShift(
    shiftId: string,
    staffId: string,
    roleId: string
  ): Promise<StaffAssignment> {
    // Validate staff availability
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new Error('Shift not found');
    }

    // Check for scheduling conflicts
    const conflicts = await this.checkSchedulingConflicts(
      staffId,
      shift.startTime,
      shift.endTime
    );

    if (conflicts) {
      throw new Error('Staff member has scheduling conflicts');
    }

    // Check weekly hours limit
    const weekStart = new Date(shift.startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weeklyHours = await this.calculateWeeklyHours(
      staffId,
      weekStart,
      weekEnd
    );

    const shiftHours = calculateShiftHours(shift.startTime, shift.endTime);

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new Error('Staff member not found');
    }

    if (weeklyHours + shiftHours > staff.maxHoursPerWeek) {
      throw new Error('Assignment would exceed weekly hours limit');
    }

    // Create assignment
    return prisma.shiftAssignment.create({
      data: {
        shiftId,
        staffId,
        roleId,
        status: 'SCHEDULED',
      },
    });
  }

  static async removeStaffFromShift(
    shiftId: string,
    staffId: string
  ): Promise<void> {
    await prisma.shiftAssignment.deleteMany({
      where: {
        shiftId,
        staffId,
      },
    });
  }

  // Break Management
  static async addBreak(breakData: Omit<Break, 'id' | 'createdAt' | 'updatedAt'>): Promise<Break> {
    return prisma.break.create({
      data: breakData,
    });
  }

  static async updateBreak(
    id: string,
    breakData: Partial<Omit<Break, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Break> {
    return prisma.break.update({
      where: { id },
      data: breakData,
    });
  }

  // Template Operations
  static async createShiftFromTemplate(
    templateId: string,
    date: Date
  ): Promise<Shift> {
    const template = await this.getShiftTemplate(
     templateId
   );

   if (!template) {
     throw new Error('Template not found');
   }

   // Set shift times based on template duration
   const startTime = date;
   const endTime = new Date(date);
   endTime.setMinutes(endTime.getMinutes() + template.duration);

   return this.createShift({
     startTime,
     endTime,
     type: template.type,
     status: 'DRAFT',
     requiredRoles: template.requiredRoles,
     assignedStaff: [],
     breaks: [],
   });
 }

 // Utility Methods
 private static async checkSchedulingConflicts(
   staffId: string,
   startTime: Date,
   endTime: Date
 ): Promise<boolean> {
   const existingShifts = await prisma.shiftAssignment.findMany({
     where: {
       staffId,
       shift: {
         OR: [
           {
             startTime: {
               lte: startTime,
               gte: endTime,
             },
           },
           {
             endTime: {
               gte: startTime,
               lte: endTime,
             },
           },
         ],
       },
     },
   });

   return existingShifts.length > 0;
 }

 private static async calculateWeeklyHours(
   staffId: string,
   weekStart: Date,
   weekEnd: Date
 ): Promise<number> {
   const shifts = await prisma.shift.findMany({
     where: {
       assignedStaff: {
         some: {
           staffId,
         },
       },
       startTime: {
         gte: weekStart,
         lte: weekEnd,
       },
     },
   });

   return shifts.reduce((total, shift) => {
     return total + calculateShiftHours(shift.startTime, shift.endTime);
   }, 0);
 }
}
