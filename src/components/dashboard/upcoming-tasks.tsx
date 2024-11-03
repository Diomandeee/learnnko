"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function UpcomingTasks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Tasks</CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">No upcoming tasks</div>
      </CardContent>
    </Card>
  );
}
