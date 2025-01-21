"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DraggableShiftProps {
  id: string;
  shift: any;
  index: number;
}

export function DraggableShift({ id, shift, index }: DraggableShiftProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'absolute' as const,
    top: `${index * 60}px`,
    left: 0,
    right: 0,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-2"
    >
      <Card className="p-2 cursor-move bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <Badge variant={shift.type === 'COFFEE' ? 'default' : 'secondary'}>
            {shift.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(shift.startTime), "h:mm a")}
          </span>
        </div>
        <div className="mt-1 text-sm">
          {shift.assignedStaff?.length || 0} staff assigned
        </div>
      </Card>
    </div>
  );
}
