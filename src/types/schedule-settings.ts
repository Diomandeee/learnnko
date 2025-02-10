export interface ScheduleSettings {
  startTime: string;
  endTime: string;
  visitDuration: number;
  priorityVisitDuration: number;
  maxTravelTime: number;
  prioritizeClusters: boolean;
  balanceWeekly: boolean;
  includeNearby: boolean;
  nearbyRadius: number;
  maxVisitsPerDay: number;
  minVisitsPerLocation: number;
  breakDuration: number;
  preferredDays: number[];
}

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  startTime: "09:00",
  endTime: "17:00",
  visitDuration: 30,
  priorityVisitDuration: 45,
  maxTravelTime: 30,
  prioritizeClusters: true,
  balanceWeekly: true,
  includeNearby: true,
  nearbyRadius: 2,
  maxVisitsPerDay: 8,
  minVisitsPerLocation: 1,
  breakDuration: 15,
  preferredDays: [1, 2, 3, 4, 5]
}
