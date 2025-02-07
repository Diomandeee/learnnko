// src/app/dashboard/pipeline/page.tsx
import { Metadata } from "next"
import { PipelineView } from "@/components/pipeline/pipeline-view"
import { PipelineStats } from "@/components/pipeline/stats/pipeline-stats"
import { prisma } from "@/lib/db/prisma"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Pipeline | BUF CRM",
  description: "Track and manage your sales pipeline"
}

async function getPipelineData() {
  const shops = await prisma.coffeeShop.findMany({
    include: {
      owners: true,
    },
    orderBy: [
      { stage: 'asc' },
      { updatedAt: 'desc' }
    ]
  })
  
  return shops
}

// src/app/dashboard/pipeline/page.tsx
export default async function PipelinePage() {
  const shops = await getPipelineData()
  
  return (
    <PageContainer>
      <div className="p-4 space-y-4">
        {/* Fixed Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pipeline</h2>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>

        {/* Fixed Stats */}
        <PipelineStats shops={shops} />
        
        {/* Scrollable Pipeline View */}
        <div className="h-[calc(100vh-300px)]"> {/* Fixed height for scrollable area */}
          <PipelineView shops={shops} />
        </div>
      </div>
    </PageContainer>
  )
}