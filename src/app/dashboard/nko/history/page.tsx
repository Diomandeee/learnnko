import { Metadata } from "next"
import { History } from "@/components/translate/history"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title:  "History",
  description:  "History page",
}

export default function HistoryPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            View your translation history
          </p>
        </div>

        <History />
      </div>
    </PageContainer>
  )
}