export interface Staff {
 id: string;
 name: string;
 email: string;
 role: 'BARISTA' | 'SOMMELIER' | 'MANAGER' | 'EXECUTIVE';
 certifications: Certification[];
 availability: Availability[];
 createdAt: Date;
 updatedAt: Date;
 hourlyRate: number;
 maxHoursPerWeek: number;
}

export interface Certification {
 id: string;
 name: string;
 staffId: string;
}

export interface Availability {
 id: string;
 dayOfWeek: number;
 startTime: string;
 endTime: string;
 recurring: boolean;
 staffId: string;
}

export interface StaffAssignment {
 id: string;
 shiftId: string;
 staffId: string;
 role: string;
 staff: Staff;
 status: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'NO_SHOW';
}
