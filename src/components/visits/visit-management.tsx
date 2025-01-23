"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VisitTable } from "./visit-table"
import { VisitCalendar } from "./visit-calendar"
import { VisitScheduler } from "./visit-scheduler"
import { VisitedShops } from "./visited-shops"
import { Plus, Calendar, List, Clock, CheckCircle2 } from "lucide-react"

interface VisitManagementProps {
  className?: string
}

export function VisitManagement({ className }: VisitManagementProps) {
  const router = useRouter()
  const [view, setView] = useState("list")

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Visit Management</CardTitle>
          <Button onClick={() => router.push("/dashboard/visits/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Record New Visit
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Input
              placeholder="Search visits..."
              className="max-w-[250px]"
            />
          </div>
          <Tabs defaultValue={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="mr-2 h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="visited">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Visited Shops
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="border-none p-0 pt-4">
              <VisitTable />
            </TabsContent>
            <TabsContent value="calendar" className="border-none p-0 pt-4">
              <VisitCalendar />
            </TabsContent>
            <TabsContent value="schedule" className="border-none p-0 pt-4">
              <VisitScheduler />
            </TabsContent>
            <TabsContent value="visited" className="border-none p-0 pt-4">
              <VisitedShops />
            </TabsContent>
          </Tabs>
        </div>
      </CardHeader>
    </Card>
  )
}
