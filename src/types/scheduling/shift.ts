import { ShiftType, ShiftStatus } from "@prisma/client";

export interface Shift {
  id: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  notes?: string;
  requiredRoles: any;
  assignedStaff: ShiftAssignment[];
  breaks: Break[];
  createdAt: string;
  updatedAt: string;
  stack?: number;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  status: string;
  staff: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Break {
  id: string;
  startTime: string;
  duration: number;
}
