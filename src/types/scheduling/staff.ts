import { StaffRole } from "@prisma/client";

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  certifications: string[];
  maxHoursPerWeek: number;
  hourlyRate: number;
  availability: Availability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffSchedule {
  staff: Staff;
  weeklyHours: number;
  assignments: {
    date: Date;
    shifts: {
      id: string;
      type: string;
      startTime: Date;
      endTime: Date;
      role: string;
    }[];
  }[];
}
