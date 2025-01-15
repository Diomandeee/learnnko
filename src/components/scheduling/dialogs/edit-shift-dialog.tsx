"use client";

import { useState, useEffect } from "react";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Clock, UserPlus } from "lucide-react";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Staff {
 id: string;
 name: string;
 email: string;
 role: string;
}

interface Break {
 id?: string;
 startTime: string;
 duration: number;
}

interface EditShiftDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 shift: any;
 onShiftUpdated: () => void;
 onShiftDeleted: () => void;
}

export function EditShiftDialog({
 open,
 onOpenChange,
 shift,
 onShiftUpdated,
 onShiftDeleted
}: EditShiftDialogProps) {
 const [shiftType, setShiftType] = useState(shift.type);
 const [startTime, setStartTime] = useState(format(new Date(shift.startTime), "HH:mm"));
 const [endTime, setEndTime] = useState(format(new Date(shift.endTime), "HH:mm"));
 const [breaks, setBreaks] = useState<Break[]>(shift.breaks || []);
 const [loading, setLoading] = useState(false);
 const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
 const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
 const { toast } = useToast();

 useEffect(() => {
   if (open) {
     fetchAvailableStaff();
   }
 }, [open]);

 const fetchAvailableStaff = async () => {
   try {
     const response = await fetch('/api/scheduling/staff');
     if (!response.ok) throw new Error('Failed to fetch staff');
     const staff = await response.json();
     setAvailableStaff(staff);
   } catch (error) {
     console.error('Error fetching staff:', error);
     toast({
       title: "Error",
       description: "Failed to fetch available staff",
       variant: "destructive",
     });
   }
 };

 const handleAddBreak = () => {
   const shiftStart = new Date(shift.startTime);
   const newBreak: Break = {
     startTime: format(new Date(shiftStart).setHours(shiftStart.getHours() + 2), "HH:mm"),
     duration: 30
   };
   setBreaks([...breaks, newBreak]);
 };

 const handleRemoveBreak = (index: number) => {
   const newBreaks = [...breaks];
   newBreaks.splice(index, 1);
   setBreaks(newBreaks);
 };

 const handleUpdateBreak = (index: number, field: keyof Break, value: string | number) => {
   const newBreaks = [...breaks];
   newBreaks[index] = {
     ...newBreaks[index],
     [field]: value
   };
   setBreaks(newBreaks);
 };

 const handleAssignStaff = async () => {
   if (!selectedStaffId) return;

   try {
     setLoading(true);
     const response = await fetch(`/api/scheduling/shifts/${shift.id}/assignments`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         staffId: selectedStaffId,
       }),
     });

     if (!response.ok) {
       const error = await response.text();
       throw new Error(error);
     }

     toast({
       title: "Success",
       description: "Staff assigned successfully",
     });

     onShiftUpdated();
   } catch (error) {
     console.error('Error assigning staff:', error);
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to assign staff",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
     setSelectedStaffId(null);
   }
 };

 const handleRemoveStaffAssignment = async (staffId: string) => {
   try {
     setLoading(true);
     const response = await fetch(`/api/scheduling/shifts/${shift.id}/assignments?staffId=${staffId}`, {
       method: 'DELETE',
     });

     if (!response.ok) throw new Error('Failed to remove staff assignment');

     toast({
       title: "Success",
       description: "Staff removed from shift",
     });

     onShiftUpdated();
   } catch (error) {
     console.error('Error removing staff:', error);
     toast({
       title: "Error",
       description: "Failed to remove staff from shift",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

 const handleUpdateShift = async () => {
   try {
     setLoading(true);
     
     const shiftDate = new Date(shift.startTime);
     const [startHour, startMinute] = startTime.split(':');
     const [endHour, endMinute] = endTime.split(':');
     
     const newStartTime = new Date(shiftDate);
     newStartTime.setHours(parseInt(startHour), parseInt(startMinute));
     
     const newEndTime = new Date(shiftDate);
     newEndTime.setHours(parseInt(endHour), parseInt(endMinute));

     const formattedBreaks = breaks.map(breakItem => {
       const [breakHour, breakMinute] = breakItem.startTime.split(':');
       const breakDate = new Date(shiftDate);
       breakDate.setHours(parseInt(breakHour), parseInt(breakMinute));
       return {
         ...breakItem,
         startTime: breakDate.toISOString()
       };
     });

     const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         type: shiftType,
         startTime: newStartTime.toISOString(),
         endTime: newEndTime.toISOString(),
         breaks: formattedBreaks,
       }),
     });

     if (!response.ok) throw new Error('Failed to update shift');

     toast({
       title: "Success",
       description: "Shift updated successfully",
     });

     onShiftUpdated();
     onOpenChange(false);
   } catch (error) {
     console.error('Error updating shift:', error);
     toast({
       title: "Error",
       description: "Failed to update shift",
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

 const handleDeleteShift = async () => {
   try {
     setLoading(true);
     
     const response = await fetch(`/api/scheduling/shifts/${shift.id}`, {
       method: 'DELETE',
     });

     if (!response.ok) throw new Error('Failed to delete shift');

     toast({
       title: "Success",
       description: "Shift deleted successfully",
     });

     onShiftDeleted();
     onOpenChange(false);
   } catch (error) {
     console.error('Error deleting shift:', error);
     toast({
       title: "Error",
       description: "Failed to delete shift",
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
         <DialogTitle>Edit Shift</DialogTitle>
       </DialogHeader>
       
       <div className="grid grid-cols-2 gap-8">
         <div className="space-y-4">
           <div className="space-y-2">
             <label className="text-sm font-medium">Date</label>
             <Input
               value={format(new Date(shift.startTime), "MMMM d, yyyy")}
               disabled
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Start Time</label>
               <Input
                 type="time"
                 value={startTime}
                 onChange={(e) => setStartTime(e.target.value)}
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium">End Time</label>
               <Input
                 type="time"
                 value={endTime}
                 onChange={(e) => setEndTime(e.target.value)}
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-medium">Shift Type</label>
             <Select
               value={shiftType}
               onValueChange={(value: 'COFFEE' | 'WINE') => setShiftType(value)}
             >
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="COFFEE">Coffee Service</SelectItem>
                 <SelectItem value="WINE">Wine Service</SelectItem>
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <label className="text-sm font-medium">Breaks</label>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={handleAddBreak}
               >
                 Add Break
               </Button>
             </div>
             
             <div className="space-y-2">
               {breaks.map((breakItem, index) => (
                 <div key={index} className="flex items-center space-x-2 bg-accent/50 p-2 rounded-md">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   <Input
                     type="time"
                     value={breakItem.startTime}
                     onChange={(e) => handleUpdateBreak(index, 'startTime', e.target.value)}
                     className="w-32"
                   />
                   <Select
                     value={breakItem.duration.toString()}
                     onValueChange={(value) => handleUpdateBreak(index, 'duration', parseInt(value))}
                   >
                     <SelectTrigger className="w-32">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="15">15 minutes</SelectItem>
                       <SelectItem value="30">30 minutes</SelectItem>
                       <SelectItem value="45">45 minutes</SelectItem>
                       <SelectItem value="60">60 minutes</SelectItem>
                     </SelectContent>
                   </Select>
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => handleRemoveBreak(index)}
                   >
                     <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                 </div>
               ))}
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <label className="text-sm font-medium">Assigned Staff</label>
             <div className="flex items-center space-x-2">
               <Select
                 value={selectedStaffId || ""}
                 onValueChange={setSelectedStaffId}
               >
                 <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder="Select staff member" />
                 </SelectTrigger>
                 <SelectContent>
                   {availableStaff.map((staff) => (
                     <SelectItem key={staff.id} value={staff.id}>
                       {staff.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button
                 type="button"
                 size="sm"
                 onClick={handleAssignStaff}
                 disabled={!selectedStaffId || loading}
               >
                 <UserPlus className="h-4 w-4" />
               </Button>
             </div>
           </div>

           <div className="border rounded-md">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Name</TableHead>
                   <TableHead>Role</TableHead>
                   <TableHead></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {shift.assignedStaff.length === 0 ? (
                   <TableRow>
                     <TableCell
                       colSpan={3}
                       className="text-center text-muted-foreground"
                     >
                       No staff assigned
                     </TableCell>
                   </TableRow>
                 ) : (
                   shift.assignedStaff.map((assignment: any) => (
                     <TableRow key={assignment.id}>
                       <TableCell>{assignment.staff.name}</TableCell>
                       <TableCell>
                         <Badge variant="outline">
                           {assignment.staff.role}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                         <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           onClick={() => handleRemoveStaffAssignment(assignment.staff.id)}
                           disabled={loading}
                         >
                           <Trash2 className="h-4 w-4 text-destructive" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </div>
         </div>
       </div>

       <div className="flex justify-between mt-6">
         <Button
           variant="destructive"
           onClick={handleDeleteShift}
           disabled={loading}
         >
           Delete Shift
         </Button>
         <div className="space-x-2">
           <Button
             variant="outline"
             onClick={() => onOpenChange(false)}
             disabled={loading}
           >
             Cancel
           </Button>
           <Button
             onClick={handleUpdateShift}
             disabled={loading}
           >
             {loading ? "Saving..." : "Save Changes"}
           </Button>
         </div>
       </div>
     </DialogContent>
   </Dialog>
 );
}
