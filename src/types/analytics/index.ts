export interface StaffUtilization {
  staffId: string;
  staffName: string;
  totalHoursScheduled: number;
  totalHoursWorked: number;
  utilizationRate: number;
  overtimeHours: number;
  costPerHour: number;
  totalCost: number;
}

export interface LaborMetrics {
  totalStaffCost: number;
  averageHourlyRate: number;
  totalScheduledHours: number;
  totalWorkedHours: number;
  overtimeHours: number;
  overtimeCost: number;
}

export interface ShiftCoverage {
  totalShifts: number;
  coveredShifts: number;
  shortStaffedShifts: number;
  overStaffedShifts: number;
  coverageRate: number;
  staffingEfficiency: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters extends DateRange {
  staffIds?: string[];
  roles?: string[];
  shiftTypes?: string[];
  groupBy?: 'day' | 'week' | 'month';
}
