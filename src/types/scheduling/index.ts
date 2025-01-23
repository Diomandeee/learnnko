export * from './shift';
export * from './staff';
export * from './calendar';
import { Staff } from './staff';

export interface StaffAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  roleId: string;
  status: string;
  staff?: Staff;
}

export interface DraggedShift {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'COFFEE' | 'WINE';
  assignedStaff: Array<{
    id: string;
    name: string;
  }>;
}

export interface ScheduleCell {
  date: Date;
  hour: number;
  shifts: DraggedShift[];
}

export interface ScheduleRow {
  hour: number;
  cells: ScheduleCell[];
}

export interface DragEndData {
  id: string;
  sourceCell: ScheduleCell;
  destinationCell: ScheduleCell;
  time: {
    hour: number;
    minutes: number;
  };
}

export interface Shift {
  id: string;
  type: 'COFFEE' | 'WINE';
  startTime: string | Date;
  endTime: string | Date;
  status: string;
  requiredRoles: string[];
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  assignedStaff?: StaffAssignment[];
  breaks?: Break[];
}

export interface Break {
  id: string;
  shiftId: string;
  staffId: string;
  startTime: Date;
  duration: number;
  createdAt?: Date;
  updatedAt?: Date;
}
