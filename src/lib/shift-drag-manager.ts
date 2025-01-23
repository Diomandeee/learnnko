import type { Shift } from '@/types/scheduling';

const MINUTES_SNAP = 15;
const CELL_HEIGHT = 80;

interface DragState {
 shift: Shift;
 type: 'move' | 'resize';
 initialY: number;
 shiftStartY: number;
 shiftHeight: number;
}

export class ShiftDragManager {
 private dragState: DragState | null = null;
 private calendarElement: HTMLElement | null = null;
 
 constructor(calendarElement: HTMLElement) {
   this.calendarElement = calendarElement;
 }

 startDrag(state: DragState) {
   this.dragState = state;
 }

 handleDrag(clientY: number): {top?: number; height?: number} | null {
   if (!this.dragState || !this.calendarElement) return null;

   const rect = this.calendarElement.getBoundingClientRect();
   const deltaY = clientY - this.dragState.initialY;
   
   if (this.dragState.type === 'move') {
     let newTop = this.dragState.shiftStartY + deltaY - rect.top;
     newTop = this.snapToGrid(newTop);
     return { top: newTop };
   } else {
     let newHeight = Math.max(CELL_HEIGHT/2, this.dragState.shiftHeight + deltaY);
     newHeight = this.snapToGrid(newHeight);
     return { height: newHeight };
   }
 }

 endDrag(): {startTime?: Date; endTime?: Date} | null {
   if (!this.dragState || !this.calendarElement) return null;

   const shiftElement = document.getElementById(`shift-${this.dragState.shift.id}`);
   if (!shiftElement) return null;

   const rect = shiftElement.getBoundingClientRect();
   const calendarRect = this.calendarElement.getBoundingClientRect();

   const startHour = 6 + (rect.top - calendarRect.top) / CELL_HEIGHT;
   const endHour = startHour + rect.height / CELL_HEIGHT;

   const shiftDate = new Date(this.dragState.shift.startTime);
   
   const startTime = new Date(shiftDate);
   startTime.setHours(
     Math.floor(startHour),
     Math.round((startHour % 1) * 60),
     0
   );

   const endTime = new Date(shiftDate);
   endTime.setHours(
     Math.floor(endHour),
     Math.round((endHour % 1) * 60),
     0
   );

   this.dragState = null;
   return { startTime, endTime };
 }

 private snapToGrid(value: number): number {
   const snapInterval = CELL_HEIGHT / (60 / MINUTES_SNAP);
   return Math.round(value / snapInterval) * snapInterval;
 }
}
