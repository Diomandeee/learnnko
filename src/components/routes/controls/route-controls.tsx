// src/components/routes/controls/route-controls.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useRouteStore } from "@/store/route-store";
import { Settings2, Navigation, Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RouteControls() {
  const {
    settings,
    updateSettings,
    optimizeRoute,
    isOptimizing,
  } = useRouteStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Stops */}
        <div className="space-y-2">
          <Label>Maximum Stops</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxStops]}
              onValueChange={(value) => updateSettings({ maxStops: value[0] })}
              min={5}
              max={50}
              step={5}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxStops}</span>
          </div>
        </div>

        {/* Max Distance */}
        <div className="space-y-2">
          <Label>Maximum Distance (km)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxDistance]}
              onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxDistance}km</span>
          </div>
        </div>

        {/* Transport Mode */}
        <div className="space-y-2">
          <Label>Transport Mode</Label>
          <Select
            value={settings.transportMode}
            onValueChange={(value) => updateSettings({ transportMode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRIVING">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Driving</span>
                </div>
              </SelectItem>
              <SelectItem value="WALKING">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>Walking</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Route Optimization */}
        <div className="space-y-2">
          <Label>Optimize By</Label>
          <Select
            value={settings.optimizeBy}
            onValueChange={(value) => updateSettings({ optimizeBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="volume">Volume Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-highways">Avoid Highways</Label>
            <Switch
              id="avoid-highways"
              checked={settings.avoidHighways}
              onCheckedChange={(checked) => 
                updateSettings({ avoidHighways: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-tolls">Avoid Tolls</Label>
            <Switch
              id="avoid-tolls"
              checked={settings.avoidTolls}
              onCheckedChange={(checked) => 
                updateSettings({ avoidTolls: checked })
              }
            />
          </div>
        </div>

        {/* Optimize Button */}
        <Button 
          className="w-full" 
          onClick={() => optimizeRoute()}
          disabled={isOptimizing}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {isOptimizing ? "Optimizing..." : "Optimize Route"}
        </Button>
      </CardContent>
    </Card>
  );
}