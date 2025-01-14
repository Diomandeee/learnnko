"use client";

import { format } from "date-fns";
import { Shift } from "@/types/scheduling/shift";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, AlertCircle } from "lucide-react";

interface ShiftCardProps {
 shift: Shift;
 onClick?: () => void;
}

export function ShiftCard({ shift, onClick }: ShiftCardProps) {
 const staffingComplete = shift.requiredRoles.every(
   role => {
     const assigned = shift.assignedStaff.filter(
       a => a.roleId === role.roleId
     ).length;
     return assigned >= role.minStaffCount;
   }
 );

 return (
   <Card
     className={`cursor-pointer transition-shadow hover:shadow-md ${
       !staffingComplete ? 'border-yellow-500' : ''
     }`}
     onClick={onClick}
   >
     <CardHeader className="pb-2">
       <div className="flex items-center justify-between">
         <Badge
           variant={shift.type === 'COFFEE' ? 'default' : 'secondary'}
         >
           {shift.type}
         </Badge>
         <Badge
           variant={staffingComplete ? 'success' : 'warning'}
         >
           {staffingComplete ? 'Fully Staffed' : 'Needs Staff'}
         </Badge>
       </div>
       <CardTitle className="text-lg">
         {format(new Date(shift.startTime), "MMM d, yyyy")}
       </CardTitle>
     </CardHeader>
     <CardContent>
       <div className="space-y-2">
         <div className="flex items-center text-sm text-muted-foreground">
           <Clock className="mr-2 h-4 w-4" />
           {format(new Date(shift.startTime), "h:mm a")} -{" "}
           {format(new Date(shift.endTime), "h:mm a")}
         </div>
         <div className="flex items-center text-sm text-muted-foreground">
           <Users className="mr-2 h-4 w-4" />
           {shift.assignedStaff.length} staff assigned
         </div>
         {!staffingComplete && (
           <div className="flex items-center text-sm text-yellow-600">
             <AlertCircle className="mr-2 h-4 w-4" />
             Staffing incomplete
           </div>
         )}
         {shift.notes && (
           <div className="mt-2 text-sm text-muted-foreground">
             {shift.notes}
           </div>
         )}
       </div>
     </CardContent>
   </Card>
 );
}
