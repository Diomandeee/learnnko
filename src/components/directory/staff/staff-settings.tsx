"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchStaffSettings,
  updateStaffSettings,
} from "@/lib/staff/settings";

interface StaffSettings {
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  preferredShifts: string[];
  emergencyContact: string;
  address: string;
  notes: string;
}

interface StaffSettingsProps {
  staffId: string;
}

export function StaffSettings({ staffId }: StaffSettingsProps) {
  const [settings, setSettings] = useState<StaffSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [staffId]);

  const loadSettings = async () => {
    try {
      const data = await fetchStaffSettings(staffId);
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load staff settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      await updateStaffSettings(staffId, settings);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Settings</CardTitle>
        <CardDescription>Manage staff member preferences and details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Maximum Hours per Week</label>
          <Input
            type="number"
            value={settings.maxHoursPerWeek}
            onChange={(e) => setSettings({
              ...settings,
              maxHoursPerWeek: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Maximum Hours per Day</label>
          <Input
            type="number"
            value={settings.maxHoursPerDay}
            onChange={(e) => setSettings({
              ...settings,
              maxHoursPerDay: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Emergency Contact</label>
          <Input
            value={settings.emergencyContact || ''}
            onChange={(e) => setSettings({
              ...settings,
              emergencyContact: e.target.value
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <Input
            value={settings.address || ''}
            onChange={(e) => setSettings({
              ...settings,
              address: e.target.value
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={settings.notes || ''}
            onChange={(e) => setSettings({
              ...settings,
              notes: e.target.value
            })}
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
