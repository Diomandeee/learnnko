import { Metadata } from "next"
import { VisitManagement } from "@/components/visits/visit-management"
import { VisitAnalytics } from "@/components/visits/visit-analytics"
import { RouteAnalytics } from "@/components/routes/analytics/route-analytics"
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Visit Management | Milk Man CRM",
  description: "Manage and track coffee shop visits",
}

export default function VisitsPage() {
  return (
    <PageContainer>

    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visit Management</h1>
          <p className="text-sm text-muted-foreground">
            Track, schedule, and analyze your coffee shop visits
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-12">
        <VisitManagement className="md:col-span-4 lg:col-span-8" />
        <VisitAnalytics className="md:col-span-3 lg:col-span-4" />
              
      {/* Analytics Section */}
      </div>
      <RouteAnalytics />

    </div>
    </PageContainer>

  )
}
