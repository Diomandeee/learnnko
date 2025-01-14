import { ShiftType, ShiftStatus, AssignmentStatus } from "@prisma/client";

export interface Shift {
  id: string;
  startTime: Date;
  endTime: Date;
  type: ShiftType;
  status: ShiftStatus;
  requiredRoles: RequiredRole[];
  assignedStaff: StaffAssignment[];
  breaks: Break[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequiredRole {
  roleId: string;
  name: string;
  requiredCertifications: string[];
  minStaffCount: number;
}

export interface Break {
  id: string;
  shiftId: string;
  staffId: string;
  startTime: Date;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  roleId: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftTemplate {
  name: string;
  type: ShiftType;
  duration: number; // in minutes
  requiredRoles: RequiredRole[];
  defaultBreaks: {
    timing: number; // minutes from shift start
    duration: number; // in minutes
  }[];
}
