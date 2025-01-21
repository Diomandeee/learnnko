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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export function AvailabilityManager() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [availability, setAvailability] = useState<Availability[]>(
    DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      startTime: "09:00",
      endTime: "17:00",
      enabled: true
    }))
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedStaff) {
      fetchAvailability();
    }
  }, [selectedStaff]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/directory/availability?staffId=${selectedStaff}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      
      setAvailability(DAYS_OF_WEEK.map((_, index) => {
        const existing = data.find((a: any) => a.dayOfWeek === index);
        return existing || {
          dayOfWeek: index,
          startTime: "09:00",
          endTime: "17:00",
          enabled: false
        };
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch availability",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/directory/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff,
          availability: availability.filter(a => a.enabled)
        }),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setAvailability(newAvailability);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Availability Preferences</CardTitle>
              <CardDescription>Set your regular working hours and preferences</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {/* Add staff members here */}
              </SelectContent>
            </Select>

            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex items-center space-x-4">
                <Switch
                  checked={availability[index].enabled}
                  onCheckedChange={(checked) => 
                    updateAvailability(index, 'enabled', checked)
                  }
                />
                <div className="flex-1">
                  <p className="font-medium">{day}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    className="w-32"
                    value={availability[index].startTime}
                    onChange={(e) => 
                      updateAvailability(index, 'startTime', e.target.value)
                    }
                    disabled={!availability[index].enabled}
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={availability[index].endTime}
                    onChange={(e) => 
                      updateAvailability(index, 'endTime', e.target.value)
                    }
                    disabled={!availability[index].enabled}
                  />
                </div>
              </div>
            ))}
          </div>  
        </CardContent>
      </Card>
    </div>
  );
}

