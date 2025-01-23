// type SchedulingAction = {
//   type: 'MOVE_SHIFT' | 'RESIZE_SHIFT' | 'ASSIGN_STAFF' | 'REMOVE_STAFF';
//   shiftId: string;
//   previousState: any;
//   newState: any;
//   timestamp: number;
// };

// class SchedulingHistory {
//   private undoStack: SchedulingAction[] = [];
//   private redoStack: SchedulingAction[] = [];
//   private maxSize: number = 50;

//   addAction(action: SchedulingAction) {
//     this.undoStack.push(action);
//     this.redoStack = []; // Clear redo stack when new action is added

//     // Maintain stack size
//     if (this.undoStack.length > this.maxSize) {
//       this.undoStack.shift();
//     }
//   }

//   async undo(): Promise<SchedulingAction | null> {
//     const action = this.undoStack.pop();
//     if (!action) return null;

//     try {
//       // Restore previous state
//       await this.applyState(action.shiftId, action.previousState);
//       this.redoStack.push(action);
//       return action;
//     } catch (error) {
//       console.error('Undo error:', error);
//       // Revert the pop if the operation failed
//       this.undoStack.push(action);
//       throw error;
//     }
//   }

//   async redo(): Promise<SchedulingAction | null> {
//     const action = this.redoStack.pop();
//     if (!action) return null;

//     try {
//       // Apply the new state
//       await this.applyState(action.shiftId, action.newState);
//       this.undoStack.push(action);
//       return action;
//     } catch (error) {
//       console.error('Redo error:', error);
//       // Revert the pop if the operation failed
//       this.redoStack.push(action);
//       throw error;
//     }
//   }

//   private async applyState(shiftId: string, state: any): Promise<void> {
//     const response = await fetch(`/api/scheduling/shifts/${shiftId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(state)
//     });

//     if (!response.ok) {
//       throw new Error('Failed to apply state');
//     }
//   }

//   canUndo(): boolean {
//     return this.undoStack.length > 0;
//   }

//   canRedo(): boolean {
//     return this.redoStack.length > 0;
//   }
// }

// export const schedulingHistory = new SchedulingHistory();
