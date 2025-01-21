import { prisma } from "@/lib/db/prisma";
import { checkForAlerts } from "./alerts";
import { calculateStaffUtilization, calculateLaborMetrics, calculateShiftCoverage } from "./calculations";

export async function runScheduledTasks() {
  // Run alert checks
  await checkForAlerts();

  // Run scheduled reports
  const scheduledReports = await prisma.report.findMany({
    where: {
      schedule: { not: null }
    }
  });

  for (const report of scheduledReports) {
    try {
      const now = new Date();
      const schedule = report.schedule as any;

      // Check if report should run based on schedule
      if (shouldRunReport(schedule, now)) {
        await generateScheduledReport(report);
        
        // Update last run time
        await prisma.report.update({
          where: { id: report.id },
          data: { lastRun: now }
        });
      }
    } catch (error) {
      console.error(`Error running scheduled report ${report.id}:`, error);
    }
  }
}

function shouldRunReport(schedule: any, now: Date): boolean {
  const { frequency, dayOfWeek, dayOfMonth, hour } = schedule;

  switch (frequency) {
    case 'daily':
      return now.getHours() === hour;
      
    case 'weekly':
      return now.getDay() === dayOfWeek && now.getHours() === hour;
      
    case 'monthly':
      return now.getDate() === dayOfMonth && now.getHours() === hour;
      
    default:
      return false;
  }
}

async function generateScheduledReport(report: any) {
  const { type, filters } = report;
  const { startDate, endDate } = getDateRangeFromFilters(filters);

  let data;
  switch (type) {
    case 'utilization':
      data = await calculateStaffUtilization({ startDate, endDate });
      break;
    case 'labor':
      data = await calculateLaborMetrics({ startDate, endDate });
      break;
    case 'coverage':
      data = await calculateShiftCoverage({ startDate, endDate });
      break;
  }

  // Save snapshot
  await prisma.analyticsSnapshot.create({
    data: {
      date: new Date(),
      type: report.type,
      metrics: data,
      filters: report.filters
    }
  });
}

function getDateRangeFromFilters(filters: any) {
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);

  switch (filters.range) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - now.getDay());
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'month':
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1, 0);
      break;
    case 'custom':
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
      break;
  }

  return { startDate, endDate };
}
