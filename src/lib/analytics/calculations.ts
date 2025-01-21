import { StaffUtilization, LaborMetrics, ShiftCoverage, DateRange } from "@/types/analytics";
import { prisma } from "@/lib/db/prisma";

export async function calculateStaffUtilization(
  dateRange: DateRange,
  staffIds?: string[]
): Promise<StaffUtilization[]> {
  const { startDate, endDate } = dateRange;
  
  const shifts = await prisma.shift.findMany({
    where: {
      startTime: { gte: startDate },
      endTime: { lte: endDate },
      assignedStaff: staffIds ? {
        some: {
          staffId: { in: staffIds }
        }
      } : undefined
    },
    include: {
      assignedStaff: {
        include: {
          staff: true
        }
      }
    }
  });

  // Calculate metrics for each staff member
  const staffMetrics = new Map<string, StaffUtilization>();

  shifts.forEach(shift => {
    const shiftDuration = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
    
    shift.assignedStaff.forEach(assignment => {
      const { staff } = assignment;
      const existing = staffMetrics.get(staff.id) || {
        staffId: staff.id,
        staffName: staff.name,
        totalHoursScheduled: 0,
        totalHoursWorked: 0,
        utilizationRate: 0,
        overtimeHours: 0,
        costPerHour: staff.hourlyRate,
        totalCost: 0
      };

      existing.totalHoursScheduled += shiftDuration;
      
      // Calculate overtime
      const weeklyHours = existing.totalHoursScheduled;
      if (weeklyHours > 40) {
        existing.overtimeHours += shiftDuration;
      }

      // Update total cost including overtime
      const regularHours = Math.min(weeklyHours, 40);
      const overtimeRate = staff.hourlyRate * 1.5;
      existing.totalCost = (regularHours * staff.hourlyRate) + (existing.overtimeHours * overtimeRate);

      staffMetrics.set(staff.id, existing);
    });
  });

  // Calculate utilization rates
  return Array.from(staffMetrics.values()).map(metric => ({
    ...metric,
    utilizationRate: (metric.totalHoursWorked / metric.totalHoursScheduled) * 100
  }));
}

export async function calculateLaborMetrics(dateRange: DateRange): Promise<LaborMetrics> {
  const utilization = await calculateStaffUtilization(dateRange);
  
  return {
    totalStaffCost: utilization.reduce((sum, staff) => sum + staff.totalCost, 0),
    averageHourlyRate: utilization.reduce((sum, staff) => sum + staff.costPerHour, 0) / utilization.length,
    totalScheduledHours: utilization.reduce((sum, staff) => sum + staff.totalHoursScheduled, 0),
    totalWorkedHours: utilization.reduce((sum, staff) => sum + staff.totalHoursWorked, 0),
    overtimeHours: utilization.reduce((sum, staff) => sum + staff.overtimeHours, 0),
    overtimeCost: utilization.reduce((sum, staff) => sum + (staff.overtimeHours * staff.costPerHour * 1.5), 0)
  };
}

export async function calculateShiftCoverage(dateRange: DateRange): Promise<ShiftCoverage> {
  const shifts = await prisma.shift.findMany({
    where: {
      startTime: { gte: dateRange.startDate },
      endTime: { lte: dateRange.endDate }
    },
    include: {
      assignedStaff: true
    }
  });

  let totalShifts = shifts.length;
  let shortStaffedShifts = 0;
  let overStaffedShifts = 0;
  let coveredShifts = 0;

  shifts.forEach(shift => {
    const requiredRoles = shift.requiredRoles as Record<string, number>;
    const staffCount = shift.assignedStaff.length;
    const requiredCount = Object.values(requiredRoles).reduce((sum, count) => sum + count, 0);

    if (staffCount < requiredCount) {
      shortStaffedShifts++;
    } else if (staffCount > requiredCount) {
      overStaffedShifts++;
    } else {
      coveredShifts++;
    }
  });

  return {
    totalShifts,
    coveredShifts,
    shortStaffedShifts,
    overStaffedShifts,
    coverageRate: (coveredShifts / totalShifts) * 100,
    staffingEfficiency: ((coveredShifts + (0.5 * overStaffedShifts)) / totalShifts) * 100
  };
}
