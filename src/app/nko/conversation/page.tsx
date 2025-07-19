"use client"

import { NkoConversation } from "@/components/nko/conversation/nko-conversation"

export default function NkoConversationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">N'Ko Conversation Practice</h1>
          <p className="text-muted-foreground">
            Practice N'Ko with AI assistance and real-time translation
          </p>
        </div>
      </div>

      <NkoConversation onStatsUpdate={(stats) => console.log('Stats updated:', stats)} />
    </div>
  )
} 