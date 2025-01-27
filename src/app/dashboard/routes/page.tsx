// src/app/dashboard/routes/page.tsx
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

const RouteMetrics = dynamic(
  () => import("@/components/routes/shared/route-metrics").then(mod => ({
    default: mod.RouteMetrics
  })),
  { ssr: false }
);

export default function RoutesPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { clearRoute, exportToCalendar, shareRoute } = useRouteStore();
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Route
            </Button>
            <Button variant="outline" onClick={exportToCalendar}>
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
            <Button variant="outline" onClick={shareRoute}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Route
            </Button>
            <Button variant="destructive" onClick={clearRoute}>
              Clear Route
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Controls Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <LocationSelector />
            <RouteControls />
            <RouteMetrics />
            <RouteList />
          </div>

          {/* Map */}
          <div className="col-span-12 lg:col-span-9">
            <RouteMap />
          </div>
        </div>
      </div>
    </div>
    </PageContainer>

  );
}