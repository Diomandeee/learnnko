import { Map } from "@/components/routes/map/map"
import { RouteControls } from "@/components/routes/map/route-controls"
import { VisitManagement } from "@/components/routes/visit/visit-management"

export const metadata = {
  title: "Route Planning & Visits | BUF BARISTA CRM",
  description: "Plan and optimize your coffee shop visits",
}

export default function RoutePlanningPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Planning & Visits</h1>
          <p className="text-muted-foreground">
            Plan your routes and manage coffee shop visits
          </p>
        </div>        
      </div>
      
      <div className="grid gap-4 grid-cols-12">
        {/* Left Panel - Controls */}
        <div className="col-span-3 space-y-4">
          <RouteControls />
          <VisitManagement shop={null} />
        </div>
        
        {/* Right Panel - Map */}
        <div className="col-span-9">
          <Map />
        </div>
      </div>

    </div>
  )
}