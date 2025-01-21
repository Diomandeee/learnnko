"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users, AlertTriangle } from "lucide-react";

interface ShiftAnalyticsProps {
  shifts: any[];
  period: "day" | "week" | "month";
}

export function ShiftAnalytics({ shifts, period }: ShiftAnalyticsProps) {
  // Calculate key metrics
  const totalShifts = shifts.length;
  const unassignedShifts = shifts.filter(s => s.assignedStaff.length === 0).length;
  const totalHours = shifts.reduce((acc, shift) => {
    const duration = formatDistance(
      new Date(shift.endTime),
      new Date(shift.startTime)
    );
    return acc + parseInt(duration);
  }, 0);
  
  const laborCost = shifts.reduce((acc, shift) => {
    return acc + (shift.assignedStaff.length * 20 * parseInt(formatDistance(
      new Date(shift.endTime),
      new Date(shift.startTime)
    )));
  }, 0);

  // Prepare chart data
  const chartData = shifts.reduce((acc, shift) => {
    const date = new Date(shift.startTime).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.shifts += 1;
      existing.staff += shift.assignedStaff.length;
    } else {
      acc.push({
        date,
        shifts: 1,
        staff: shift.assignedStaff.length
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
            <p className="text-xs text-muted-foreground">
              {totalHours} total hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${laborCost}</div>
            <p className="text-xs text-muted-foreground">
              Based on hourly rates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalShifts - unassignedShifts) / totalShifts * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of shifts fully staffed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedShifts}</div>
            <Badge variant="destructive" className="mt-1">
              Understaffed shifts
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shifts" fill="#3b82f6" name="Shifts" />
                <Bar dataKey="staff" fill="#10b981" name="Staff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
