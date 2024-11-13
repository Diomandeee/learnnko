"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScansMapProps {
  className?: string
}

export function ScansMap({ className }: ScansMapProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Geographic Distribution</CardTitle>
        <Select defaultValue="scans">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scans">Total Scans</SelectItem>
            <SelectItem value="users">Unique Users</SelectItem>
            <SelectItem value="duration">Avg. Duration</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          Map visualization would go here
        </div>
      </CardContent>
    </Card>
  )
}
