"use client"

import { NkoConversation } from "@/components/nko/conversation/nko-conversation"

export default function NkoConversationPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">ߞ</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              N'Ko Conversation Practice
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Practice N'Ko with AI assistance and real-time translation
          </p>
        </div>

        <NkoConversation onStatsUpdate={(stats) => console.log('Stats updated:', stats)} />
      </div>
    </div>
  )
} 