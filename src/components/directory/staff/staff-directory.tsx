"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "@/components/directory/staff/staff-list";
import { TimeOffOverview } from "@/components/directory/time-off/time-off-overview";
import { AvailabilityManager } from "@/components/directory/availability/availability-manager";
import { StaffSchedule } from "@/components/directory/schedules/staff-schedule";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StaffDialog } from "@/components/scheduling/dialogs/staff-dialog";
import { useToast } from "@/components/ui/use-toast";

export function StaffDirectory() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateStaff = async (data: any) => {
    try {
      const response = await fetch('/api/scheduling/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create staff member');

      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground">
            Manage staff, schedules, time off, and availability
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="schedule">Schedules</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <StaffList />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <StaffSchedule />
        </TabsContent>

        <TabsContent value="time-off" className="space-y-4">
          <TimeOffOverview />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>

      <StaffDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}
