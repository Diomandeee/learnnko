import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
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
import { useToast } from "@/components/ui/use-toast";
import { EditShiftDialog } from "@/components/scheduling/dialogs/edit-shift-dialog";
import { AssignmentDialog } from "@/components/scheduling/dialogs/assignment-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const { toast } = useToast();

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
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (shift) => {
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  const handleEditClick = (shift) => {
    setSelectedShift(shift);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (shift) => {
    setSelectedShift(shift);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/scheduling/shifts/${selectedShift.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete shift');

      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });

      fetchShifts();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
    }
  };

  const handleAssignSubmit = async (staffIds) => {
    try {
      await Promise.all(
        staffIds.map((staffId) =>
          fetch(`/api/scheduling/shifts/${selectedShift.id}/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffId }),
          })
        )
      );

      toast({
        title: "Success",
        description: "Staff assigned successfully",
      });

      fetchShifts();
      setAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  const getDayShifts = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return days.map(day => ({
      date: day,
      shifts: shifts.filter(shift => isSameDay(new Date(shift.startTime), day))
    }));
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
      <div className="grid grid-cols-7 gap-4">
        {getDayShifts().map(({ date, shifts }) => (
          <div key={date.toISOString()} className="space-y-4">
            <div className="text-sm font-medium text-center">
              {format(date, "EEE, MMM d")}
            </div>
            <div className="space-y-2">
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  No shifts
                </div>
              ) : (
                shifts.map((shift) => (
                  <Card key={shift.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={shift.type === "COFFEE" ? "default" : "secondary"}>
                          {shift.type}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAssignClick(shift)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(shift)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Shift
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteClick(shift)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Shift
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm">
                        {format(new Date(shift.startTime), "h:mm a")} -{" "}
                        {format(new Date(shift.endTime), "h:mm a")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {shift.assignedStaff?.length || 0} staff assigned
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedShift && (
        <>
          <AssignmentDialog
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            shift={selectedShift}
            onAssign={handleAssignSubmit}
          />

          <EditShiftDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            shift={selectedShift}
            onShiftUpdated={fetchShifts}
            onShiftDeleted={fetchShifts}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the shift
                  and remove all associated assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}