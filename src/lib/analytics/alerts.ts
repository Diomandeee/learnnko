import { prisma } from "@/lib/db/prisma";

export async function checkForAlerts() {
  await Promise.all([
    checkOvertimeAlerts(),
    checkStaffingAlerts(),
    checkCoverageAlerts()
  ]);
}

async function checkOvertimeAlerts() {
  const staffWithOvertime = await prisma.staff.findMany({
    include: {
      shifts: {
        where: {
          status: "COMPLETED"
        }
      }
    }
  });

  for (const staff of staffWithOvertime) {
    const totalHours = calculateTotalHours(staff.shifts);
    if (totalHours > staff.maxHoursPerWeek) {
      await createAlert({
        type: "OVERTIME",
        severity: "HIGH",
        message: `${staff.name} has exceeded their maximum weekly hours (${totalHours}/${staff.maxHoursPerWeek})`,
        metadata: {
          staffId: staff.id,
          currentHours: totalHours,
          maxHours: staff.maxHoursPerWeek
        }
      });
    }
  }
}

async function checkStaffingAlerts() {
  const upcomingShifts = await prisma.shift.findMany({
    where: {
      startTime: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    },
    include: {
      assignedStaff: true
    }
  });

  for (const shift of upcomingShifts) {
    const requiredRoles = shift.requiredRoles as Record<string, number>;
    const totalRequired = Object.values(requiredRoles).reduce((sum, count) => sum + count, 0);
    
    if (shift.assignedStaff.length < totalRequired) {
      await createAlert({
        type: "UNDERSTAFFED_SHIFT",
        severity: "HIGH",
        message: `Shift on ${shift.startTime.toLocaleDateString()} is understaffed`,
        metadata: {
          shiftId: shift.id,
          required: totalRequired,
          assigned: shift.assignedStaff.length
        }
      });
    }
  }
}

async function checkCoverageAlerts() {
  // Check coverage for next 14 days
  const startDate = new Date();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  const coverage = await calculateShiftCoverage({ startDate, endDate });
  
  if (coverage.coverageRate < 90) {
    await createAlert({
      type: "LOW_COVERAGE",
      severity: "MEDIUM",
      message: `Low shift coverage (${coverage.coverageRate.toFixed(1)}%) for upcoming period`,
      metadata: coverage
    });
  }
}

async function createAlert(alertData: {
  type: string;
  severity: string;
  message: string;
  metadata?: any;
}) {
  await prisma.alert.create({
    data: alertData
  });
}

function calculateTotalHours(assignments: any[]): number {
  return assignments.reduce((total, assignment) => {
    const shiftDuration = (assignment.shift.endTime.getTime() - assignment.shift.startTime.getTime()) / (1000 * 60 * 60);
    return total + shiftDuration;
  }, 0);
}
