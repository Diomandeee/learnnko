import { create } from 'zustand';
import { Shift } from '@/types/scheduling/shift';

interface ShiftStore {
 shifts: Shift[];
 selectedShift: Shift | null;
 loading: boolean;
 error: string | null;
 draggingShift: {
   shift: Shift;
   type: 'move' | 'resize';
 } | null;
 
 // Actions
 setShifts: (shifts: Shift[]) => void;
 selectShift: (shift: Shift | null) => void;
 setLoading: (loading: boolean) => void;
 setError: (error: string | null) => void;
 setDraggingShift: (dragging: { shift: Shift; type: 'move' | 'resize' } | null) => void;
 
 // Async actions
 fetchShifts: (startDate: Date, endDate: Date) => Promise<void>;
 createShift: (shiftData: Partial<Shift>) => Promise<void>;
 updateShift: (id: string, shiftData: Partial<Shift>) => Promise<void>;
 deleteShift: (id: string) => Promise<void>;
 assignStaff: (shiftId: string, staffId: string) => Promise<void>;
 removeStaffAssignment: (shiftId: string, staffId: string) => Promise<void>;
}

export const useShiftStore = create<ShiftStore>((set) => ({
 shifts: [],
 selectedShift: null,
 loading: false,
 error: null,
 draggingShift: null,

 setShifts: (shifts) => set({ shifts }),
 selectShift: (shift) => set({ selectedShift: shift }),
 setLoading: (loading) => set({ loading }),
 setError: (error) => set({ error }),
 setDraggingShift: (dragging) => set({ draggingShift: dragging }),

 fetchShifts: async (startDate: Date, endDate: Date) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
     );
     
     if (!response.ok) throw new Error('Failed to fetch shifts');
     
     const shifts = await response.json();
     set({ shifts, loading: false });
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to fetch shifts',
       loading: false 
     });
   }
 },

 createShift: async (shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch('/api/scheduling/shifts', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to create shift');
     
     const newShift = await response.json();
     set((state) => ({ 
       shifts: [...state.shifts, newShift],
       loading: false 
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to create shift',
       loading: false 
     });
   }
 },

 updateShift: async (id, shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to update shift');
     
     const updatedShift = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => s.id === id ? updatedShift : s),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to update shift',
       loading: false 
     });
   }
 },

 deleteShift: async (id) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'DELETE',
     });
     
     if (!response.ok) throw new Error('Failed to delete shift');
     
     set((state) => ({
       shifts: state.shifts.filter((s) => s.id !== id),
       selectedShift: null,
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to delete shift',
       loading: false 
     });
   }
 },

 assignStaff: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${shiftId}/assignments`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ staffId }),
     });
     
     if (!response.ok) throw new Error('Failed to assign staff');
     
     const assignment = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: [...s.assignedStaff, assignment]
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to assign staff',
       loading: false 
     });
   }
 },

 removeStaffAssignment: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts/${shiftId}/assignments?staffId=${staffId}`,
       { method: 'DELETE' }
     );
     
     if (!response.ok) throw new Error('Failed to remove staff assignment');
     
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: s.assignedStaff.filter(
               (a) => a.staffId !== staffId
             )
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to remove staff assignment',
       loading: false 
     });
   }
 }
}));
