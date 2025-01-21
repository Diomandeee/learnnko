"use client";

import { useState } from "react";
import { ShiftCalendar } from "@/components/scheduling/calendar/shift-calendar";
import { ShiftList } from "@/components/scheduling/lists/shift-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { StaffDialog } from "@/components/scheduling/dialogs/staff-dialog";
import { ShiftDialog } from "@/components/scheduling/dialogs/shift-dialog";
import { toast } from "@/components/ui/use-toast";
import { PageContainer } from "@/components/layout/page-container"

export default function SchedulingPage() {
  const router = useRouter();
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);

  const handleStaffSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/scheduling/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create staff member");
      }

      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    }
  };

  const handleShiftSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/scheduling/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create shift");
      }

      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer>

    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scheduling</h2>
          <p className="text-muted-foreground">
            Manage staff schedules and shift assignments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setOpenStaffDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
          <Button onClick={() => setOpenShiftDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Shift
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <ShiftCalendar />

        <div className="grid gap-6 md:grid-cols-1">
  
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <ShiftList />
            </CardContent>
          </Card>
        </div>
      </div>

      <StaffDialog
        open={openStaffDialog}
        onOpenChange={setOpenStaffDialog}
        onSubmit={handleStaffSubmit}
      />

      <ShiftDialog
        open={openShiftDialog}
        onOpenChange={setOpenShiftDialog}
        onSubmit={handleShiftSubmit}
      />
    </div>
    </PageContainer>

  );
}
