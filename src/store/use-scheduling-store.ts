import { create } from 'zustand';
import { Shift, Staff, ShiftTemplate } from '@/types/scheduling';
import { ShiftType, StaffRole } from '@prisma/client';

interface DateRange {
  from: Date;
  to: Date;
}

interface SchedulingState {
  // Data
  shifts: Shift[];
  staff: Staff[];
  templates: ShiftTemplate[];
  
  // UI State
  selectedDate: Date;
  dateRange: DateRange;
  selectedShift: string | null;
  selectedStaff: string | null;
  
  // Filters
  filter: {
    shiftType: ShiftType | 'ALL';
    staffRole: StaffRole | null;
    certifications: string[];
    dateRange: DateRange | null;
  };

  // Loading States
  isLoading: {
    shifts: boolean;
    staff: boolean;
    templates: boolean;
  };

  // Actions
  setShifts: (shifts: Shift[]) => void;
  setStaff: (staff: Staff[]) => void;
  setTemplates: (templates: ShiftTemplate[]) => void;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedShift: (shiftId: string | null) => void;
  setSelectedStaff: (staffId: string | null) => void;
  setFilter: (filter: Partial<SchedulingState['filter']>) => void;
  setLoading: (key: keyof SchedulingState['isLoading'], value: boolean) => void;
}

export const useSchedulingStore = create<SchedulingState>((set) => ({
  // Initial Data
  shifts: [],
  staff: [],
  templates: [],

  // Initial UI State
  selectedDate: new Date(),
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  },
  selectedShift: null,
  selectedStaff: null,

  // Initial Filters
  filter: {
    shiftType: 'ALL',
    staffRole: null,
    certifications: [],
    dateRange: null,
  },

  // Initial Loading States
  isLoading: {
    shifts: false,
    staff: false,
    templates: false,
  },

  // Actions
  setShifts: (shifts) => set({ shifts }),
  setStaff: (staff) => set({ staff }),
  setTemplates: (templates) => set({ templates }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedShift: (selectedShift) => set({ selectedShift }),
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  setLoading: (key, value) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
}));

// Selectors
export const useSelectedShift = () => useSchedulingStore(
  (state) => state.shifts.find(s => s.id === state.selectedShift)
);

export const useFilteredShifts = () => useSchedulingStore((state) => {
  const { shifts, filter } = state;
  return shifts.filter(shift => {
    if (filter.shiftType !== 'ALL' && shift.type !== filter.shiftType) return false;
    if (filter.dateRange) {
      const shiftDate = new Date(shift.startTime);
      if (shiftDate < filter.dateRange.from || shiftDate > filter.dateRange.to) return false;
    }
    return true;
  });
});

export const useFilteredStaff = () => useSchedulingStore((state) => {
  const { staff, filter } = state;
  return staff.filter(s => {
    if (filter.staffRole && s.role !== filter.staffRole) return false;
    if (filter.certifications.length > 0) {
      return filter.certifications.every(cert => s.certifications.includes(cert));
    }
    return true;
  });
});
