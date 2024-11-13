// src/app/(app)/qr/[id]/loading.tsx
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex-1 p-8">
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-10 rounded bg-muted" />
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="h-10 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </Card>
    </div>
  )
}