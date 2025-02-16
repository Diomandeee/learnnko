import { Metadata } from "next"
import { ConversationTab } from "@/components/translate/conversation-tab"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Conversation",
  description: "Conversation page",
}

export default function ConversatioPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversation</h1>
          <p className="text-muted-foreground">
            Translate your conversation
          </p>
        </div>

        <ConversationTab />
      </div>
    </PageContainer>
  )
}