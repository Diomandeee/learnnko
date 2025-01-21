export interface ShiftAnalytics {
 totalShifts: number;
 totalHours: number;
 totalStaff: number;
 totalCost: number;
 averageShiftLength: number;
 staffingEfficiency: number;
 warnings: string[];
}

export interface DailyAnalytics {
 date: Date;
 shifts: number;
 hours: number;
 staff: number;
 cost: number;
 efficiency: number;
}

export interface StaffMetrics {
 id: string;
 name: string;
 totalHours: number;
 totalShifts: number;
 utilization: number;
 cost: number;
}
