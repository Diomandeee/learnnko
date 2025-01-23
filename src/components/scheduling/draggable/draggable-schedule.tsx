"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function DraggableSchedule() {
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

 const handleDragStart = (event: DragStartEvent) => {
   setActiveId(event.active.id as string);
 };

 const handleDragEnd = (event: DragEndEvent) => {
   const { active, over } = event;
   
   if (over && active.id !== over.id) {
     setShifts((shifts) => {
       const oldIndex = shifts.findIndex((shift) => shift.id === active.id);
       const newIndex = shifts.findIndex((shift) => shift.id === over.id);
       
       return arrayMove(shifts, oldIndex, newIndex);
     });
   }
   
   setActiveId(null);
 };

 const handleDragOver = (event: DragOverEvent) => {
   const { active, over, draggingRect } = event;
   
   if (over && containerRef.current && draggingRect) {
     const position = getGridPosition(draggingRect.top);
     
     if (position) {
       // Update shift time based on grid position
       setShifts((currentShifts) => 
         currentShifts.map((shift) => 
           shift.id === active.id 
             ? { ...shift, hour: position.hour, minutes: position.minutes }
             : shift
         )
       );
     }
   }
 };

 const renderHourCells = () => {
   return HOURS.map((hour) => (
     <div 
       key={hour} 
       className="border-b border-gray-200 h-[60px] relative"
     >
       <span className="absolute left-2 top-1 text-sm text-gray-500">
         {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
       </span>
     </div>
   ));
 };

 const renderShifts = () => {
   return shifts.map((shift) => (
     <div 
       key={shift.id}
       className="absolute w-full bg-blue-500 text-white p-2 rounded"
       style={{
         top: `${(shift.hour - 6) * CELL_HEIGHT}px`,
         height: `${CELL_HEIGHT}px`
       }}
     >
       {shift.name}
     </div>
   ));
 };

 return (
   <DndContext
     sensors={sensors}
     onDragStart={handleDragStart}
     onDragEnd={handleDragEnd}
     onDragOver={handleDragOver}
     modifiers={[restrictToVerticalAxis]}
   >
     <Card className="p-4">
       <div 
         ref={containerRef}
         className="relative h-[1140px] overflow-hidden"
       >
         {renderHourCells()}
         <SortableContext items={shifts.map((shift) => shift.id)}>
           {renderShifts()}
         </SortableContext>
       </div>
     </Card>
   </DndContext>
 );
}