"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/use-toast";

const CELL_HEIGHT = 60;
const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to 12 AM

export function DraggableSchedule() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, [weekStart]);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/scheduling/shifts');
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
        variant: "destructive",
      });
    }
  };

  const getGridPosition = (clientY: number) => {
    if (!containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - containerRect.top;
    const hour = Math.floor(relativeY / CELL_HEIGHT) + 6; // Add 6 to account for starting at 6 AM
    
    return {
      hour,
      minutes: Math.round((relativeY % CELL_HEIGHT) / CELL_HEIGHT * 60),
    };
  };

