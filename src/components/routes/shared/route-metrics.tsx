// src/components/routes/shared/route-metrics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouteStore } from "@/store/route-store";
import { Clock, MapPin, Navigation } from "lucide-react";

export function RouteMetrics() {
  const { metrics, settings } = useRouteStore();

  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {metrics.totalDistance.toFixed(1)} km
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">
              {Math.round(metrics.totalDuration)} min
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stops</p>
            <p className="text-2xl font-bold">{metrics.numberOfStops}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Arrival</p>
            <p className="text-2xl font-bold">{metrics.estimatedArrival}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span>{settings.transportMode.toLowerCase()}</span>
          </div>
          {settings.avoidHighways && (
            <span>Avoiding highways</span>
          )}
          {settings.avoidTolls && (
            <span>Avoiding tolls</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}