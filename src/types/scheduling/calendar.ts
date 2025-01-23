import { Shift } from './shift';

export interface ShiftStack {
  shifts: Shift[];
  width: number;
  left: number;
}

export interface TimeSlot {
  date: Date;
  hour: number;
}

export interface ShiftPosition {
  top: string;
  height: string;
  left: string;
  width: string;
}
