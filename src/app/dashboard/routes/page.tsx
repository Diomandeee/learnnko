"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouteStore } from "@/store/route-store";
import { LocationSelector } from "@/components/routes/controls/location-selector";
import {
  Map,
  FileSpreadsheet,
  Calendar,
  Share2,
  Settings,
  Navigation,
  MapPin,
  LocateFixed,
  Trash2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

// Dynamically import components with proper typing
const RouteMap = dynamic(
  () => import("@/components/routes/map/route-map").then(mod => ({ 
    default: mod.RouteMap 
  })),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full h-[800px] flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </Card>
    ),
  }
);

const RouteControls = dynamic(
  () => import("@/components/routes/controls/route-controls").then(mod => ({
    default: mod.RouteControls
  })),
  { ssr: false }
);

const RouteList = dynamic(
  () => import("@/components/routes/list/route-list").then(mod => ({
    default: mod.RouteList
  })),
  { ssr: false }
);

export default function RoutesPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { 
    clearRoute, 
    exportToCalendar, 
    shareRoute, 
    openInGoogleMaps,
    updateCurrentLocation,
    currentLocation,
    currentRoute 
  } = useRouteStore();
  const { toast } = useToast();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Export implementation here
      setIsExporting(false);
      toast({
        title: "Route Exported",
        description: "Your route has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export route. Please try again.",
        variant: "destructive"
      });
      setIsExporting(false);
    }
  }, [toast]);

  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      updateCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });

      toast({
        title: "Location Updated",
        description: "Your current location has been updated."
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get your current location. Please check your permissions.",
        variant: "destructive"
      });
    } finally {
      setIsLocating(false);
    }
  }, [updateCurrentLocation, toast]);

  return (
    <PageContainer>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Route Planning</h1>
              <p className="text-muted-foreground">
                Plan and optimize your coffee shop visits
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleLocateMe} 
                disabled={isLocating}
                className="min-w-[140px]"
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                {isLocating ? "Locating..." : "Locate Me"}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => openInGoogleMaps()}
                disabled={currentRoute.length === 0}
                className="min-w-[140px]"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Open in Maps
              </Button>

              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={isExporting}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Route
              </Button>

              <Button 
                variant="outline" 
                onClick={shareRoute}
                disabled={currentRoute.length === 0}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Route
              </Button>

              <Button 
                variant="destructive" 
                onClick={clearRoute}
                disabled={currentRoute.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Route
              </Button>
            </div>
          </div>

          {/* Current Location Indicator */}
          {currentLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </span>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Location Selector */}
            <div className="col-span-12 lg:col-span-3">
              <LocationSelector />
            </div>

            {/* Center Column: Map and Route List */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* Map */}
              <RouteMap />

              {/* Route List */}
              <RouteList />
            </div>

            {/* Right Column: Route Controls */}
            <div className="col-span-12 lg:col-span-3">
              <RouteControls />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}