export function detectCollision(shift1: any, shift2: any): boolean {
  const start1 = new Date(shift1.startTime);
  const end1 = new Date(shift1.endTime);
  const start2 = new Date(shift2.startTime);
  const end2 = new Date(shift2.endTime);

  return start1 < end2 && start2 < end1;
}

export function getStackPosition(shift: any, shifts: any[]): number {
  let stack = 0;
  const overlapping = shifts.filter(s => detectCollision(shift, s));
  
  while (overlapping.some(s => s.stack === stack)) {
    stack++;
  }
  
  return stack;
}

export function calculateStackWidth(totalStacks: number): string {
  const minWidth = 150; // minimum width in pixels
  return `min(${100 / totalStacks}%, ${minWidth}px)`;
}
