"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Shift } from "@/types/scheduling";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
import { ShiftType, ShiftStatus } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { AssignmentDialog } from "@/components/scheduling/dialogs/assignment-dialog";

const getShiftTypeColor = (type: ShiftType) => {
  return type === "COFFEE" ? "blue" : "purple";
};

const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "DRAFT":
      return "gray";
    case "PUBLISHED":
      return "green";
    case "IN_PROGRESS":
      return "blue";
    case "COMPLETED":
      return "purple";
    default:
      return "gray";
  }
};

export function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/scheduling/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async (staffIds: string[]) => {
    if (!selectedShift) return;

    try {
      const responses = await Promise.all(
        staffIds.map((staffId) =>
          fetch(`/api/scheduling/shifts/${selectedShift.id}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffId, roleId: selectedShift.requiredRoles[0]?.roleId }),
          })
        )
      );

      if (responses.every(r => r.ok)) {
        toast({
          title: "Success",
          description: "Staff assigned successfully",
        });
        fetchShifts(); // Refresh the shifts list
      } else {
        throw new Error("Failed to assign one or more staff members");
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Shift deleted successfully",
        });
        fetchShifts(); // Refresh the shifts list
      } else {
        throw new Error("Failed to delete shift");
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No shifts found. Create your first shift to get started.
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      {format(new Date(shift.startTime), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.startTime), "h:mm a")} -{" "}
                      {format(new Date(shift.endTime), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getShiftTypeColor(shift.type)}>
                        {shift.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{shift.assignedStaff.length} assigned</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedShift(shift);
                              setAssignmentDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(shift.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Shift
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedShift && (
        <AssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          shift={selectedShift}
          onAssign={handleAssignStaff}
        />
      )}
    </>
  );
}
