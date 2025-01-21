import type { Shift } from '@/types/scheduling';

export interface DragState {
 shift: Shift;
 type: 'move' | 'resize';
 initialY: number;
 shiftStartY: number;
 shiftHeight: number;
}

export function createDragHandlers(
 calendarRef: React.RefObject<HTMLDivElement>,
 onShiftUpdate: (shift: Shift) => Promise<void>,
 onError: (error: Error) => void
) {
 const handleMouseDown = (
   shift: Shift,
   type: 'move' | 'resize',
   e: React.MouseEvent,
   setDragState: (state: DragState | null) => void
 ) => {
   e.stopPropagation();
   const shiftElement = e.currentTarget.parentElement;
   if (!shiftElement) return;

   const rect = shiftElement.getBoundingClientRect();
   setDragState({
     shift,
     type,
     initialY: e.clientY,
     shiftStartY: rect.top,
     shiftHeight: rect.height,
   });
 };

 const handleMouseMove = (
   e: MouseEvent,
   dragState: DragState | null,
   CELL_HEIGHT: number
 ) => {
   if (!dragState || !calendarRef.current) return;

   const calendarRect = calendarRef.current.getBoundingClientRect();
   const deltaY = e.clientY - dragState.initialY;
   const newY = Math.max(0, dragState.shiftStartY + deltaY - calendarRect.top);

   const snapToGrid = (y: number) => Math.round(y / (CELL_HEIGHT / 4)) * (CELL_HEIGHT / 4);
   const snappedY = snapToGrid(newY);

   const shiftElement = document.getElementById(`shift-${dragState.shift.id}`);
   if (shiftElement) {
     if (dragState.type === 'move') {
       shiftElement.style.top = `${snappedY}px`;
     } else if (dragState.type === 'resize') {
       const newHeight = Math.max(CELL_HEIGHT/2, dragState.shiftHeight + deltaY);
       shiftElement.style.height = `${snapToGrid(newHeight)}px`;
     }
   }
 };

 const handleMouseUp = async (
   dragState: DragState | null,
   CELL_HEIGHT: number
 ) => {
   if (!dragState || !calendarRef.current) return null;

   try {
     const shiftElement = document.getElementById(`shift-${dragState.shift.id}`);
     if (!shiftElement) return null;

     const rect = shiftElement.getBoundingClientRect();
     const calendarRect = calendarRef.current.getBoundingClientRect();
     
     const startHour = 6 + (rect.top - calendarRect.top) / CELL_HEIGHT;
     const endHour = startHour + rect.height / CELL_HEIGHT;

     const shiftDate = new Date(dragState.shift.startTime);
     
     const newStartTime = new Date(shiftDate);
     newStartTime.setHours(
       Math.floor(startHour),
       Math.round((startHour % 1) * 60),
       0
     );

     const newEndTime = new Date(shiftDate);
     newEndTime.setHours(
       Math.floor(endHour),
       Math.round((endHour % 1) * 60),
       0
     );

     await onShiftUpdate({
       ...dragState.shift,
       startTime: newStartTime.toISOString(),
       endTime: newEndTime.toISOString(),
     });

     return { startTime: newStartTime, endTime: newEndTime };
   } catch (error) {
     onError(error instanceof Error ? error : new Error('Failed to update shift'));
     return null;
   }
 };

 return {
   handleMouseDown,
   handleMouseMove,
   handleMouseUp
 };
}

export function createTimeSlotHandler(
 onTimeSlotClick: (date: Date, hour: number) => void
) {
 return (date: Date, hour: number) => {
   onTimeSlotClick(date, hour);
 };
}

export function createShiftClickHandler(
 onShiftClick: (shift: Shift, e: React.MouseEvent) => void
) {
 return (shift: Shift, e: React.MouseEvent) => {
   e.stopPropagation();
   onShiftClick(shift, e);
 };
}
