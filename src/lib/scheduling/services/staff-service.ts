import { prisma } from "@/lib/db/prisma";
import { Staff, Availability, StaffSchedule } from "@/types/scheduling/staff";
import { StaffRole } from "@prisma/client";
import { calculateShiftHours } from "../utils/schedule-utils";

export class StaffService {
 // Staff Operations
 static async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
   return prisma.staff.create({
     data: staffData,
     include: {
       availability: true,
     },
   });
 }

 static async updateStaff(
   id: string,
   staffData: Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>
 ): Promise<Staff> {
   return prisma.staff.update({
     where: { id },
     data: staffData,
     include: {
       availability: true,
     },
   });
 }

 static async getStaffByRole(role: StaffRole): Promise<Staff[]> {
   return prisma.staff.findMany({
     where: { role },
     include: {
       availability: true,
     },
   });
 }

 static async getStaffWithCertifications(certifications: string[]): Promise<Staff[]> {
   return prisma.staff.findMany({
     where: {
       certifications: {
         hasEvery: certifications,
       },
     },
     include: {
       availability: true,
     },
   });
 }

 // Availability Management
 static async setAvailability(
   staffId: string,
   availabilityData: Omit<Availability, 'id' | 'staffId' | 'createdAt' | 'updatedAt'>[]
 ): Promise<Availability[]> {
   // Remove existing availability
   await prisma.availability.deleteMany({
     where: { staffId },
   });

   // Create new availability entries
   const availability = await Promise.all(
     availabilityData.map(data =>
       prisma.availability.create({
         data: {
           ...data,
           staffId,
         },
       })
     )
   );

   return availability;
 }

 static async getStaffSchedule(
   staffId: string,
   startDate: Date,
   endDate: Date
 ): Promise<StaffSchedule> {
   const staff = await prisma.staff.findUnique({
     where: { id: staffId },
     include: {
       availability: true,
     },
   });

   if (!staff) {
     throw new Error('Staff member not found');
   }

   const assignments = await prisma.shiftAssignment.findMany({
     where: {
       staffId,
       shift: {
         startTime: {
           gte: startDate,
           lte: endDate,
         },
       },
     },
     include: {
       shift: true,
     },
     orderBy: {
       shift: {
         startTime: 'asc',
       },
     },
   });

   // Calculate weekly hours
   const weeklyHours = assignments.reduce((total, assignment) => {
     return total + calculateShiftHours(
       assignment.shift.startTime,
       assignment.shift.endTime
     );
   }, 0);

   // Group assignments by date
   const groupedAssignments = assignments.reduce((acc, assignment) => {
     const date = new Date(assignment.shift.startTime);
     date.setHours(0, 0, 0, 0);
     
     const dateString = date.toISOString();
     
     if (!acc[dateString]) {
       acc[dateString] = {
         date,
         shifts: [],
       };
     }

     acc[dateString].shifts.push({
       id: assignment.shift.id,
       type: assignment.shift.type,
       startTime: assignment.shift.startTime,
       endTime: assignment.shift.endTime,
       role: assignment.roleId,
     });

     return acc;
   }, {} as Record<string, StaffSchedule['assignments'][0]>);

   return {
     staff,
     weeklyHours,
     assignments: Object.values(groupedAssignments),
   };
 }

 // Utility Methods
 static async getAvailableStaffForShift(
   startTime: Date,
   endTime: Date,
   requiredRole: StaffRole,
   requiredCertifications: string[] = []
 ): Promise<Staff[]> {
   const dayOfWeek = startTime.getDay();
   const timeStart = startTime.toLocaleTimeString('en-US', { 
     hour12: false,
     hour: '2-digit',
     minute: '2-digit'
   });
   const timeEnd = endTime.toLocaleTimeString('en-US', { 
     hour12: false,
     hour: '2-digit',
     minute: '2-digit'
   });

   return prisma.staff.findMany({
     where: {
       role: requiredRole,
       certifications: {
         hasEvery: requiredCertifications,
       },
       availability: {
         some: {
           dayOfWeek,
           startTime: {
             lte: timeStart,
           },
           endTime: {
             gte: timeEnd,
           },
         },
       },
       NOT: {
         shifts: {
           some: {
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
         },
       },
     },
     include: {
       availability: true,
     },
   });
 }
}
