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
