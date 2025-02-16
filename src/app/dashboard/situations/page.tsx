import { Metadata } from "next"
import { SituationsTab } from "@/components/translate/situations/situations-tab"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Situations",
  description: "Situations page",
}

export default function SituationsPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Situations</h1>
          <p className="text-muted-foreground">
            Choose a situation to translate
          </p>
        </div>

        <SituationsTab />
      </div>
    </PageContainer>
  )
}