import { Staff, StaffAssignment } from './staff';

export interface Shift {
 id: string;
 type: 'COFFEE' | 'WINE';
 startTime: string;
 endTime: string;
 status: ShiftStatus;
 notes?: string;
 assignedStaff: StaffAssignment[];
 breaks: Break[];
 createdAt: Date;
 updatedAt: Date;
}

export type ShiftStatus = 
 | 'DRAFT'
 | 'PUBLISHED'
 | 'IN_PROGRESS'
 | 'COMPLETED'
 | 'CANCELLED';

export interface Break {
 id?: string;
 shiftId: string;
 startTime: string;
 duration: number;
 createdAt?: Date;
 updatedAt?: Date;
}

export interface ShiftTemplate {
 name: string;
 type: 'COFFEE' | 'WINE';
 duration: number;
 requiredRoles: RequiredRole[];
 defaultBreaks: {
   timing: number;
   duration: number;
 }[];
}

export interface RequiredRole {
 roleId: string;
 name: string;
 requiredCertifications: string[];
 minStaffCount: number;
}
