"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PipelineBoard } from "./board/pipeline-board"
import { PipelineList } from "./list/pipeline-list"
import { 
  LayoutGrid, 
  List,
  SlidersHorizontal
} from "lucide-react"

interface PipelineViewProps {
  shops: CoffeeShop[]
}

// src/components/pipeline/pipeline-view.tsx
export function PipelineView({ shops }: PipelineViewProps) {
  const [view, setView] = useState<"board" | "list">("board")

  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* Fixed View Toggle */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={view === "board" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("board")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        {view === "board" ? (
          <PipelineBoard shops={shops} />
        ) : (
          <PipelineList shops={shops} />
        )}
      </div>
    </div>
  )
}
