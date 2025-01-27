// src/components/routes/list/route-list.tsx
"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouteStore } from "@/store/route-store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  GripVertical,
  MapPin,
  Building2,
  Users,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";

export function RouteList() {
  const {
    currentRoute,
    updateRoute,
    removeLocation,
    isNavigating,
    currentStep,
  } = useRouteStore();

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(currentRoute);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateRoute(items);
  }, [currentRoute, updateRoute]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Stops</CardTitle>
          <Badge variant="secondary">
            {currentRoute.length} stops
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="route-stops">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {currentRoute.map((location, index) => (
                    <Draggable
                      key={location.id}
                      draggableId={location.id}
                      index={index}
                      isDragDisabled={isNavigating}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 rounded-lg border ${
                            snapshot.isDragging ? "border-primary" : "border-border"
                          } ${
                            isNavigating && index === currentStep 
                              ? "bg-primary/10 border-primary" 
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1.5 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {location.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {location.address}
                                  </p>
                                </div>
                              </div>

                              {!isNavigating && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 float-right"
                                  onClick={() => removeLocation(location.id)}
                                >
                                  <ArrowUpDown className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}