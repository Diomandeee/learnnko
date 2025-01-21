import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { DraggedShift, ScheduleCell } from "@/types/scheduling";
import { 
  validateShiftMove, 
  calculateNewShiftTimes,
  getTimeFromPosition 
} from "./utils";

export function handleDragStart(
  event: DragStartEvent,
  setActiveId: (id: string | null) => void
) {
  setActiveId(event.active.id.toString());
}

export function handleDragOver(
  event: DragOverEvent,
  shifts: DraggedShift[],
  setShifts: (shifts: DraggedShift[]) => void
) {
  const { active, over } = event;
  
  if (!over) return;
  
  const activeShift = shifts.find(s => s.id === active.id);
  const overCell = over.data.current?.cell as ScheduleCell;
  
  if (!activeShift || !overCell) return;
  
  // Calculate new position
  const containerRect = over.rect;
  const mouseY = event.activatorEvent.clientY;
  
  const dropTime = getTimeFromPosition(
    containerRect.top,
    mouseY,
    overCell.date
  );
  
  // Validate move
  if (!validateShiftMove(activeShift, overCell, dropTime)) return;
  
  // Calculate new times
  const { startTime, endTime } = calculateNewShiftTimes(
    activeShift,
    overCell,
    dropTime
  );
  
  // Update shift position
  const updatedShifts = shifts.map(shift =>
    shift.id === activeShift.id
      ? { ...shift, startTime, endTime }
      : shift
  );
  
  setShifts(updatedShifts);
}

export function handleDragEnd(
  event: DragEndEvent,
  shifts: DraggedShift[],
  setShifts: (shifts: DraggedShift[]) => void,
  setActiveId: (id: string | null) => void
) {
  const { active, over } = event;
  
  setActiveId(null);
  
  if (!over) return;
  
  const activeShift = shifts.find(s => s.id === active.id);
  const overCell = over.data.current?.cell as ScheduleCell;
  
  if (!activeShift || !overCell) return;
  
  // Save the final position
  // This would typically involve an API call
  console.log('Shift moved:', {
    shiftId: activeShift.id,
    newStartTime: activeShift.startTime,
    newEndTime: activeShift.endTime,
  });
}
