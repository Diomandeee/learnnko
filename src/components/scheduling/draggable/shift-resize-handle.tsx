"use client";

import { useState, useRef } from "react";
import { GripVertical } from "lucide-react";

interface ShiftResizeHandleProps {
  onResize: (delta: number) => void;
  onResizeEnd: () => void;
}

export function ShiftResizeHandle({ onResize, onResizeEnd }: ShiftResizeHandleProps) {
  const [resizing, setResizing] = useState(false);
  const startYRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    startYRef.current = e.clientY;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const delta = e.clientY - startYRef.current;
    onResize(delta);
    startYRef.current = e.clientY;
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    onResizeEnd();
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center ${
        resizing ? 'bg-primary/20' : 'hover:bg-primary/10'
      }`}
      onMouseDown={handleMouseDown}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}
