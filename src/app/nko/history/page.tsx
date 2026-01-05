"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MessageCircle, Languages, BookOpen, History } from "lucide-react"
import { CosmicBackground } from "@/components/cosmic/CosmicBackground"
import { CosmicPageHeader } from "@/components/cosmic/CosmicPageHeader"
import { CosmicCard } from "@/components/cosmic/CosmicCard"
import { cn } from "@/lib/utils"

export default function NkoHistoryPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-space-950">
      {/* Cosmic Background */}
      <CosmicBackground showFloatingChars variant="default" />

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <CosmicPageHeader
          icon={History}
          title="N'Ko Learning History"
          description="Track your progress across all N'Ko learning activities"
        />

        <Tabs defaultValue="conversations" className="space-y-6 mt-8">
          <TabsList className="bg-space-800/80 border-amber-500/20 p-1">
            <TabsTrigger
              value="conversations"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 hover:bg-amber-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Conversations
            </TabsTrigger>
            <TabsTrigger
              value="translations"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 hover:bg-amber-500/10"
            >
              <Languages className="w-4 h-4 mr-2" />
              Translations
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 hover:bg-amber-500/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Lessons
            </TabsTrigger>
            <TabsTrigger
              value="overall"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 hover:bg-amber-500/10"
            >
              <Clock className="w-4 h-4 mr-2" />
              Overall Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            <CosmicCard
              title="Conversation History"
              icon={<MessageCircle className="w-5 h-5" />}
              structured
            >
              <p className="text-gray-300">
                Your N'Ko conversation practice history will appear here.
              </p>
            </CosmicCard>
          </TabsContent>

          <TabsContent value="translations">
            <CosmicCard
              title="Translation History"
              icon={<Languages className="w-5 h-5" />}
              structured
            >
              <p className="text-gray-300">
                Your N'Ko translation history will appear here.
              </p>
            </CosmicCard>
          </TabsContent>

          <TabsContent value="lessons">
            <CosmicCard
              title="Lesson Progress"
              icon={<BookOpen className="w-5 h-5" />}
              structured
            >
              <p className="text-gray-300">
                Your N'Ko lesson completion history will appear here.
              </p>
            </CosmicCard>
          </TabsContent>

          <TabsContent value="overall">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CosmicCard className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 mb-3">
                  <h3 className="text-sm font-medium text-amber-200">Total Messages</h3>
                  <MessageCircle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400">0</div>
                <p className="text-xs text-gray-400 mt-1">
                  Conversation messages
                </p>
              </CosmicCard>

              <CosmicCard className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 mb-3">
                  <h3 className="text-sm font-medium text-amber-200">Translations</h3>
                  <Languages className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400">0</div>
                <p className="text-xs text-gray-400 mt-1">
                  Text translations
                </p>
              </CosmicCard>

              <CosmicCard className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 mb-3">
                  <h3 className="text-sm font-medium text-amber-200">Lessons Completed</h3>
                  <BookOpen className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400">0</div>
                <p className="text-xs text-gray-400 mt-1">
                  Learning progress
                </p>
              </CosmicCard>

              <CosmicCard className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 mb-3">
                  <h3 className="text-sm font-medium text-amber-200">Study Time</h3>
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400">0h</div>
                <p className="text-xs text-gray-400 mt-1">
                  Total learning time
                </p>
              </CosmicCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 