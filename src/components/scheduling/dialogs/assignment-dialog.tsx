"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: any;
  onAssign: (staffIds: string[]) => Promise<void>;
}

export function AssignmentDialog({
  open,
  onOpenChange,
  shift,
  onAssign,
}: AssignmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableStaff();
    } else {
      setSelectedStaff([]);
    }
  }, [open]);

  const fetchAvailableStaff = async () => {
    try {
      const response = await fetch('/api/scheduling/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const staff = await response.json();
      
      // Filter out staff already assigned to this shift
      const assignedStaffIds = shift.assignedStaff?.map(a => a.staffId) || [];
      const availableStaff = staff.filter(s => !assignedStaffIds.includes(s.id));
      
      setAvailableStaff(availableStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available staff",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (selectedStaff.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one staff member",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await onAssign(selectedStaff);
      setSelectedStaff([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign staff to shift",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Staff to Shift</DialogTitle>
          <DialogDescription>
            Select staff members to assign to this shift on{" "}
            {new Date(shift.startTime).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {availableStaff.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No available staff members to assign
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Certifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStaff([...selectedStaff, staff.id]);
                            } else {
                              setSelectedStaff(selectedStaff.filter(id => id !== staff.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>
                        <Badge>{staff.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {staff.certifications?.map((cert) => (
                            <Badge key={cert} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || selectedStaff.length === 0}
          >
            {loading ? "Assigning..." : "Assign Selected Staff"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
