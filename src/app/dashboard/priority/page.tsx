import { Metadata } from "next"
import { PriorityList } from "@/components/priority/list/priority-list"
import { PriorityMap } from "@/components/priority/map/priority-map"
import { WeeklyScheduler } from "@/components/priority/scheduler/weekly-scheduler"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Priority Routes | BUF BARISTA CRM",
  description: "Manage priority locations and optimize routes"
}

export default async function PriorityPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Priority Routes</h1>
          <p className="text-muted-foreground">
            Manage high-priority locations and create optimized routes
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Priority Location List */}
          <div className="col-span-2">
            <PriorityList />
          </div>

          {/* Map View */}
          <div className="col-span-3">
            <PriorityMap />
          </div>

          {/* Weekly Schedule */}
          <div className="col-span-2">
            <WeeklyScheduler />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
