### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/visits/page.tsx
import { Metadata } from "next"
import { VisitManagement } from "@/components/visits/visit-management"
import { VisitAnalytics } from "@/components/visits/visit-analytics"
import { FollowUpManager } from "@/components/follow-ups/follow-up-manager"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Visit Management | CRM",
  description: "Manage and track coffee shop visits and follow-ups",
}

export default function VisitsPage() {
  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visit Management</h1>
            <p className="text-sm text-muted-foreground">
              Track, schedule, and analyze your coffee shop visits and follow-ups
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-12">
          <VisitManagement className="md:col-span-4 lg:col-span-8" />
          <VisitAnalytics className="md:col-span-3 lg:col-span-4" />
        </div>
        
        <FollowUpManager />
      </div>
    </PageContainer>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/visits/new/page.tsx
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visit-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVisits } from "@/hooks/use-visits"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { 
  Activity,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
} from "lucide-react"

interface VisitAnalyticsProps {
  className?: string
}

export function VisitAnalytics({ className }: VisitAnalyticsProps) {
  const { visits, loading } = useVisits()

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>Loading analytics...</CardContent>
      </Card>
    )
  }

  // Calculate analytics
  const totalVisits = visits?.length || 0
  const managerMeetings = visits?.filter(visit => visit.managerPresent).length || 0
  const samplesDropped = visits?.filter(visit => visit.samplesDropped).length || 0
  const scheduledVisits = visits?.filter(visit => visit.nextVisitDate).length || 0

  // Create monthly data for chart
  const monthlyData = visits?.reduce((acc, visit) => {
    const month = new Date(visit.date).toLocaleString('default', { month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(monthlyData || {}).map(([month, count]) => ({
    month,
    visits: count
  }))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Visit Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 grid-cols-2">
          <StatCard 
            title="Total Visits"
            value={totalVisits}
            icon={Activity}
            description="All time visits"
          />
          <StatCard 
            title="Manager Meetings"
            value={managerMeetings}
            icon={Users}
            description="With management"
          />
          <StatCard 
            title="Samples Dropped"
            value={samplesDropped}
            icon={Briefcase}
            description="Sample deliveries"
          />
          <StatCard 
            title="Scheduled"
            value={scheduledVisits}
            icon={Calendar}
            description="Upcoming visits"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Monthly Visit Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="visits" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  description: string
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visit-calendar.tsx
"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useVisits } from "@/hooks/use-visits"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VisitCalendar() {
  const { visits } = useVisits()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Create a map of dates to visit counts
  const visitDates = visits?.reduce((acc, visit) => {
    const date = new Date(visit.date).toDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const modifiers = {
    hasVisits: (date: Date) => {
      return !!visitDates?.[date.toDateString()]
    }
  }

  const modifiersStyles = {
    hasVisits: {
      backgroundColor: 'var(--primary)',
      color: 'white',
      borderRadius: '50%'
    }
  }

  return (
    <div className="p-4 rounded-lg border">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border"
      />

      {selectedDate && visitDates?.[selectedDate.toDateString()] > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            Visits on {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {visits?.filter(visit => 
              new Date(visit.date).toDateString() === selectedDate.toDateString()
            ).map(visit => (
              <Card key={visit.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{visit.coffeeShopId}</p>
                    <p className="text-sm text-muted-foreground">
                      Visit #{visit.visitNumber}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {visit.managerPresent && (
                      <Badge variant="outline">Manager Present</Badge>
                    )}
                    {visit.samplesDropped && (
                      <Badge variant="outline">Samples Dropped</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visit-management.tsx
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visit-scheduler.tsx
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useVisits } from "@/hooks/use-visits"
import { format } from "date-fns"

export function VisitScheduler() {
  const { visits } = useVisits()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get upcoming scheduled visits
  const upcomingVisits = visits?.filter(visit => 
    visit.nextVisitDate && new Date(visit.nextVisitDate) > new Date()
  ).sort((a, b) => 
    new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime()
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="font-medium mb-2">Schedule New Visit</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        <Button className="w-full mt-4">
          Schedule Visit
        </Button>
      </div>

      <div>
        <h3 className="font-medium mb-2">Upcoming Scheduled Visits</h3>
        <div className="space-y-2">
          {upcomingVisits?.map(visit => (
            <Card key={visit.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{visit.coffeeShopId}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(visit.nextVisitDate!), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!upcomingVisits || upcomingVisits.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No upcoming visits scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visit-table.tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useVisits } from "@/hooks/use-visits"
import { Visit, CoffeeShop } from "@prisma/client"

type VisitWithShop = Visit & {
  coffeeShop: CoffeeShop
}

export function VisitTable() {
  const { visits, loading } = useVisits()

  if (loading) return <div>Loading visits...</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Coffee Shop</TableHead>
            <TableHead>Manager Present</TableHead>
            <TableHead>Samples</TableHead>
            <TableHead>Next Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits?.map((visit: VisitWithShop) => (
            <TableRow key={visit.id}>
              <TableCell>
                {format(new Date(visit.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{visit.coffeeShop.title}</TableCell>
              <TableCell>
                {visit.managerPresent ? (
                  <Badge variant="success">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </TableCell>
              <TableCell>
                {visit.samplesDropped ? (
                  <Badge variant="success">Dropped</Badge>
                ) : (
                  <Badge variant="secondary">None</Badge>
                )}
              </TableCell>
              <TableCell>
                {visit.nextVisitDate ? (
                  format(new Date(visit.nextVisitDate), 'MMM d, yyyy')
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge>
                  Visit #{visit.visitNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/visits/visited-shops.tsx
"use client"

import { useMemo, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useVisits } from "@/hooks/use-visits"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function VisitedShops() {
  const { shops, loading: shopsLoading } = useShops()
  const { visits, loading: visitsLoading } = useVisits()
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")

  const visitedShops = useMemo(() => {
    if (!shops || !visits) return []

    const visitedShopsMap = shops
      .filter(shop => shop.visited)
      .map(shop => {
        const shopVisits = visits.filter(visit => visit.coffeeShopId === shop.id)
        const lastVisit = shopVisits.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]

        return {
          ...shop,
          visitCount: shopVisits.length,
          lastVisit,
          nextVisit: shopVisits.find(v => v.nextVisitDate && new Date(v.nextVisitDate) > new Date()),
        }
      })

    // Apply filters
    return visitedShopsMap.filter(shop => {
      const matchesSearch = 
        shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.area?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesArea = areaFilter === 'all' || shop.area === areaFilter

      return matchesSearch && matchesArea
    })
  }, [shops, visits, searchTerm, areaFilter])

  const areas = useMemo(() => {
    if (!shops) return []
    return Array.from(new Set(shops.map(shop => shop.area).filter(Boolean)))
  }, [shops])

  if (shopsLoading || visitsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search visited shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coffee Shop</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Visit Count</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitedShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.title}</TableCell>
                <TableCell>{shop.area}</TableCell>
                <TableCell>{shop.visitCount}</TableCell>
                <TableCell>
                  {shop.lastVisit ? (
                    format(new Date(shop.lastVisit.date), 'MMM d, yyyy')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {shop.nextVisit?.nextVisitDate ? (
                    format(new Date(shop.nextVisit.nextVisitDate), 'MMM d, yyyy')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {shop.parlor_coffee_leads ? (
                    <Badge className="bg-yellow-500">Lead</Badge>
                  ) : (
                    <Badge variant="secondary">Visited</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visitedShops.length === 0 && (
              <TableRow>
                <TableCell colspan={6} className="text-center py-4">
                  No visited shops found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-2 text-sm text-muted-foreground">
        Total visited shops: {visitedShops.length}
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/bulk-actions.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreHorizontal, 
  Trash2, 
  Mail, 
  Share2, 
  Download,
  Edit,
  Star,
  UserCheck,
  Shield,
  Tag,
  Calendar,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CoffeeShop } from "@prisma/client"
import { EmailDialog } from "../email/email-dialog"

interface BulkActionsProps {
  selectedIds: string[]
  onDeleteSelected: () => Promise<void>
  onUpdateSelected?: (field: keyof CoffeeShop, value: any) => Promise<void>
  onExportSelected?: () => Promise<void>
  disabled?: boolean
  selectedCount?: number
  selectedShops: CoffeeShop[]
}

export function BulkActions({
  selectedIds,
  onDeleteSelected,
  onUpdateSelected,
  onExportSelected,
  disabled = false,
  selectedCount = 0,
  selectedShops = []
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDeleteSelected()
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailClick = () => {
    console.group('Bulk Actions - Email Click')
    console.log('Selected IDs:', selectedIds)
    console.log('Selected Shops:', selectedShops)
    console.log('Shops with emails:', selectedShops.filter(shop => shop?.contact_email))
    console.log('Email addresses:', selectedShops.map(shop => shop?.contact_email).filter(Boolean))
    console.groupEnd()
    setShowEmailDialog(true)
  }

  const shopsWithEmailCount = selectedShops.filter(shop => shop?.contact_email).length

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={selectedIds.length === 0 || disabled}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
            {selectedIds.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2"
              >
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Visit Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              Visit Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Visited
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', false)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Not Visited
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Partner Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="h-4 w-4 mr-2" />
              Partner Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', true)}
              >
                Mark as Partner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', false)}
              >
                Mark as Not Partner
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Lead Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tag className="h-4 w-4 mr-2" />
              Lead Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', true)
                }
              >
                Mark as Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', false)
                }
              >
                Remove Lead Status
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Priority */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Star className="h-4 w-4 mr-2" />
              Set Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {[1, 2, 3, 4, 5].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => onUpdateSelected?.('priority', priority)}
                >
                  {Array(priority)
                    .fill('★')
                    .join('')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleEmailClick}>
            <Mail className="h-4 w-4 mr-2" />
            Email Selected
            <span className="ml-2 text-xs text-muted-foreground">
              ({shopsWithEmailCount} with email)
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => alert('Share feature coming soon')}>
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </DropdownMenuItem>

          {onExportSelected && (
            <DropdownMenuItem onClick={onExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      {showEmailDialog && (
        <EmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          selectedShops={selectedShops}
        />
      )}
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/coffee-shops-table.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { CoffeeShop } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { TableFilters } from "./table-filters"
import { TableHeader as CustomTableHeader } from "./table-header"
import { TableRow as CustomTableRow } from "./table-row"
import { TablePagination } from "./table-pagination"
import { BulkActions } from "./bulk-actions"
import { MobileCardView } from "./mobile-card-view"
import { VisitReport } from "./visit-reports"
import { TableExport } from "./table-export"

const ITEMS_PER_PAGE = 50;

interface CoffeeShopsTableProps {
  shops: CoffeeShop[]
}

export function CoffeeShopsTable({ shops }: CoffeeShopsTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState([])
  const [savedFilters, setSavedFilters] = useState([])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CoffeeShop | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc'
  })

  // Load saved filters on mount
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)

        const defaultFilter = data.find(filter => filter.isDefault)
        if (defaultFilter && activeFilters.length === 0) {
          setActiveFilters(defaultFilter.filters)
        }
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  const handleSort = useCallback((key: keyof CoffeeShop) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const handleUpdate = useCallback(async (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })

      if (!response.ok) throw new Error('Failed to update shop')

      toast({
        title: "Success",
        description: "Coffee shop updated successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/coffee-shops/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete shop')

      toast({
        title: "Success",
        description: "Coffee shop deleted successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const filteredShops = shops.filter(shop => {
    if (searchTerm && !shop.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return !activeFilters.some(filter => {
      const value = shop[filter.field]
      switch (filter.operator) {
        case 'equals':
          return value !== filter.value
        case 'contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'greaterThan':
          return Number(value) <= Number(filter.value)
        case 'lessThan':
          return Number(value) >= Number(filter.value)
        case 'between':
          return Number(value) < Number(filter.value.min) || Number(value) > Number(filter.value.max)
        default:
          return false
      }
    })
  })

  const sortedShops = [...filteredShops].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    // Special handling for date fields
    if (['first_visit', 'second_visit', 'third_visit'].includes(sortConfig.key)) {
      // Handle null/undefined values - always put them at the bottom
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move a to the bottom
      if (!bVal) return -1 // Move b to the bottom

      // Compare actual dates
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()

      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1

      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    // Handle numeric fields
    if (['volume', 'rating', 'reviews', 'followers', 'priority'].includes(sortConfig.key)) {
      const aNum = Number(aVal)
      const bNum = Number(bVal)

      // Handle NaN values
      if (isNaN(aNum) && isNaN(bNum)) return 0
      if (isNaN(aNum)) return 1
      if (isNaN(bNum)) return -1

      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
    }

    // Default string comparison
    const aStr = String(aVal || '').toLowerCase()
    const bStr = String(bVal || '').toLowerCase()
    
    if (aStr === bStr) return 0
    if (!aVal) return 1  // Move empty values to the bottom
    if (!bVal) return -1

    const compareResult = aStr > bStr ? 1 : -1
    return sortConfig.direction === 'asc' ? compareResult : -compareResult
  })

  // Apply pagination after sorting
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilters={activeFilters}
          onAddFilter={(filter) => setActiveFilters([...activeFilters, filter])}
          onRemoveFilter={(id) => setActiveFilters(activeFilters.filter(f => f.id !== id))}
          onClearFilters={() => setActiveFilters([])}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BulkActions
            selectedIds={selectedIds}
            onMailSelected={() => {/* Implement mail action */}}
            onDeleteSelected={async () => {
              await Promise.all(selectedIds.map(handleDelete))
              setSelectedIds([])
            }}
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VisitReport />
          <TableExport data={shops} />
        </div>
      </div>

      <div className="block md:hidden">
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p>Showing {paginatedShops.length} of {sortedShops.length} shops</p>
            {selectedIds.length > 0 && (
              <p className="text-muted-foreground">
                {selectedIds.length} selected
              </p>
            )}
          </div>
          
          <MobileCardView 
            shops={paginatedShops}
            onVisitToggle={async (shop) => {
              await handleUpdate(shop, 'visited', !shop.visited)
            }}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      <div className="hidden md:block border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <CustomTableHeader 
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedAll={selectedIds.length === paginatedShops.length}
                onSelectAll={(checked) => {
                  setSelectedIds(
                    checked 
                      ? paginatedShops.map(shop => shop.id)
                      : []
                  )
                }}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShops.map((shop) => (
              <CustomTableRow
                key={shop.id}
                shop={shop}
                isSelected={selectedIds.includes(shop.id)}
                onSelect={(checked) => {
                  setSelectedIds(prev => 
                    checked 
                      ? [...prev, shop.id]
                      : prev.filter(id => id !== shop.id)
                  )
                }}
                onUpdate={(field, value) => handleUpdate(shop, field, value)}
                onDelete={() => handleDelete(shop.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={sortedShops.length}
        />
      </div>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/date-cell.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { 
  CalendarIcon, 
  X, 
  Check, 
  Calendar as CalendarIcon2,
  Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
  onRemove?: () => Promise<void>
  disabled?: boolean
  className?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  description?: string
  label?: string
}

export function DateCell({
  date,
  onUpdate,
  onRemove,
  disabled = false,
  className,
  showTime = false,
  minDate,
  maxDate,
  description,
  label
}: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const handleSelect = async (newDate: Date | undefined) => {
    if (!newDate || !isValid(newDate)) return

    try {
      setIsUpdating(true)
      await onUpdate(newDate)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return

    try {
      setIsUpdating(true)
      await onRemove()
      setShowConfirmDialog(false)
      setIsOpen(false)
      toast({
        title: "Success",
        description: "Date removed successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formattedDate = date ? format(date, "MM-dd-yyyy") : null
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={date ? "outline" : "ghost"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled || isUpdating}
          >
            <div className="flex items-center gap-2">
              {formattedDate ?? "Not set"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-3">
            {label && (
              <div className="font-medium">{label}</div>
            )}
            {description && (
              <div className="text-sm text-muted-foreground">
                {description}
              </div>
            )}
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={handleSelect}
              disabled={disabled || isUpdating || (date => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              })}
              initialFocus
            />
            {onRemove && date && (
              <div className="border-t pt-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={disabled || isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Date
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Confirm Remove Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Date</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this date? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper function to format distance to now 
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/delivery-cell.tsx
"use client"

import { CoffeeShop } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DELIVERY_FREQUENCIES } from "@/types/delivery"

interface DeliveryCellProps {
  shop: CoffeeShop
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  disabled?: boolean
}

export function DeliveryCell({ shop, onUpdate, disabled }: DeliveryCellProps) {
  return (
    <Select
      value={shop.delivery_frequency || undefined}
      onValueChange={(value) => onUpdate("delivery_frequency", value)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select frequency" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DELIVERY_FREQUENCIES).map(([key, value]) => (
          <SelectItem key={key} value={value}>
            {key.replace(/_/g, ' ').toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/editable-cell.tsx
// editable-cell.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Pencil, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | null;
  onUpdate: (value: string | null) => Promise<void>;
  type?: "text" | "number" | "instagram" | "email" | "manager" | "owners" | "notes" | "volume";
  className?: string;
}

export function EditableCell({ value, onUpdate, type = "text", className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(editValue || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === "notes" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        ) : (
          <Input
            type={type === "number" || type === "volume" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn("w-full", className)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        )}
        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-muted/50",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {type === "instagram" && value ? (
        <a
          href={`https://instagram.com/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @{value}
        </a>
      ) : type === "email" && value ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <span>{value || "-"}</span>
      )}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

interface DateCellProps {
  date: Date | null;
  onUpdate: (date: Date | null) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function DateCell({ date, onUpdate, onRemove }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newDate || null);
      setIsOpen(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onRemove();
      setIsOpen(false);
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[120px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={isUpdating}
        >
          {date ? format(date, "MMM d, yyyy") : "Not set"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {date && (
          <Button
            variant="destructive"
            size="sm"
            className="mt-2 w-full"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            Remove Date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface StarRatingProps {
  value: number;
  onUpdate: (value: number) => Promise<void>;
  className?: string;
}

export function StarRating({ value, onUpdate, className }: StarRatingProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newValue: number) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newValue);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            star <= value ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={() => handleUpdate(star)}
        />
      ))}
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/filter-configs.ts
// src/components/coffee-shops/table/filter-configs.ts

import { CoffeeShop } from "@prisma/client"

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'
export type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume' | 'priority' | 'email' | 'instagram' | 'phone' | 'stage'
export const DELIVERY_FREQUENCY_LABELS = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  THREE_WEEKS: "Every 3 weeks",
  FOUR_WEEKS: "Every 4 weeks",
  FIVE_WEEKS: "Every 5 weeks",
  SIX_WEEKS: "Every 6 weeks"
} as const

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterDataType
  operators: FilterOperator[]
  placeholder?: string
  help?: string
}

export const FILTER_CONFIGS: FilterConfig[] = [
  {
    field: 'title',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter shop name...'
  },
  {
    field: 'area',
    label: 'Area',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter area...'
  },
  {
    field: 'address',
    label: 'Address',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: 'Enter address...'
  },
  {
    field: 'priority',
    label: 'Priority',
    type: 'priority',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter priority (1-5)...',
    help: 'Priority ranges from 1 to 5'
  },
  {
    field: 'isPartner',
    label: 'Partner Status',
    type: 'boolean',
    operators: ['equals'],
  },
  {
    field: "stage",
    label: "Stage",
    type: "stage",
    operators: ["equals"],
    options: [
      { value: "PROSPECTING", label: "Prospecting" },
      { value: "QUALIFICATION", label: "Qualification" },
      { value: "MEETING", label: "Meeting" },
      { value: "PROPOSAL", label: "Proposal" },
      { value: "NEGOTIATION", label: "Negotiation" },
      { value: "PAUSED", label: "Paused" },
      { value: "WON", label: "Won" },
      { value: "LOST", label: "Lost" }
    ]
  },
  {
    field: 'manager_present',
    label: 'Manager',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter manager's name..."
  },
  {
    field: 'contact_name',
    label: 'Contact Name',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter contact's name..."
  },
  {
    field: 'contact_email',
    label: 'Contact Email',
    type: 'email',
    operators: ['contains', 'equals'],
    placeholder: 'Enter email address...'
  },
  {
    field: 'volume',
    label: 'Volume',
    type: 'volume',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter weekly volume...',
    help: 'Weekly volume in units'
  },
  {
    field: 'delivery_frequency',
    label: 'Delivery Frequency',
    type: 'select',
    operators: ['equals'],
    options: Object.entries(DELIVERY_FREQUENCY_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  },
  {
    field: 'first_delivery_week',
    label: 'First Delivery Week',
    type:  'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter week number...'
  },
  {
    field: 'first_visit',
    label: 'First Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'second_visit',
    label: 'Second Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'third_visit',
    label: 'Third Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'visited',
    label: 'Visit Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter rating (1-5)...',
    help: 'Rating ranges from 1 to 5'
  },
  {
    field: 'reviews',
    label: 'Reviews',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of reviews...'
  },
  {
    field: 'instagram',
    label: 'Instagram',
    type: 'instagram',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter Instagram handle...'
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of followers...'
  },
  {
    field: 'parlor_coffee_leads',
    label: 'Lead Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'notes',
    label: 'Notes',
    type: 'text',
    operators: ['contains'],
    placeholder: 'Search in notes...'
  }
]

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  between: 'Between',
  startsWith: 'Starts with'
}

export const FILTER_TYPE_CONFIGS = {
  text: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  number: {
    component: 'Input',
    props: {
      type: 'number'
    }
  },
  boolean: {
    component: 'Select',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
  },
  date: {
    component: 'DatePicker'
  },
  rating: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  volume: {
    component: 'Input',
    props: {
      type: 'number',
      min: 0
    }
  },
  priority: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  email: {
    component: 'Input',
    props: {
      type: 'email'
    }
  },
  instagram: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  phone: {
    component: 'Input',
    props: {
      type: 'tel'
    }
  }
} as const

// Helper functions for filter validation
export const validateFilterValue = (type: FilterDataType, value: any): boolean => {
  switch (type) {
    case 'rating':
    case 'priority':
      const num = Number(value)
      return !isNaN(num) && num >= 1 && num <= 5
    case 'volume':
    case 'number':
      return !isNaN(Number(value))
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'date':
      return !isNaN(Date.parse(value))
    default:
      return true
  }
}

export const formatFilterValue = (type: FilterDataType, value: any): any => {
  switch (type) {
    case 'rating':
    case 'priority':
    case 'volume':
    case 'number':
      return Number(value)
    case 'date':
      return new Date(value).toISOString()
    case 'boolean':
      return value === 'true'
    default:
      return value
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/filter-value-input.tsx
// src/components/coffee-shops/table/filter-value-input.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger, 
 SelectValue 
} from "@/components/ui/select"
import {
 Popover,
 PopoverContent,
 PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { FilterDataType } from "./filter-configs"

interface FilterValueInputProps {
 type: FilterDataType
 operator: string
 value: any
 onChange: (value: any) => void
 className?: string
 disabled?: boolean
 placeholder?: string
}

export function FilterValueInput({
 type,
 operator,
 value,
 onChange,
 className,
 disabled,
 placeholder
}: FilterValueInputProps) {
 const [isOpen, setIsOpen] = useState(false)

 if (type === 'boolean') {
   return (
     <Select
       value={String(value)}
       onValueChange={(val) => onChange(val === 'true')}
       disabled={disabled}
     >
       <SelectTrigger>
         <SelectValue placeholder="Select..." />
       </SelectTrigger>
       <SelectContent>
         <SelectItem value="true">Yes</SelectItem>
         <SelectItem value="false">No</SelectItem>
       </SelectContent>
     </Select>
   )
 }

 if (type === 'date') {
   if (operator === 'between') {
     return (
       <div className="space-y-2">
         <div className="flex items-center gap-2">
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.min && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.min ? format(value.min, "PPP") : "Start date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.min}
                 onSelect={(date) => 
                   onChange({ ...value, min: date })
                 }
                 disabled={disabled}
                 initialFocus
               />
             </PopoverContent>
           </Popover>
           <span>to</span>
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.max && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.max ? format(value.max, "PPP") : "End date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.max}
                 onSelect={(date) => 
                   onChange({ ...value, max: date })
                 }
                 disabled={(date) => 
                   value?.min ? date < value.min : false
                 }
                 initialFocus
               />
             </PopoverContent>
           </Popover>
         </div>
       </div>
     )
   }

   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <Button
           variant="outline"
           className={cn(
             "justify-start text-left font-normal",
             !value && "text-muted-foreground"
           )}
           disabled={disabled}
         >
           <CalendarIcon className="mr-2 h-4 w-4" />
           {value ? format(value, "PPP") : "Pick a date"}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-0">
         <Calendar
           mode="single"
           selected={value}
           onSelect={(date) => {
             onChange(date)
             setIsOpen(false)
           }}
           disabled={disabled}
           initialFocus
         />
       </PopoverContent>
     </Popover>
   )
 }

 if (operator === 'between') {
   return (
     <div className="space-y-2">
       <div>
         <Label>From</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.min || ''}
           onChange={(e) => onChange({ ...value, min: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
       <div>
         <Label>To</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.max || ''}
           onChange={(e) => onChange({ ...value, max: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
     </div>
   )
 }

 // Default text/number input
 return (
   <Input
     type={type === 'number' || type === 'volume' ? 'number' : 'text'}
     value={value || ''}
     onChange={(e) => onChange(e.target.value)}
     className={className}
     disabled={disabled}
     placeholder={placeholder}
   />
 )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/index.tsx
export { CoffeeShopsTable } from './coffee-shops-table';
export { TableHeader } from './table-header';
export { TableRow } from './table-row';
export { TablePagination } from './table-pagination';
export { TableFilters } from './table-filters';
export { BulkActions } from './bulk-actions';
export { SortHeader } from './sort-header';
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/mobile-card-view.tsx
"use client";

import { useState } from "react";
import { CoffeeShop } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EditableCell, DateCell, StarRating } from "./editable-cell";
import Link from "next/link";

interface MobileCardViewProps {
 shops: CoffeeShop[];
 onVisitToggle: (shop: CoffeeShop) => Promise<void>;
 onDelete: (id: string) => void;
 onUpdate: (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => Promise<void>;
}

export function MobileCardView({ shops, onVisitToggle, onDelete, onUpdate }: MobileCardViewProps) {
 return (
   <div className="space-y-4">
     {shops.map((shop) => (
       <Card key={shop.id}>
         <CardHeader>
           <Link 
             href={`/dashboard/coffee-shops/${shop.id}`}
             className="hover:underline cursor-pointer"
           >
             <CardTitle>{shop.title}</CardTitle>
           </Link>
           <CardDescription>{shop.area}</CardDescription>
         </CardHeader>
         <CardContent>
           <Accordion type="single" collapsible>
             <AccordionItem value="item-1">
               <AccordionTrigger>
                 <div className="flex items-center justify-between">
                   <div>Details</div>
                   <Edit className="h-4 w-4" />
                 </div>
               </AccordionTrigger>
               <AccordionContent>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div>Priority</div>
                     <StarRating
                       value={shop.priority || 0}
                       onUpdate={(value) => onUpdate(shop, "priority", value)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Partner Status</div>
                     <Badge
                       variant={shop.isPartner ? "success" : "secondary"}
                       className="cursor-pointer"
                       onClick={() => onUpdate(shop, "isPartner", !shop.isPartner)}
                     >
                       {shop.isPartner ? "Partner" : "Not Partner"}
                     </Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Manager Present</div>
                     <EditableCell
                       value={shop.manager_present}
                       onUpdate={(value) => onUpdate(shop, "manager_present", value)}
                       type="manager"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Contact Name</div>
                     <EditableCell
                       value={shop.contact_name}
                       onUpdate={(value) => onUpdate(shop, "contact_name", value)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Contact Email</div>
                     <EditableCell
                       value={shop.contact_email}
                       onUpdate={(value) => onUpdate(shop, "contact_email", value)}
                       type="email"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Owners</div>
                     <EditableCell
                       value={shop.owners.map((owner) => `${owner.name} (${owner.email})`).join(", ") || null}
                       onUpdate={async (value) => {
                         const owners = value
                           ? value
                               .split(",")
                               .map((owner) => {
                                 const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
                                 if (match) {
                                   return {
                                     name: match[1].trim(),
                                     email: match[2].trim(),
                                   };
                                 }
                                 return null;
                               })
                               .filter(Boolean)
                           : [];
                         await onUpdate(shop, "owners", owners);
                       }}
                       type="owners"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Volume</div>
                     <EditableCell
                       value={shop.volume?.toString() || null}
                       onUpdate={(value) => onUpdate(shop, "volume", value)}
                       type="volume"
                     />
                   </div>
                   <div>
                     <div>ARR</div>
                     <div>
                       {shop.volume ? (
                         <span>${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}</span>
                       ) : (
                         "-"
                       )}
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <div>First Visit</div>
                     <DateCell
                       date={shop.first_visit ? new Date(shop.first_visit) : null}
                       onUpdate={(date) => onUpdate(shop, "first_visit", date?.toISOString() || null)}
                       onRemove={() => onUpdate(shop, "first_visit", null)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Second Visit</div>
                     <DateCell
                       date={shop.second_visit ? new Date(shop.second_visit) : null}
                       onUpdate={(date) => onUpdate(shop, "second_visit", date?.toISOString() || null)}
                       onRemove={() => onUpdate(shop, "second_visit", null)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Third Visit</div>
                     <DateCell
                       date={shop.third_visit ? new Date(shop.third_visit) : null}
                       onUpdate={(date) => onUpdate(shop, "third_visit", date?.toISOString() || null)}
                       onRemove={() => onUpdate(shop, "third_visit", null)}
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Rating</div>
                     <EditableCell
                       value={shop.rating?.toString()}
                       onUpdate={(value) => onUpdate(shop, "rating", value ? parseFloat(value) : null)}
                       type="number"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Reviews</div>
                     <EditableCell
                       value={shop.reviews?.toString()}
                       onUpdate={(value) => onUpdate(shop, "reviews", value ? parseInt(value) : null)}
                       type="number"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Instagram</div>
                     <EditableCell
                       value={shop.instagram || ""}
                       onUpdate={(value) => onUpdate(shop, "instagram", value)}
                       type="instagram"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Followers</div>
                     <EditableCell
                       value={shop.followers?.toString()}
                       onUpdate={(value) => onUpdate(shop, "followers", value ? parseInt(value) : null)}
                       type="number"
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>Lead Status</div>
                     <Badge
                       variant={shop.parlor_coffee_leads ? "warning" : "default"}
                       className="cursor-pointer"
                       onClick={() => onUpdate(shop, "parlor_coffee_leads", !shop.parlor_coffee_leads)}
                     >
                       {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                     </Badge>
                   </div>
                   <div>
                     <div>Notes</div>
                     <EditableCell
                       value={shop.notes}
                       onUpdate={(value) => onUpdate(shop, "notes", value)}
                       type="notes"
                     />
                   </div>
                 </div>
               </AccordionContent>
             </AccordionItem>
           </Accordion>
           <div className="mt-4 flex items-center justify-between">
             <div>Visit Status</div>
             <Badge
               variant={shop.visited ? "success" : "default"}
               className="cursor-pointer"
               onClick={() => onUpdate(shop, "visited", !shop.visited)}
             >
               {shop.visited ? "Visited" : "Not Visited"}
             </Badge>
           </div>
         </CardContent>
         <CardContent className="flex justify-end">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm">
                 <MoreHorizontal className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem asChild>
                 <Link 
                   href={`/dashboard/coffee-shops/${shop.id}`}
                   className="cursor-pointer"
                 >
                   <Edit className="mr-2 h-4 w-4" />
                   View Details
                 </Link>
               </DropdownMenuItem>
               <DropdownMenuItem
                 className="text-red-600"
                 onClick={() => onDelete(shop.id)}
               >
                 <X className="mr-2 h-4 w-4" />
                 Delete
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </CardContent>
       </Card>
     ))}
   </div>
 );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/sort-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface SortHeaderProps {
  label: string
  sortKey: keyof CoffeeShop
  currentSort: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
}

export function SortHeader({ 
  label,
  sortKey, 
  currentSort,
  onSort 
}: SortHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {label}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
      >
        {currentSort.key === sortKey ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </Button>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/stage-cell.tsx
"use client"

import { Stage } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "bg-gray-500 text-white hover:bg-gray-600" 
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "bg-yellow-500 text-white hover:bg-yellow-600"
  },
  MEETING: { 
    label: "Meeting", 
    className: "bg-blue-500 text-white hover:bg-blue-600"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "bg-purple-500 text-white hover:bg-purple-600"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "bg-orange-500 text-white hover:bg-orange-600"
  },
  PAUSED: { 
    label: "Paused", 
    className: "bg-slate-500 text-white hover:bg-slate-600"
  },
  WON: { 
    label: "Won", 
    className: "bg-green-500 text-white hover:bg-green-600"
  },
  LOST: { 
    label: "Lost", 
    className: "bg-red-500 text-white hover:bg-red-600"
  }
} as const

interface StageCellProps {
  stage: Stage
  onUpdate: (stage: Stage) => Promise<void>
  disabled?: boolean
}

export function StageCell({ stage, onUpdate, disabled }: StageCellProps) {
  const config = STAGE_CONFIG[stage]

  if (!config) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full text-xs font-semibold",
            config.className
          )}
          disabled={disabled}
        >
          {config.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(STAGE_CONFIG).map(([stageKey, { label, className }]) => (
          <DropdownMenuItem
            key={stageKey}
            onClick={() => onUpdate(stageKey as Stage)}
            disabled={disabled || stageKey === stage}
          >
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              className
            )}>
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/star-rating.tsx
"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onUpdate: (value: number) => void
  className?: string
  disabled?: boolean
}

export function StarRating({ 
  value, 
  onUpdate, 
  className,
  disabled 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  return (
    <div 
      className={cn(
        "flex items-center gap-1", 
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            (hoverValue || value) >= star 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => {
            if (!disabled) {
              onUpdate(star)
            }
          }}
          onMouseEnter={() => {
            if (!disabled) {
              setHoverValue(star)
            }
          }}
          onMouseLeave={() => {
            if (!disabled) {
              setHoverValue(null)
            }
          }}
        />
      ))}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-export.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileDown, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import { CoffeeShop } from "@prisma/client";

interface TableExportProps {
  data: CoffeeShop[];
}

// Define available columns and their labels
const AVAILABLE_COLUMNS = [
  { key: 'title', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'area', label: 'Area' },
  { key: 'website', label: 'Website' },
  { key: 'manager_present', label: 'Manager Present' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'visited', label: 'Visited' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'followers', label: 'Followers' },
  { key: 'store_doors', label: 'Store Doors' },
  { key: 'volume', label: 'Volume' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'price_type', label: 'Price Type' },
  { key: 'type', label: 'Type' },
  { key: 'types', label: 'Types' },
  { key: 'first_visit', label: 'First Visit' },
  { key: 'second_visit', label: 'Second Visit' },
  { key: 'third_visit', label: 'Third Visit' },
  { key: 'notes', label: 'Notes' },
  { key: 'priority', label: 'Priority' },
  { key: 'isPartner', label: 'Is Partner' },
  { key: 'stage', label: 'Stage' },
  { key: 'service_options', label: 'Service Options' },
  { key: 'hours', label: 'Hours' },
  { key: 'quality_score', label: 'Quality Score' },
  { key: 'parlor_coffee_leads', label: 'Parlor Coffee Leads' },
] as const;

export function TableExport({ data }: TableExportProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['title', 'address', 'area']);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(current => {
      const newSelection = new Set(current);
      if (newSelection.has(columnKey)) {
        newSelection.delete(columnKey);
      } else {
        newSelection.add(columnKey);
      }
      return Array.from(newSelection);
    });
  };

  const handleGenerateExport = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one column to export",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format data for export
      const exportData = data.map(shop => {
        const row: Record<string, any> = {};
        selectedColumns.forEach(column => {
          let value = shop[column];
          
          // Format specific fields
          if (column === 'first_visit' || column === 'second_visit' || column === 'third_visit') {
            value = value ? new Date(value).toLocaleDateString() : '';
          } else if (column === 'types') {
            value = Array.isArray(value) ? value.join(', ') : '';
          } else if (column === 'isPartner' || column === 'visited' || column === 'parlor_coffee_leads') {
            value = value ? 'Yes' : 'No';
          } else if (column === 'service_options') {
            value = value ? JSON.stringify(value) : '';
          } else if (column === 'volume' && value) {
            const arr = ((parseFloat(value) * 52) * 18);
            row['ARR'] = arr ? `$${arr.toLocaleString()}` : '';
          }
          
          row[AVAILABLE_COLUMNS.find(col => col.key === column)?.label || column] = value || '';
        });
        return row;
      });

      // Generate CSV
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `coffee-shops-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Table exported successfully"
      });
    } catch (error) {
      console.error('Error exporting table:', error);
      toast({
        title: "Error",
        description: "Failed to export table",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[150px] justify-between">
            <FileDown className="mr-2 h-4 w-4" />
            <span>Select Columns</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {AVAILABLE_COLUMNS.map((column) => (
                    <CommandItem
                      key={column.key}
                      onSelect={() => toggleColumn(column.key)}
                      className="flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedColumns.includes(column.key)}
                        className="mr-2"
                        onCheckedChange={() => toggleColumn(column.key)}
                      />
                      <span>{column.label}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleGenerateExport}
        size="sm"
        disabled={selectedColumns.length === 0 || isLoading}
      >
        {isLoading ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export Table
          </>
        )}
      </Button>
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-filters.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search, Plus } from "lucide-react"
import { FILTER_CONFIGS, OPERATOR_LABELS } from "./filter-configs"
import { FilterValueInput } from "./filter-value-input"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShop } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { SavedFiltersMenu } from "./saved-filters/saved-filters-menu"

interface TableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeFilters: Array<{
    id: string
    field: keyof CoffeeShop
    operator: string
    value: any
    label: string
    type: string
  }>
  onAddFilter: (filter: any) => void
  onRemoveFilter: (id: string) => void
  onClearFilters: () => void
  onLoadSavedFilters?: (filters: any[]) => void
  filterConfigs?: typeof FILTER_CONFIGS
}

export function TableFilters({
  searchTerm,
  onSearchChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onLoadSavedFilters,
  filterConfigs = FILTER_CONFIGS
}: TableFiltersProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [tempFilterValue, setTempFilterValue] = useState<any>(null)
  const { toast } = useToast()

  const handleAddFilter = (field: keyof CoffeeShop, operator: string, type: string) => {
    if (!tempFilterValue) {
      toast({
        title: "Error",
        description: "Please enter a filter value",
        variant: "destructive"
      })
      return
    }

    const config = filterConfigs.find(c => c.field === field)
    if (!config) return

    const newFilter = {
      id: crypto.randomUUID(),
      field,
      operator,
      value: tempFilterValue,
      type,
      label: `${config.label} ${OPERATOR_LABELS[operator]} ${
        typeof tempFilterValue === 'object'
          ? `${tempFilterValue.min} - ${tempFilterValue.max}`
          : tempFilterValue
      }`
    }

    onAddFilter(newFilter)
    setTempFilterValue(null)
    setFilterMenuOpen(false)
  }

  const handleLoadSavedFilters = (filters: any[]) => {
    onClearFilters()
    filters.forEach(filter => onAddFilter(filter))
    if (onLoadSavedFilters) {
      onLoadSavedFilters(filters)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coffee shops..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
              
              {filterConfigs.map((config) => (
                <DropdownMenuSub key={config.field}>
                  <DropdownMenuSubTrigger>
                    {config.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {config.operators.map((operator) => (
                      <DropdownMenuSub key={operator}>
                        <DropdownMenuSubTrigger>
                          {OPERATOR_LABELS[operator]}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="p-2">
                          <div className="space-y-2">
                            <FilterValueInput
                              type={config.type}
                              operator={operator}
                              value={tempFilterValue}
                              onChange={setTempFilterValue}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddFilter(config.field, operator, config.type)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Filter
                              </Button>
                            </div>
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}

              {activeFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={onClearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Saved Filters Menu */}
          <SavedFiltersMenu
            activeFilters={activeFilters}
            onLoadFilter={handleLoadSavedFilters}
          />
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-2 pl-2 pr-1 py-1"
              >
              <span>{filter.label}</span>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-5 w-5 p-0 hover:bg-transparent"
                 onClick={() => onRemoveFilter(filter.id)}
               >
                 <X className="h-3 w-3" />
               </Button>
             </Badge>
           ))}
           <Button
             variant="ghost"
             size="sm"
             className="text-muted-foreground"
             onClick={onClearFilters}
           >
             Clear all
           </Button>
         </div>
       )}
     </div>
   </Card>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-header.tsx
"use client"

import { TableHead } from "@/components/ui/table"
import { SortHeader } from "./sort-header"
import { CoffeeShop } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"

interface TableHeaderProps {
  sortConfig: {
    key: keyof CoffeeShop | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: keyof CoffeeShop) => void
  selectedAll?: boolean
  onSelectAll?: (checked: boolean) => void
}

export function TableHeader({ 
  sortConfig, 
  onSort,
  selectedAll,
  onSelectAll
}: TableHeaderProps) {
  return (
    <>
      <TableHead className="w-12">
        <Checkbox 
          checked={selectedAll}
          onCheckedChange={onSelectAll}
        />
      </TableHead>
      
      <TableHead>
        <SortHeader 
          label="Name"
          sortKey="title"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Website"
          sortKey="website"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Area"
          sortKey="area"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Address"
          sortKey="address"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Priority"
          sortKey="priority"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Partner Status</TableHead>
      <TableHead>
        <SortHeader 
          label="Stage"
          sortKey="stage"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>
      <TableHead>
        <SortHeader 
          label="Manager Present"
          sortKey="manager_present"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Name"
          sortKey="contact_name"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Contact Email"
          sortKey="contact_email"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Owners"
          sortKey="owners"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Volume"
          sortKey="volume"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>


      <TableHead>
        <SortHeader 
          label="Delivery Frequency"
          sortKey="delivery_frequency"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="First Delivery"
          sortKey="first_delivery_week"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>ARR</TableHead>

      <TableHead>
        <SortHeader 
          label="First Visit"
          sortKey="first_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Second Visit"
          sortKey="second_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Third Visit"
          sortKey="third_visit"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Status</TableHead>

      <TableHead>
        <SortHeader 
          label="Rating"
          sortKey="rating"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Reviews"
          sortKey="reviews"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Instagram"
          sortKey="instagram"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>
        <SortHeader 
          label="Followers"
          sortKey="followers"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead>Lead</TableHead>

      <TableHead>
        <SortHeader 
          label="Notes"
          sortKey="notes"
          currentSort={sortConfig}
          onSort={onSort}
        />
      </TableHead>

      <TableHead className="w-[100px]">Actions</TableHead>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-pagination.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {Math.min(itemsPerPage * currentPage, totalItems)} of {totalItems} results
      </p>
      <div className="flex items-center justify-end gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/table-row.tsx
"use client"

import { useState } from "react"
import { TableCell, TableRow as UITableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Shield,
  Edit 
} from "lucide-react"
import Link from "next/link"
import { EditableCell } from "../editable-cell"
import { DateCell } from "./date-cell"
import { StarRating } from "./star-rating"
import { CoffeeShop } from "@prisma/client"
import { StageCell } from "./stage-cell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateARR } from "./utils"
import { DeliveryCell } from "./delivery-cell"

interface TableRowProps {
  shop: CoffeeShop
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onUpdate: (field: keyof CoffeeShop, value: any) => Promise<void>
  onDelete: () => void
}

export function TableRow({ 
  shop: initialShop, 
  isSelected, 
  onSelect,
  onUpdate,
  onDelete
}: TableRowProps) {
  const [loading, setLoading] = useState(false)
  const [shop, setShop] = useState(initialShop)

  const handleUpdate = async (field: keyof CoffeeShop, value: any) => {
    setLoading(true)
    try {
      // Validate delivery frequency
      if (field === 'delivery_frequency') {
        const validFrequencies = ["WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"];
        if (value && !validFrequencies.includes(value)) {
          toast({
            title: "Error",
            description: "Invalid delivery frequency",
            variant: "destructive"
          });
          return;
        }
      }
  
      // Validate first delivery week
      if (field === 'first_delivery_week') {
        const weekNum = parseInt(value);
        if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
          toast({
            title: "Error",
            description: "First delivery week must be between 1 and 53",
            variant: "destructive"
          });
          return;
        }
  
        // Ensure delivery frequency is set when setting first delivery week
        if (!shop.delivery_frequency) {
          // Update both fields together
          const updatedData = {
            first_delivery_week: weekNum,
            delivery_frequency: "WEEKLY" // Default to weekly
          };
  
          setShop(prev => ({
            ...prev,
            ...updatedData
          }));
  
          await onUpdate('first_delivery_week', weekNum);
          await onUpdate('delivery_frequency', "WEEKLY");
          
          toast({
            description: "Delivery schedule set to weekly by default"
          });
          
          return;
        }
      }
  
      // Optimistically update the local state
      setShop(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Make the API call
      await onUpdate(field, value);
  
      // Show success message for delivery-related updates
      if (field === 'delivery_frequency' || field === 'first_delivery_week') {
        toast({
          description: `${field.split('_').join(' ')} updated successfully`
        });
      }
  
    } catch (error) {
      // Revert on error
      setShop(prev => ({
        ...prev,
        [field]: initialShop[field]
      }));
  
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive"
      });
  
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <UITableRow>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Link
          href={`/dashboard/coffee-shops/${shop.id}`}
          className="font-medium hover:underline"
        >
          {shop.title}
        </Link>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.website}
          onUpdate={(value) => handleUpdate('website', value)}
          type="url"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.area}
          onUpdate={(value) => handleUpdate('area', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.address}
          onUpdate={(value) => handleUpdate('address', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2 group cursor-pointer">
          <StarRating
            value={shop.priority || 0}
            onUpdate={(value) => handleUpdate('priority', value)}
            className="group-hover:opacity-100"
            disabled={loading}
          />
        </div>
      </TableCell>

      <TableCell>
        <Badge 
          variant={shop.isPartner ? "success" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleUpdate('isPartner', !shop.isPartner)}
        >
          {shop.isPartner ? (
            <><Shield className="h-4 w-4 mr-1" /> Partner</>
          ) : "Not Partner"}
        </Badge>
      </TableCell>
      <TableCell>
      <StageCell
        stage={shop.stage}
        onUpdate={(value) => handleUpdate('stage', value)}
        disabled={loading}
      />
    </TableCell>

      <TableCell>
        <EditableCell
          value={shop.manager_present}
          onUpdate={(value) => handleUpdate('manager_present', value)}
          type="manager"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_name}
          onUpdate={(value) => handleUpdate('contact_name', value)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.contact_email}
          onUpdate={(value) => handleUpdate('contact_email', value)}
          type="email"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.owners.map(owner => `${owner.name} (${owner.email})`).join(', ') || null}
          onUpdate={async (value) => {
            const owners = value ? value.split(',').map(owner => {
              const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
              if (match) {
                return {
                  name: match[1].trim(),
                  email: match[2].trim()
                };
              }
              return null;
            }).filter(Boolean) : [];
            
            await handleUpdate('owners', owners);
          }}
          type="owners"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell 
          value={shop.volume?.toString() || null}
          onUpdate={(value) => handleUpdate('volume', value)}
          type="volume"
          disabled={loading}
        />
      </TableCell>
      <TableCell>
        <DeliveryCell 
          shop={shop}
          onUpdate={handleUpdate}
          disabled={loading}
        />
      </TableCell>



      <TableCell>
        <EditableCell
          value={shop.first_delivery_week?.toString()}
          onUpdate={(value) => handleUpdate("first_delivery_week", value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

    <TableCell>
      {shop.volume ? (
        <div className="text-sm">
          ${calculateARR(shop.volume, shop.delivery_frequency).toLocaleString()}
        </div>
      ) : "-"}
    </TableCell>

      <TableCell>
        <DateCell
          date={shop.first_visit ? new Date(shop.first_visit) : null}
          onUpdate={(date) => handleUpdate('first_visit', date)}
          onRemove={() => handleUpdate('first_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.second_visit ? new Date(shop.second_visit) : null}
          onUpdate={(date) => handleUpdate('second_visit', date)}
          onRemove={() => handleUpdate('second_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DateCell
          date={shop.third_visit ? new Date(shop.third_visit) : null}
          onUpdate={(date) => handleUpdate('third_visit', date)}
          onRemove={() => handleUpdate('third_visit', null)}
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.visited ? "success" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('visited', !shop.visited)}
        >
          {shop.visited ? "Visited" : "Not Visited"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.rating?.toString()}
          onUpdate={(value) => handleUpdate('rating', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.reviews?.toString()}
          onUpdate={(value) => handleUpdate('reviews', value ? parseFloat(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.instagram}
          onUpdate={(value) => handleUpdate('instagram', value)}
          type="instagram"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.followers?.toString()}
          onUpdate={(value) => handleUpdate('followers', value ? parseInt(value) : null)}
          type="number"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <Badge
          variant={shop.parlor_coffee_leads ? "warning" : "default"}
          className="cursor-pointer"
          onClick={() => handleUpdate('parlor_coffee_leads', !shop.parlor_coffee_leads)}
        >
          {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
        </Badge>
      </TableCell>

      <TableCell>
        <EditableCell
          value={shop.notes}
          onUpdate={(value) => handleUpdate('notes', value)}
          type="notes"
          disabled={loading}
        />
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/coffee-shops/${shop.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={onDelete}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </UITableRow>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/types.ts
import { CoffeeShop } from "@prisma/client"

export type SortConfig = {
  key: keyof CoffeeShop | null
  direction: 'asc' | 'desc'
}

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

export type FilterType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume'
type DeliveryFrequency = 'WEEKLY' | 'BIWEEKLY';

export interface Filter {
  id: string
  field: keyof CoffeeShop
  operator: FilterOperator
  value: any
  type: FilterType
}

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterType
  operators: FilterOperator[]
}

export const STAGE_COLORS = {
  PROSPECTING: "blue",
  QUALIFICATION: "yellow",
  MEETING: "purple",
  PROPOSAL: "cyan",
  NEGOTIATION: "orange",
  PAUSED: "gray",
  WON: "green",
  LOST: "red"
} as const

export const STAGE_LABELS = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  MEETING: "Meeting",
  PROPOSAL: "Proposal", 
  NEGOTIATION: "Negotiation",
  PAUSED: "Paused",
  WON: "Won",
  LOST: "Lost"
} as const

export const DELIVERY_FREQUENCY = {
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  THREE_WEEKS: "THREE_WEEKS",
  FOUR_WEEKS: "FOUR_WEEKS",
  FIVE_WEEKS: "FIVE_WEEKS",
  SIX_WEEKS: "SIX_WEEKS"
} as const

export const DELIVERY_FREQUENCY_LABELS = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  THREE_WEEKS: "Every 3 weeks",
  FOUR_WEEKS: "Every 4 weeks",
  FIVE_WEEKS: "Every 5 weeks",
  SIX_WEEKS: "Every 6 weeks"
} as const


interface VolumeData {
  amount: number;
  frequency: DeliveryFrequency;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/utils.ts
// src/components/coffee-shops/table/utils.ts

import { CoffeeShop } from "@prisma/client"
import { SortConfig, Filter } from "./types"

/**
 * Sort shops based on sort configuration
 */
export function sortShops(shops: CoffeeShop[], sortConfig: SortConfig): CoffeeShop[] {
  if (!sortConfig.key) return shops

  return [...shops].sort((a, b) => {
    const aVal = a[sortConfig.key!]
    const bVal = b[sortConfig.key!]

    // Special handling for date fields with null values
    const dateFields = ['first_visit', 'second_visit', 'third_visit']
    if (dateFields.includes(sortConfig.key)) {
      // Move null/undefined values to the bottom regardless of sort direction
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move 'a' to the bottom
      if (!bVal) return -1 // Move 'b' to the bottom
      
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()
      
      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1
      
      return sortConfig.direction === 'asc'
        ? aDate - bDate
        : bDate - aDate
    }

 

    // Default string comparison
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
}

// Rest of the utils.ts file remains the same...

/**
 * Search shops based on search term
 */
export function searchShops(shops: CoffeeShop[], searchTerm: string): CoffeeShop[] {
  if (!searchTerm) return shops

  const normalizedSearch = searchTerm.toLowerCase().trim()
  const searchFields: (keyof CoffeeShop)[] = [
    'title',
    'area',
    'address',
    'manager_present',
    'contact_name',
    'contact_email',
    'instagram',
    'notes'
  ]

  return shops.filter(shop => {
    // Search in main fields
    const mainFieldsMatch = searchFields.some(field => {
      const value = shop[field]
      return value && String(value).toLowerCase().includes(normalizedSearch)
    })

    if (mainFieldsMatch) return true

    // Search in owners
    const ownersMatch = shop.owners?.some(owner => 
      owner.name.toLowerCase().includes(normalizedSearch) ||
      owner.email.toLowerCase().includes(normalizedSearch)
    )

    return ownersMatch
  })
}

/**
 * Calculate ARR (Annual Recurring Revenue)
 */
export function calculateARR(volume: string | number | null, frequency: string | null): number {
  if (!volume) return 0
  const weeklyVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  
  // Calculate number of deliveries per year based on frequency
  let deliveriesPerYear = 52; // Default to weekly
  switch (frequency) {
    case 'WEEKLY':
      deliveriesPerYear = 52;
      break;
    case 'BIWEEKLY':
      deliveriesPerYear = 26;
      break;
    case 'THREE_WEEKS':
      deliveriesPerYear = 17;
      break;
    case 'FOUR_WEEKS':
      deliveriesPerYear = 13;
      break;
    case 'FIVE_WEEKS':
      deliveriesPerYear = 10;
      break;
    case 'SIX_WEEKS':
      deliveriesPerYear = 9;
      break;
  }

  return (weeklyVolume * deliveriesPerYear) * 18;
}

/**
 * Format ARR for display
 */
export function formatARR(volume: string | number | null): string {
  const arr = calculateARR(volume)
  return arr ? `$${arr.toLocaleString()}` : '-'
}

/**
 * Parse owner string into owner objects
 */
export function parseOwners(ownerString: string): Array<{ name: string; email: string }> {
  if (!ownerString) return []

  return ownerString
    .split(',')
    .map(owner => {
      const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/)
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim()
        }
      }
      return null
    })
    .filter((owner): owner is { name: string; email: string } => owner !== null)
}

/**
 * Format owners for display
 */
export function formatOwners(owners: Array<{ name: string; email: string }>): string {
  return owners.map(owner => `${owner.name} (${owner.email})`).join(', ')
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/visit-reports.tsx
// src/components/coffee-shops/table/visit-report.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Download, Calendar as CalendarIcon, Loader2, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';

export function VisitReport() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        ...(endDate && { endDate: endDate.toISOString() })
      });

      const response = await fetch(`/api/coffee-shops/reports/visits?${params}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `visit-report-${format(startDate, 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Report downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            disabled={(date) => startDate ? date < startDate : false}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button 
            onClick={handleGenerateReport}
            size="sm"
            disabled={!startDate || isLoading}
            className="min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Visits
              </>
            )}
          </Button>
        </HoverCardTrigger>
      </HoverCard>
    </div>
  );
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/index.ts
export * from './saved-filters-menu';
export * from './types';
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/saved-filters-menu.tsx
"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Filter, Save, Star, Trash2, BookMarked } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SavedFilter {
  id: string
  name: string
  filters: any[]
  isDefault: boolean
}

interface SavedFiltersMenuProps {
  activeFilters: any[]
  onLoadFilter: (filters: any[]) => void
  disabled?: boolean
}

export function SavedFiltersMenu({
  activeFilters,
  onLoadFilter,
  disabled = false
}: SavedFiltersMenuProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load saved filters
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  // Load default filter if exists
  useEffect(() => {
    const defaultFilter = savedFilters.find(filter => filter.isDefault)
    if (defaultFilter && activeFilters.length === 0) {
      onLoadFilter(defaultFilter.filters)
    }
  }, [savedFilters, activeFilters.length, onLoadFilter])

  const handleSave = async () => {
    if (!saveName) {
      toast({
        title: "Error",
        description: "Please enter a name for your filter",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          filters: activeFilters,
          isDefault
        })
      })

      if (!response.ok) throw new Error('Failed to save filter')

      const savedFilter = await response.json()
      setSavedFilters(prev => [savedFilter, ...prev])
      setShowSaveDialog(false)
      setSaveName("")
      setIsDefault(false)

      toast({
        title: "Success",
        description: "Filter saved successfully"
      })
    } catch (error) {
      console.error('Error saving filter:', error)
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete filter')

      setSavedFilters(prev => prev.filter(filter => filter.id !== id))
      
      toast({
        title: "Success",
        description: "Filter deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <BookMarked className="h-4 w-4" />
            Saved Filters
            {savedFilters.length > 0 && (
              <Badge variant="secondary">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
          
          {savedFilters.length > 0 ? (
            <>
              {savedFilters.map(filter => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => onLoadFilter(filter.filters)}
                >
                  <span className="flex-1">{filter.name}</span>
                  {filter.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 ml-2" />
                  )}
                  <Trash2
                    className="h-4 w-4 text-destructive ml-2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(filter.id)
                    }}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuItem disabled>
              No saved filters
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            disabled={activeFilters.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Filter Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for your filter"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="default">Set as default filter</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/coffee-shops/table/saved-filters/types.ts
export interface SavedFilter {
  id: string
  name: string
    filters: Filter[]
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Filter {
  id: string
  field: string
  operator: string
  value: any
  type: string
  label: string
}

export interface SavedFilterInput {
  name: string
  filters: Filter[]
  isDefault?: boolean
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { revalidatePath } from "next/cache"
import { Stage } from "@prisma/client"
import { isValidDeliveryFrequency } from "@/types/delivery"

// Helper function to calculate stage
function calculateStage(shop: { isPartner?: boolean; visited?: boolean }): Stage {
  if (shop.isPartner) return "WON"
  if (shop.visited) return "QUALIFICATION"
  return "PROSPECTING"
}

const DELIVERY_FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "THREE_WEEKS",
  "FOUR_WEEKS",
  "FIVE_WEEKS",
  "SIX_WEEKS"
] as const



function parseNumericFields(data: any) {
  return {
    ...data,
    followers: data.followers ? parseInt(data.followers) : null,
    volume: data.volume ? parseFloat(data.volume) : null,
    rating: data.rating ? parseFloat(data.rating) : null,
    reviews: data.reviews ? parseInt(data.reviews) : null,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    priority: data.priority ? parseInt(data.priority) : 0,
    first_delivery_week: data.first_delivery_week ? parseInt(data.first_delivery_week) : null
  }
}
// Helper function to clean company data
function cleanCompanyData(data: any) {
  if (!data.company_data) return null
  
  return {
    size: data.company_data.size || null,
    industry: data.company_data.industry || null,
    founded_in: data.company_data.founded_in || null,
    description: data.company_data.description || null,
    linkedin: data.company_data.linkedin || null
  }
}

export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Get and validate coffee shop data
    const data = await request.json()
    
    // 4. Parse numeric values and clean data
    const parsedData = parseNumericFields(data)
    const companyData = cleanCompanyData(data)
    
    // Ensure visited is true if first_visit is set
    if (parsedData.first_visit) {
      parsedData.visited = true
    }
    
    // Calculate initial stage based on first visit
    const initialStage = parsedData.first_visit ? "QUALIFICATION" : calculateStage({
      isPartner: parsedData.isPartner,
      visited: parsedData.visited
    })

    // 5. Create the coffee shop with all necessary fields
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: parsedData.title,
        address: parsedData.address,
        website: parsedData.website || null,
        manager_present: parsedData.manager_present || null,
        contact_name: parsedData.contact_name || null,
        contact_email: parsedData.contact_email || null,
        phone: parsedData.phone || null,
        visited: parsedData.visited || false,
        instagram: parsedData.instagram || null,
        followers: parsedData.followers,
        store_doors: parsedData.store_doors || null,
        volume: parsedData.volume,
        rating: parsedData.rating,
        reviews: parsedData.reviews,
        price_type: parsedData.price_type || null,
        type: parsedData.type || null,
        types: parsedData.types || [],
        service_options: parsedData.service_options || null,
        hours: parsedData.hours || null,
        operating_hours: parsedData.operating_hours || null,
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
        area: parsedData.area || null,
        is_source: parsedData.is_source || false,
        parlor_coffee_leads: parsedData.parlor_coffee_leads || false,
        notes: parsedData.notes || null,
        priority: parsedData.priority || 0,
        stage: parsedData.stage || initialStage,
        userId: user.id,
        company_data: companyData,
        owners: parsedData.owners ? {
          create: parsedData.owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: parsedData.people ? {
          create: parsedData.people.map((person: any) => ({
            ...person,
            userId: user.id
          }))
        } : undefined
      }
    })

    console.log("[COFFEE_SHOPS_POST] Created coffee shop:", coffeeShop)
    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(coffeeShop, { status: 201 })

  } catch (error) {
    console.error("[COFFEE_SHOPS_POST] Error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to create coffee shop" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase()
    const area = searchParams.get('area')
    const isPartner = searchParams.get('isPartner') === 'true'
    const visited = searchParams.get('visited') === 'true'
    const stage = searchParams.get('stage') as Stage | null

    // Build where clause
    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { area: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        area ? { area: { equals: area } } : {},
        isPartner ? { isPartner: true } : {},
        visited ? { visited: true } : {},
        stage ? { stage: stage } : {},
      ]
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      where,
      include: {
        owners: true,
        people: true
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(coffeeShops)
  } catch (error) {
    console.error("[COFFEE_SHOPS_GET] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, owners, people, domainEmails, ...updateData } = data

    // Validate delivery frequency if present
    if (updateData.delivery_frequency) {
      if (!isValidDeliveryFrequency(updateData.delivery_frequency)) {
        return NextResponse.json(
          { error: "Invalid delivery frequency" },
          { status: 400 }
        )
      }
    }

    // Validate first delivery week if present
    if (updateData.first_delivery_week !== undefined) {
      const weekNum = parseInt(updateData.first_delivery_week)
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
        return NextResponse.json(
          { error: "First delivery week must be between 1 and 53" },
          { status: 400 }
        )
      }
    }

    // Parse numeric values
    const parsedData = parseNumericFields(updateData)

    // Handle date fields
    if (parsedData.first_visit) parsedData.first_visit = new Date(parsedData.first_visit)
    if (parsedData.second_visit) parsedData.second_visit = new Date(parsedData.second_visit)
    if (parsedData.third_visit) parsedData.third_visit = new Date(parsedData.third_visit)

    // Handle domain search updates
    if (domainEmails) {
      parsedData.domainEmails = domainEmails
      parsedData.lastDomainSearch = new Date()
    }

    // Update stage if partner or visited status changes
    if (parsedData.isPartner !== undefined || parsedData.visited !== undefined) {
      const currentShop = await prisma.coffeeShop.findUnique({
        where: { id },
        select: { isPartner: true, visited: true }
      })

      if (currentShop) {
        parsedData.stage = calculateStage({
          isPartner: parsedData.isPartner ?? currentShop.isPartner,
          visited: parsedData.visited ?? currentShop.visited
        })
      }
    }

    // Ensure delivery frequency is set when first delivery week is set
    if (parsedData.first_delivery_week && !parsedData.delivery_frequency) {
      parsedData.delivery_frequency = "WEEKLY" // Default to weekly if not specified
    }

    // Log the update for debugging
    console.log("Updating shop with data:", {
      id,
      delivery_frequency: parsedData.delivery_frequency,
      first_delivery_week: parsedData.first_delivery_week
    })

    const updatedShop = await prisma.coffeeShop.update({
      where: { id },
      data: {
        ...parsedData,
        owners: owners ? {
          deleteMany: {},
          create: owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: people ? {
          createMany: {
            data: people.map((person: any) => ({
              ...person,
              userId: session.user.id
            }))
          }
        } : undefined
      },
      include: {
        owners: true,
        people: true
      }
    })

    console.log("Shop updated successfully:", {
      id: updatedShop.id,
      delivery_frequency: updatedShop.delivery_frequency,
      first_delivery_week: updatedShop.first_delivery_week
    })

    revalidatePath('/dashboard/coffee-shops')
    revalidatePath(`/dashboard/coffee-shops/${id}`)

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id } = data

    if (!id) {
      return NextResponse.json(
        { error: "Missing coffee shop ID" },
        { status: 400 }
      )
    }

    // Delete related records in a transaction
    await prisma.$transaction([
      prisma.person.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.owner.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.coffeeShop.delete({
        where: { id }
      })
    ])

    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/filters/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const filterSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  type: z.string(),
  label: z.string()
})

const savedFilterSchema = z.object({
  name: z.string().min(1, "Filter name is required"),
  filters: z.array(filterSchema),
  isDefault: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedFilters = await prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(savedFilters)
  } catch (error) {
    console.error("[SAVED_FILTERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch saved filters" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const json = await request.json()
    const { name, filters, isDefault } = savedFilterSchema.parse(json)

    // If setting as default, remove existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        filters,
        isDefault: isDefault || false,
        userId: user.id
      }
    })

    return NextResponse.json(savedFilter)
  } catch (error) {
    console.error("[SAVED_FILTERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save filter" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json(
        { error: "Filter ID is required" },
        { status: 400 }
      )
    }

    await prisma.savedFilter.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Filter deleted successfully" })
  } catch (error) {
    console.error("[SAVED_FILTERS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    )
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/priority/route.ts
// src/app/api/coffee-shops/priority/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { 
  calculatePriority, 
  updateAllShopPriorities 
} from "@/lib/coffee-shops/priority-calculator"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check user role (optional, you might want to restrict to admins)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Trigger priority recalculation
    await updateAllShopPriorities()

    return NextResponse.json(
      { 
        message: "Priorities recalculated successfully",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_RECALCULATION] Error:", error)
    return NextResponse.json(
      { error: "Failed to recalculate priorities" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch current priority distribution
    const priorityDistribution = await prisma.coffeeShop.groupBy({
      by: ['priority'],
      _count: {
        id: true
      },
      orderBy: {
        priority: 'asc'
      }
    })

    return NextResponse.json(
      { 
        distribution: priorityDistribution,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_DISTRIBUTION] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch priority distribution" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Handle date conversions
    const updateData = {
      ...body,
      // Only convert dates if they exist in the payload
      ...(body.first_visit && { first_visit: new Date(body.first_visit) }),
      ...(body.second_visit && { second_visit: new Date(body.second_visit) }),
      ...(body.third_visit && { third_visit: new Date(body.third_visit) }),
      // Update visited status if setting first visit
      ...(body.first_visit && { visited: true }),
      updatedAt: new Date()
    }

    const coffeeShop = await prisma.coffeeShop.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH]", error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          details: "Failed to update coffee shop"
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: {
        id: params.id
      }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Validate ID parameter
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: "Coffee shop ID is required" },
        { status: 400 }
      )
    }

    // 3. Delete associated people first
    await prisma.person.deleteMany({
      where: { coffeeShopId: id }
    })

    // 4. Delete the coffee shop
    await prisma.coffeeShop.delete({
      where: { id }
    })

    // 5. Return success response
    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    
    return NextResponse.json(
      { error: "Failed to delete coffee shop" },
      { status: 500 }
    )
  }
}
 ________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/[id]/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const visits = await prisma.visit.findMany({
      where: {
        coffeeShopId: params.id
      },
      orderBy: {
        date: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const json = await request.json()

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { 
        coffeeShopId: params.id 
      }
    })

    const visit = await prisma.visit.create({
      data: {
        ...json,
        coffeeShopId: params.id,
        userId: session.user.id,
        visitNumber: visitCount + 1
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Update coffee shop's visited status
    await prisma.coffeeShop.update({
      where: { id: params.id },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/email/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import nodemailer from "nodemailer"
import { z } from "zod"

const emailSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string(),
  body: z.string(),
  shopIds: z.array(z.string())
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const { to, subject, body, shopIds } = emailSchema.parse(json)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      },
      secure: true
    })

    // Send emails
    await Promise.all(
      to.map(async (email) => {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject,
          html: body
        })
      })
    )

    // Log email activity
    await prisma.activity.createMany({
      data: shopIds.map((shopId) => ({
        type: "EMAIL_SENT",
        description: `Email sent: ${subject}`,
        userId: session.user.id,
        shopId,
        metadata: {
          recipients: to,
          subject,
          sentAt: new Date()
        }
      }))
    })

    return NextResponse.json({ 
      message: `Emails sent successfully to ${to.length} recipients`
    })
  } catch (error) {
    console.error("[EMAIL_SEND]", error)
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    )
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/reports/route.ts
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/coffee-shops/reports/visits/route.ts
// src/app/api/coffee-shops/reports/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      )
    }

    const shops = await prisma.coffeeShop.findMany({
      where: {
        visited: true,
        first_visit: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) })
        }
      },
      include: {
        visits: {
          where: {
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        }
      },
      orderBy: {
        first_visit: 'desc'
      }
    })

    const shopsWithNotes = shops.map(shop => {
      const arr = shop.volume ? ((parseFloat(shop.volume) * 52) * 18) : 0
      
      let note = `First visited on ${new Date(shop.first_visit!).toLocaleDateString()}. `
      
      if (shop.manager_present) {
        note += `Manager ${shop.manager_present} present. `
      } else {
        note += 'No manager information. '
      }

      if (shop.volume) {
        note += `Weekly volume: ${shop.volume} units. `
      }

      if (arr > 0) {
        note += `Potential annual revenue: $${arr.toLocaleString()}.`
      }

      return {
        name: shop.title,
        address: shop.address,
        area: shop.area || '',
        website: shop.website || '',
        store_doors: shop.store_doors || '',
        manager_present: shop.manager_present || '',
        contact_name: shop.contact_name || '',
        contact_email: shop.contact_email || '',
        weeklyVolume: shop.volume || '',
        annualRevenue: arr > 0 ? `$${arr.toLocaleString()}` : '',
        visitDate: shop.first_visit ? new Date(shop.first_visit).toLocaleDateString() : '',
        stage: shop.stage || '',
        rating: shop.rating || '',
        notes: note
      }
    })

    return NextResponse.json(shopsWithNotes)
  } catch (error) {
    console.error("[VISIT_REPORT_GET]", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { createAutoFollowUps } from "@/lib/follow-ups/auto-create"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data = await request.json()
    
    // Create the visit
    const visit = await prisma.visit.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    // Generate automatic follow-ups
    await createAutoFollowUps(user.id)

    return NextResponse.json({ data: visit })
  } catch (error) {
    console.error("[VISIT_CREATE]", error)
    return NextResponse.json(
      { error: "Failed to create visit" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const visits = await prisma.visit.findMany({
      where: {
        userId: user.id
      },
      include: {
        coffeeShop: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    })

    await createAutoFollowUps(user.id)

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/analytics.prisma
model AnalyticsSnapshot {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  date          DateTime
  metrics       Json
  type          String   // UTILIZATION, LABOR_COST, COVERAGE
  filters       Json?
  createdAt     DateTime @default(now())
}

model Report {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  type          String
  filters       Json
  schedule      Json?    // For automated reports
  lastRun       DateTime?
  createdBy     String   @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Alert {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String
  severity      String
  message       String
  metadata      Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}

enum Stage {
  PROSPECTING
  QUALIFICATION
  MEETING
  PROPOSAL
  NEGOTIATION
  PAUSED
  WON
  LOST
}

model User {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  email         String      @unique
  name          String?
  password      String
  role          Role        @default(USER)
  contacts      Contact[]
  bio           String?
  phoneNumber   String?
  preferences   Json?
  notifications Json?
  activities    Activity[]
  orders        Order[]
  quickNotes    QuickNote[]
  menuItems     MenuItem[]
  visits        Visit[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
  coffeeShops   CoffeeShop[] // Add this line to complete the relation
  people        Person[]    // Add relation to Person model
  filterHistory   FilterHistory[]
  savedFilters    SavedFilter[]
  followUps        FollowUp[]

}


model SavedFilter {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  filters     Json
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FilterHistory {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  filters     Json
  results     Int
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId
  type        String
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
  contact     Contact  @relation(fields: [contactId], references: [id])
}

model Contact {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName   String
  lastName    String
  email       String
  phone       String?
  company     String?
  notes       String?
  status      Status     @default(NEW)
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  Activity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  shop        Shop?      @relation(fields: [shopId], references: [id])
  shopId      String?    @db.ObjectId
}

model Person {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName         String?
  lastName          String?
  email             String
  phone             String?
  emailType         String?    // "professional" or "generic"
  verificationStatus String?   // "VALID", "INVALID", etc.
  lastVerifiedAt    DateTime?
  notes             String?
  userId            String     @db.ObjectId
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  coffeeShop        CoffeeShop @relation(fields: [coffeeShopId], references: [id])
  coffeeShopId      String     @db.ObjectId
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  company     String?

}


model MenuItem {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userId      String      @db.ObjectId
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime    @default(now())
  total          Float
  isComplimentary Boolean     @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String      @db.ObjectId
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId  String    @db.ObjectId
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String    @db.ObjectId
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuickNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  content   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  qrCodes   QRCode[]
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String         @db.ObjectId
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?        @db.ObjectId
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]
  design        QRDesign?
  scans         Scan[]
}

model QRDesign {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  size                  Int      @default(300)
  backgroundColor       String   @default("#FFFFFF")
  foregroundColor       String   @default("#000000")
  logoImage            String?
  logoWidth            Int?
  logoHeight           Int?
  dotStyle             String    @default("squares")
  margin               Int       @default(20)
  errorCorrectionLevel String    @default("M")
  style                Json
  logoStyle            Json?
  imageRendering       String    @default("auto")
  qrCodeId             String    @unique @db.ObjectId
  qrCode               QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Scan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId    String   @db.ObjectId
  qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  userAgent   String?
  ipAddress   String?
  location    String?
  device      String?
  browser     String?
  os          String?
  timestamp   DateTime @default(now())
}

model DeviceRule {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String   @db.ObjectId
  qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  deviceType String
  browsers   String[]
  os         String[]
  targetUrl  String
  priority   Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ScheduleRule {
  id         String    @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String    @db.ObjectId
  qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  startDate  DateTime
  endDate    DateTime?
  timeZone   String
  daysOfWeek Int[]
  startTime  String?
  endTime    String?
  targetUrl  String
  priority   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences Json?
  maxShiftsPerWeek Int               @default(5)
  preferredShiftLength Int           @default(8)
  preferredDays    Int[]
  blackoutDates    DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int               @default(8)
  notes            String?
}

model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int
  startTime String
  endTime   String
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SchedulingRule {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  name                 String
  description          String?
  isActive             Boolean  @default(true)
  ruleType             RuleType @default(BASIC)
  minStaffPerShift     Int?
  maxStaffPerShift     Int?
  requireCertification Boolean  @default(false)
  requiredCertifications String[]
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[]
  preferredHours       String[]
  roleRequirements     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model TimeOff {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String       @db.ObjectId
  staff       Staff        @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}


model FollowUp {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String       @db.ObjectId
  coffeeShop      CoffeeShop   @relation(fields: [coffeeShopId], references: [id])
  type            FollowUpType
  status          FollowUpStatus @default(PENDING)
  priority        Int          @default(3) // 1-5 scale
  dueDate         DateTime
  completedDate   DateTime?
  notes           String?
  contactMethod   String?      // email, text, visit, call
  contactDetails  String?      // phone number, email address
  assignedTo      String       @db.ObjectId
  user            User         @relation(fields: [assignedTo], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum FollowUpType {
  INITIAL_CONTACT
  SAMPLE_DELIVERY
  PROPOSAL_FOLLOW
  TEAM_MEETING
  CHECK_IN
  GENERAL
}

enum FollowUpStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}


model CoffeeShop {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  address               String
  website               String?
  manager_present       String?
  contact_name          String?
  contact_email         String?
  phone                 String?
  visited               Boolean   @default(false)
  instagram            String?
  followers            Int?
  store_doors          String?
  volume               String?
  first_visit          DateTime?
  second_visit         DateTime?
  third_visit          DateTime?
  rating               Float?
  reviews              Int?
  price_type           String?
  type                 String?
  types                String[]
  service_options      Json?
  hours                String?
  operating_hours      Json?
  gps_coordinates      Json?
  latitude             Float
  longitude            Float
  area                 String?
  is_source            Boolean   @default(false)
  quality_score        Float?
  parlor_coffee_leads  Boolean   @default(false)
  visits               Visit[]
  userId               String?   @db.ObjectId
  user                 User?     @relation(fields: [userId], references: [id])
  owners               Owner[]
  notes                String?
  priority             Int       @default(0)
  isPartner            Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  priorityLastUpdated  DateTime?
  // Add these fields
  emails               Json?     // Stores array of discovered emails
  company_data         Json?     // Stores company enrichment data
  people               Person[]  // Relation to people discovered from emails
  stage     Stage     @default(PROSPECTING)
  delivery_frequency String? // Values: "WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"
  first_delivery_week Int?
  followUps         FollowUp[]
  lastFollowUp      DateTime?
  nextFollowUpDate  DateTime?
  followUpCount     Int         @default(0)
  relationshipStage String?     // INITIAL, SAMPLES_DELIVERED, PROPOSAL_SENT, etc.
  potential         Int?        // 1-5 scale
  interest          Int?        // 1-5 scale
  decisionMaker     String?     // Name of the decision maker
  decisionMakerRole String?     // Role of the decision maker
  communicationPreference String? // email, phone, in-person
  bestTimeToVisit   String?
  competitors       String[]    // Other coffee suppliers they work with
  budget           Float?      // Estimated monthly budget
  closingNotes     String?     // Notes about closing strategy
}



model Owner {
 id            String      @id @default(auto()) @map("_id") @db.ObjectId
 name          String
 email         String
 coffeeShopId  String      @db.ObjectId
 coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id], onDelete: Cascade)
 createdAt     DateTime    @default(now())
 updatedAt     DateTime    @updatedAt
}

model Visit {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  shopId        String    @db.ObjectId
  userId        String    @db.ObjectId
  visitNumber   Int
  date          DateTime
  managerPresent Boolean  @default(false)
  managerName   String?
  managerContact String?
  samplesDropped Boolean  @default(false)
  sampleDetails String?
  notes         String?
  nextVisitDate DateTime?
  photos        Photo[]   
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  shop          Shop      @relation(fields: [shopId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id])

}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  visitId   String   @db.ObjectId
  url       String
  caption   String?
  createdAt DateTime @default(now())
  visit     Visit    @relation(fields: [visitId], references: [id])
}

model Shop {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  address     String
  latitude    Float
  longitude   Float
  rating      Float?
  reviews     Int?
  website     String?
  phone       String?
  visited     Boolean   @default(false)
  visits      Visit[]
  contacts    Contact[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum Status {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}



________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/follow-ups/follow-up-create-dialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { CoffeeShop } from "@prisma/client"

interface FollowUpCreateDialogProps {
  shops: CoffeeShop[]
  onFollowUpCreated: () => void
}

const formSchema = z.object({
  coffeeShopId: z.string({
    required_error: "Please select a coffee shop",
  }),
  type: z.enum(['INITIAL_CONTACT', 'SAMPLE_DELIVERY', 'PROPOSAL_FOLLOW', 'TEAM_MEETING', 'CHECK_IN', 'GENERAL'], {
    required_error: "Please select a follow-up type",
  }),
  priority: z.number().min(1).max(5),
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
  contactMethod: z.enum(['call', 'email', 'visit', 'text'], {
    required_error: "Please select a contact method",
  }),
  notes: z.string().optional(),
})

export function FollowUpCreateDialog({ shops, onFollowUpCreated }: FollowUpCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 3,
      type: 'GENERAL',
      contactMethod: 'call',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to create follow-up')

      toast({
        title: "Success",
        description: "Follow-up created successfully",
      })

      onFollowUpCreated()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating follow-up:', error)
      toast({
        title: "Error",
        description: "Failed to create follow-up",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Follow-up</DialogTitle>
          <DialogDescription>
            Create a new follow-up task for a coffee shop
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="coffeeShopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coffee Shop</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coffee shop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INITIAL_CONTACT">Initial Contact</SelectItem>
                      <SelectItem value="SAMPLE_DELIVERY">Sample Delivery</SelectItem>
                      <SelectItem value="PROPOSAL_FOLLOW">Proposal Follow-up</SelectItem>
                      <SelectItem value="TEAM_MEETING">Team Meeting</SelectItem>
                      <SelectItem value="CHECK_IN">Check In</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (1-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    5 is highest priority, 1 is lowest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any relevant notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Follow-up"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/follow-ups/follow-up-dialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { generateFollowUpSuggestions } from "./follow-up-suggestions"
import { CalendarCheck, CalendarX } from "lucide-react"

interface FollowUpCreateDialogProps {
  shops: any[]
  onFollowUpCreated: () => void
}

export function FollowUpCreateDialog({ 
  shops,
  onFollowUpCreated 
}: FollowUpCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const createFollowUp = async (suggestion: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(suggestion)
      })

      if (!response.ok) throw new Error('Failed to create follow-up')

      toast({
        title: "Follow-up created",
        description: `Follow-up scheduled for ${format(new Date(suggestion.dueDate), 'MMM d, yyyy')}`
      })

      onFollowUpCreated()
      setOpen(false)
    } catch (error) {
      console.error('Error creating follow-up:', error)
      toast({
        title: "Error",
        description: "Failed to create follow-up",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Get suggestions for all shops
  const allSuggestions = shops.flatMap(shop => {
    const suggestions = generateFollowUpSuggestions(shop)
    return suggestions.map(suggestion => ({
      ...suggestion,
      shopName: shop.title
    }))
  })

  // Sort suggestions by priority and due date
  const sortedSuggestions = allSuggestions.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarCheck className="mr-2 h-4 w-4" />
          New Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Follow-up</DialogTitle>
          <DialogDescription>
            Suggested follow-ups based on shop visit history and stages
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {sortedSuggestions.length > 0 ? (
            sortedSuggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{suggestion.shopName}</CardTitle>
                  <CardDescription>
                    {suggestion.type.split('_').join(' ').toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Due Date:</span>{' '}
                      {format(new Date(suggestion.dueDate), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Contact Method:</span>{' '}
                      {suggestion.contactMethod}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{' '}
                      {'★'.repeat(suggestion.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.notes}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => createFollowUp(suggestion)}
                    disabled={loading}
                  >
                    Schedule Follow-up
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-semibold">No Follow-ups Suggested</h3>
              <p className="text-sm text-muted-foreground">
                There are no suggested follow-ups based on current shop data.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/follow-ups/follow-up-manager.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CoffeeShop } from "@prisma/client"
import { format } from "date-fns"
import { 
  PhoneCall, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  User,
  Star
} from "lucide-react"
import { FollowUpCreateDialog } from "./follow-up-create-dialog"
import { GenerateFollowUpsButton } from "./generate-button"

type FollowUp = {
  id: string
  type: string
  status: string
  priority: number
  dueDate: string
  completedDate?: string
  notes?: string
  contactMethod?: string
  contactDetails?: string
  coffeeShop: {
    id: string
    title: string
    address: string
    area?: string
  }
}

const STATUS_COLORS = {
  PENDING: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
  RESCHEDULED: "default"
} as const

const PRIORITY_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-green-500',
  5: 'text-blue-500'
} as const

export function FollowUpManager() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [shops, setShops] = useState<CoffeeShop[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [followUpsResponse, shopsResponse] = await Promise.all([
        fetch('/api/follow-ups'),
        fetch('/api/coffee-shops')
      ])

      if (!followUpsResponse.ok || !shopsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const followUpsJson = await followUpsResponse.json()
      const shopsJson = await shopsResponse.json()

      setFollowUps(followUpsJson.data || [])
      setShops(shopsJson.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (followUpId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${followUpId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getContactMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'phone':
      case 'call':
        return <PhoneCall className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'visit':
        return <Building className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getTypeDisplay = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const handleReschedule = (followUpId: string) => {
    console.log('Reschedule follow-up:', followUpId)
  }


  const filteredFollowUps = followUps.filter(followUp => {
    if (activeTab === 'pending') {
      return ['PENDING', 'IN_PROGRESS'].includes(followUp.status)
    }
    if (activeTab === 'completed') {
      return followUp.status === 'COMPLETED'
    }
    if (activeTab === 'cancelled') {
      return followUp.status === 'CANCELLED'
    }
    return true
  }).sort((a, b) => {
    // Sort by priority first, then by due date
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const renderTableContent = (status: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Shop & Stage</TableHead>
            <TableHead>Follow-up Type</TableHead>
            <TableHead>Visit History</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>{status === 'completed' ? 'Completed' : 'Due'}</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFollowUps.map((followUp) => {
            const shop = shops.find(s => s.id === followUp.coffeeShop.id)
            const visitCount = [shop?.first_visit, shop?.second_visit, shop?.third_visit].filter(Boolean).length
            
            return (
              <TableRow key={followUp.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{followUp.coffeeShop.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {shop?.stage || 'UNKNOWN'}
                      </Badge>
                      {shop?.area && (
                        <span className="text-xs text-muted-foreground">
                          {shop.area}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{getTypeDisplay(followUp.type)}</span>
                    {followUp.notes && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {followUp.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">
                      {visitCount} visit{visitCount !== 1 ? 's' : ''}
                    </span>
                    {shop?.lastFollowUp && (
                      <span className="text-xs text-muted-foreground">
                        Last: {format(new Date(shop.lastFollowUp), 'MMM d')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={PRIORITY_COLORS[followUp.priority as keyof typeof PRIORITY_COLORS]}>
                      {Array(followUp.priority).fill('★').join('')}
                    </span>
                    {shop?.potential && (
                      <span className="text-xs text-muted-foreground">
                        Potential: {shop.potential}/5
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>
                      {format(
                        new Date(status === 'completed' ? followUp.completedDate! : followUp.dueDate), 
                        'MMM d'
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(status === 'completed' ? followUp.completedDate! : followUp.dueDate),
                        'h:mm a'
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getContactMethodIcon(followUp.contactMethod)}
                      <span className="capitalize">
                        {followUp.contactMethod || 'Any'}
                      </span>
                    </div>
                    {shop?.contact_name && (
                      <span className="text-xs text-muted-foreground">
                        {shop.contact_name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[followUp.status as keyof typeof STATUS_COLORS]}>
                    {followUp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(followUp.id, 'COMPLETED')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReschedule(followUp.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(followUp.id, 'PENDING')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {filteredFollowUps.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No {status} follow-ups found
                  </p>
                  {status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGenerateDialog(true)}
                    >
                      Generate Follow-ups
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Manager</CardTitle>
          <CardDescription>Loading follow-ups...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Follow-up Manager</CardTitle>
            <CardDescription>
              Track and manage your follow-ups with coffee shops
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <GenerateFollowUpsButton onGenerated={fetchData} />
            <FollowUpCreateDialog 
              shops={shops} 
              onFollowUpCreated={fetchData} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending & In Progress
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <XCircle className="mr-2 h-4 w-4" />
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {renderTableContent('pending')}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderTableContent('completed')}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {renderTableContent('cancelled')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/follow-ups/follow-up-suggestions.tsx
import { CoffeeShop } from "@prisma/client"
import { format, addDays, addBusinessDays, isAfter, differenceInDays } from "date-fns"

interface FollowUpSuggestion {
  type: string
  dueDate: Date
  priority: number
  contactMethod: string
  notes: string
  coffeeShopId: string
}

interface FollowUpRule {
  type: string
  priority: number
  daysAfter: number
  contactMethod: string
  notes: string
}

// Rules for different stages and scenarios
const STAGE_RULES: Record<string, FollowUpRule[]> = {
  PROSPECTING: [
    {
      type: "INITIAL_CONTACT",
      priority: 3,
      daysAfter: 1,
      contactMethod: "visit",
      notes: "Initial visit to introduce products and establish contact."
    }
  ],
  QUALIFICATION: [
    {
      type: "SAMPLE_DELIVERY",
      priority: 4,
      daysAfter: 3,
      contactMethod: "visit",
      notes: "Follow up on initial interest and bring samples."
    }
  ],
  PROPOSAL: [
    {
      type: "PROPOSAL_FOLLOW",
      priority: 5,
      daysAfter: 2,
      contactMethod: "call",
      notes: "Follow up on proposal and address any questions."
    }
  ],
  NEGOTIATION: [
    {
      type: "TEAM_MEETING",
      priority: 5,
      daysAfter: 1,
      contactMethod: "visit",
      notes: "Schedule meeting with decision makers to finalize details."
    }
  ]
}

// Visit-based rules
const VISIT_RULES: Record<string, FollowUpRule> = {
  FIRST_VISIT: {
    type: "INITIAL_CONTACT",
    priority: 4,
    daysAfter: 3,
    contactMethod: "call",
    notes: "Follow up on initial visit. Discuss first impressions and address questions."
  },
  SECOND_VISIT: {
    type: "SAMPLE_DELIVERY",
    priority: 5,
    daysAfter: 4,
    contactMethod: "visit",
    notes: "Follow up on samples and discuss potential partnership."
  },
  THIRD_VISIT: {
    type: "PROPOSAL_FOLLOW",
    priority: 4,
    daysAfter: 5,
    contactMethod: "call",
    notes: "Follow up on final visit and discuss next steps."
  }
}

export function generateFollowUpSuggestions(shop: CoffeeShop): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = []
  const today = new Date()

  // Helper function to create a suggestion
  const createSuggestion = (
    rule: FollowUpRule,
    baseDate: Date,
    extraNotes?: string
  ): FollowUpSuggestion => ({
    type: rule.type,
    dueDate: addBusinessDays(baseDate, rule.daysAfter),
    priority: rule.priority,
    contactMethod: rule.contactMethod,
    notes: extraNotes ? `${rule.notes} ${extraNotes}` : rule.notes,
    coffeeShopId: shop.id
  })

  // Stage-based suggestions
  if (shop.stage && STAGE_RULES[shop.stage]) {
    STAGE_RULES[shop.stage].forEach(rule => {
      const suggestion = createSuggestion(rule, today)
      if (isAfter(suggestion.dueDate, today)) {
        suggestions.push(suggestion)
      }
    })
  }

  // Visit-based suggestions
  if (shop.first_visit && !shop.second_visit) {
    const firstVisitDate = new Date(shop.first_visit)
    suggestions.push(createSuggestion(
      VISIT_RULES.FIRST_VISIT,
      firstVisitDate,
      `Previous visit was on ${format(firstVisitDate, 'MMM d')}.`
    ))
  }

  if (shop.second_visit && !shop.third_visit) {
    const secondVisitDate = new Date(shop.second_visit)
    suggestions.push(createSuggestion(
      VISIT_RULES.SECOND_VISIT,
      secondVisitDate,
      `Samples delivered on ${format(secondVisitDate, 'MMM d')}.`
    ))
  }

  if (shop.third_visit) {
    const thirdVisitDate = new Date(shop.third_visit)
    const daysSinceThirdVisit = differenceInDays(today, thirdVisitDate)
    
    if (daysSinceThirdVisit <= 7) {
      suggestions.push(createSuggestion(
        VISIT_RULES.THIRD_VISIT,
        thirdVisitDate,
        `Final visit completed on ${format(thirdVisitDate, 'MMM d')}.`
      ))
    }
  }

  // Special case: Long time no contact
  const lastVisitDate = shop.third_visit || shop.second_visit || shop.first_visit
  if (lastVisitDate) {
    const daysSinceLastVisit = differenceInDays(today, new Date(lastVisitDate))
    if (daysSinceLastVisit > 14 && !shop.isPartner) {
      suggestions.push({
        type: "CHECK_IN",
        dueDate: addBusinessDays(today, 1),
        priority: 3,
        contactMethod: "call",
        notes: `No contact in ${daysSinceLastVisit} days. Reconnect and assess current status.`,
        coffeeShopId: shop.id
      })
    }
  }

  // Special case: High potential leads without recent contact
  if (shop.potential && shop.potential >= 4 && !shop.isPartner) {
    const lastVisit = new Date(lastVisitDate || 0)
    const daysSinceContact = differenceInDays(today, lastVisit)
    
    if (daysSinceContact > 7) {
      suggestions.push({
        type: "HIGH_POTENTIAL",
        dueDate: addBusinessDays(today, 1),
        priority: 5,
        contactMethod: "visit",
        notes: "High potential lead requires immediate follow-up.",
        coffeeShopId: shop.id
      })
    }
  }

  // Volume-based suggestions
  if (shop.volume) {
    const weeklyVolume = parseFloat(shop.volume)
    if (weeklyVolume > 50 && !shop.isPartner) {
      suggestions.push({
        type: "HIGH_VOLUME",
        dueDate: addBusinessDays(today, 1),
        priority: 5,
        contactMethod: "visit",
        notes: `High volume potential (${weeklyVolume} units/week). Priority follow-up required.`,
        coffeeShopId: shop.id
      })
    }
  }

  // Sort suggestions by priority and due date
  return suggestions.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/follow-ups/generate-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw } from "lucide-react"

interface GenerateFollowUpsButtonProps {
  onGenerated: () => void
}

export function GenerateFollowUpsButton({ onGenerated }: GenerateFollowUpsButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups/generate', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate follow-ups')
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: `Generated ${data.count} follow-ups`
      })

      onGenerated()
    } catch (error) {
      console.error('Error generating follow-ups:', error)
      toast({
        title: "Error",
        description: "Failed to generate follow-ups",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Generate Follow-ups
    </Button>
  )
}
________________________________________________________________________________
