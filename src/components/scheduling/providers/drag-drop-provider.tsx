"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { DraggedShift, ScheduleCell } from "@/types/scheduling";
import { useToast } from "@/components/ui/use-toast";

interface DragDropContextType {
  isDragging: boolean;
  activeShift: DraggedShift | null;
  validateShiftMove: (shift: DraggedShift, cell: ScheduleCell, time: Date) => Promise<boolean>;
  moveShift: (shift: DraggedShift, cell: ScheduleCell, time: Date) => Promise<void>;
  setIsDragging: (dragging: boolean) => void;
  setActiveShift: (shift: DraggedShift | null) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeShift, setActiveShift] = useState<DraggedShift | null>(null);
  const { toast } = useToast();

  const validateShiftMove = useCallback(async (
    shift: DraggedShift, 
    cell: ScheduleCell, 
    time: Date
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shift.id}/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: time,
          endTime: new Date(time.getTime() + 
            (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime())
          ),
        }),
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, []);

  const moveShift = useCallback(async (
    shift: DraggedShift,
    cell: ScheduleCell,
    time: Date
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shift.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: time,
          endTime: new Date(time.getTime() + 
            (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime())
          ),
        }),
      });

      if (!response.ok) throw new Error('Failed to update shift position');

      const updatedShift = await response.json();
      // You might want to update local state here
      
    } catch (error) {
      console.error('Move error:', error);
      toast({
        title: "Error",
        description: "Failed to update shift position",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        activeShift,
        validateShiftMove,
        moveShift,
        setIsDragging,
        setActiveShift,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
};
