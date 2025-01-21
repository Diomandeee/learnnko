"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  staff: {
    name: string;
  };
}

export function TimeOffOverview() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestType, setRequestType] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeOffRequests();
  }, []);

  const fetchTimeOffRequests = async () => {
    try {
      const response = await fetch('/api/directory/time-off');
      if (!response.ok) throw new Error('Failed to fetch time off requests');
      const data = await response.json();
      setTimeOffRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch time off requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTimeOff = async () => {
    if (!selectedDate || !requestType) {
      toast({
        title: "Error",
        description: "Please select a date and request type",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/directory/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: selectedDate,
          endDate: selectedDate,
          type: requestType
        }),
      });

      if (!response.ok) throw new Error('Failed to create time off request');

      toast({
        title: "Success",
        description: "Time off request submitted successfully",
      });

      fetchTimeOffRequests();
      setRequestType("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit time off request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Time Off Calendar</CardTitle>
          <CardDescription>View and manage time off requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Time Off</CardTitle>
            <CardDescription>Scheduled absences for the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : timeOffRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming time off requests</p>
              ) : (
                timeOffRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge>{request.type}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
            <CardDescription>Submit a new time off request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACATION">Vacation</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleRequestTimeOff}
                disabled={!selectedDate || !requestType}
              >
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
