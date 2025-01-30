"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import {
  Building2,
  Coffee,
  DollarSign,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  Map,
  BarChart2,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import * as XLSX from 'xlsx'
import { PageContainer } from "@/components/layout/page-container";

export default function DashboardPage() {
  const { shops, loading } = useCoffeeShops()
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')
  const [selectedArea, setSelectedArea] = useState('all')
  const [metrics, setMetrics] = useState({
    totalShops: 0,
    visitedShops: 0,
    totalLeads: 0,
    totalVolume: 0,
    totalARR: 0,
    visitedThisWeek: 0,
    visitedThisMonth: 0,
    recentVisits: [],
    upcomingVisits: [],
    areaDistribution: [],
    visitTrends: [],
    leadsByArea: [],
    volumeByArea: [],
    topPerformers: [],
    weeklyVisitGoal: 20,
    weeklyVisitProgress: 0,
    visitsOverTime: [],
    areas: []
  })

  useEffect(() => {
    if (shops) {
      calculateMetrics(shops, selectedTimeRange, selectedArea)
    }
  }, [shops, selectedTimeRange, selectedArea])

  const calculateMetrics = (shops, timeRange, area) => {
    const now = new Date()
    const filteredShops = area === 'all' 
      ? shops 
      : shops.filter(shop => shop.area === area)

    // Calculate date ranges
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Basic metrics
    const visitedShops = filteredShops.filter(shop => shop.visited)
    const leads = filteredShops.filter(shop => shop.parlor_coffee_leads)
    const totalVolume = filteredShops.reduce((sum, shop) => 
      sum + (shop.volume ? parseFloat(shop.volume) : 0), 0
    )

    // Calculate visits by time period
    const visitedThisWeek = visitedShops.filter(shop => {
      const visitDate = new Date(shop.first_visit)
      return visitDate >= weekStart && visitDate <= weekEnd
    }).length

    const visitedThisMonth = visitedShops.filter(shop => {
      const visitDate = new Date(shop.first_visit)
      return visitDate >= monthStart
    }).length

    // Area distribution
    const areaCount = filteredShops.reduce((acc, shop) => {
      acc[shop.area] = (acc[shop.area] || 0) + 1
      return acc
    }, {})

    const areaDistribution = Object.entries(areaCount).map(([area, count]) => ({
      name: area,
      value: count
    }))

    // Volume by area
    const volumeByArea = Object.entries(
      filteredShops.reduce((acc, shop) => {
        if (!acc[shop.area]) acc[shop.area] = 0
        acc[shop.area] += shop.volume ? parseFloat(shop.volume) : 0
        return acc
      }, {})
    ).map(([area, volume]) => ({
      area,
      volume,
      arr: volume * 52 * 18
    }))

    // Top performers
    const topPerformers = [...filteredShops]
      .sort((a, b) => (b.volume ? parseFloat(b.volume) : 0) - (a.volume ? parseFloat(a.volume) : 0))
      .slice(0, 5)
      .map(shop => ({
        name: shop.title,
        volume: shop.volume ? parseFloat(shop.volume) : 0,
        arr: (shop.volume ? parseFloat(shop.volume) : 0) * 52 * 18,
        area: shop.area
      }))

    // Visits over time
    const visitsOverTime = generateVisitTrends(filteredShops, timeRange)

    // Get recent and upcoming visits
    const recentVisits = filteredShops
      .filter(shop => shop.visited && shop.first_visit)
      .sort((a, b) => new Date(b.first_visit) - new Date(a.first_visit))
      .slice(0, 5)

    const upcomingVisits = filteredShops
      .filter(shop => !shop.visited)
      .sort((a, b) => {
        const aVolume = a.volume ? parseFloat(a.volume) : 0
        const bVolume = b.volume ? parseFloat(b.volume) : 0
        return bVolume - aVolume
      })
      .slice(0, 5)

    // Get unique areas
    const areas = [...new Set(shops.map(shop => shop.area))]

    // Weekly visit progress
    const weeklyVisitProgress = (visitedThisWeek / 20) * 100

    setMetrics({
      totalShops: filteredShops.length,
      visitedShops: visitedShops.length,
      totalLeads: leads.length,
      totalVolume,
      totalARR: totalVolume * 52 * 18,
      visitedThisWeek,
      visitedThisMonth,
      recentVisits,
      upcomingVisits,
      areaDistribution,
      volumeByArea,
      topPerformers,
      weeklyVisitGoal: 20,
      weeklyVisitProgress,
      visitsOverTime,
      areas
    })
  }

  const generateVisitTrends = (shops, timeRange) => {
    const now = new Date()
    let startDate, endDate, interval

    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7)
        interval = 'day'
        break
      case 'month':
        startDate = subDays(now, 30)
        interval = 'week'
        break
      case 'year':
        startDate = subDays(now, 365)
        interval = 'month'
        break
      default:
        startDate = subDays(now, 7)
        interval = 'day'
    }

    const dateRange = eachDayOfInterval({ start: startDate, end: now })
    return dateRange.map(date => {
      const visitsOnDate = shops.filter(shop => {
        const visitDate = new Date(shop.first_visit)
        return format(visitDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      }).length

      return {
        date: format(date, 'MMM dd'),
        visits: visitsOnDate
      }
    })
  }

  const exportDashboardData = () => {
    const data = {
      'Summary Metrics': [
        {
          'Total Locations': metrics.totalShops,
          'Visited Locations': metrics.visitedShops,
          'Active Leads': metrics.totalLeads,
          'Total Weekly Volume': metrics.totalVolume,
          'Total ARR': metrics.totalARR,
          'Visits This Week': metrics.visitedThisWeek,
          'Visits This Month': metrics.visitedThisMonth,
          'Weekly Visit Goal': metrics.weeklyVisitGoal,
          'Weekly Visit Progress': `${metrics.weeklyVisitProgress.toFixed(1)}%`
        }
      ],
      'Top Performers': metrics.topPerformers,
      'Volume by Area': metrics.volumeByArea,
      'Recent Visits': metrics.recentVisits.map(visit => ({
        Location: visit.title,
        Area: visit.area,
        'Visit Date': format(new Date(visit.first_visit), 'PPP'),
        Volume: visit.volume,
        'Manager Present': visit.manager_present || 'N/A'
      })),
      'Upcoming Visits': metrics.upcomingVisits.map(visit => ({
        Location: visit.title,
        Area: visit.area,
        Volume: visit.volume,
        'Lead Status': visit.parlor_coffee_leads ? 'Lead' : 'Not Lead'
      }))
    }

    const wb = XLSX.utils.book_new()
    
    // Add each sheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const ws = XLSX.utils.json_to_sheet(sheetData)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    // Save the file
    XLSX.writeFile(wb, `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  if (loading) {
    return <div></div>
  }

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7']

  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        {/* Header with Controls */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:space-x-2">
              <Select
                value={selectedTimeRange}
                onValueChange={setSelectedTimeRange}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
  
              <Select
                value={selectedArea}
                onValueChange={setSelectedArea}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {metrics.areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:space-x-2">
              <Button 
                variant="outline" 
                onClick={exportDashboardData}
                className="w-full sm:w-auto"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              
              <Button 
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/dashboard/coffee-shops">View All Locations</Link>
              </Button>
            </div>
          </div>
        </div>
  
        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Locations
                <span className="block text-xs text-muted-foreground">
                  {metrics.visitedShops} visited
                </span>
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalShops}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full"
                    style={{ width: `${(metrics.visitedShops / metrics.totalShops) * 100}%` }}
                  />
                </div>
                <span className="ml-2">
                  {((metrics.visitedShops / metrics.totalShops) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Visits
                <span className="block text-xs text-muted-foreground">
                  Goal: {metrics.weeklyVisitGoal}
                </span>
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.visitedThisWeek}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full"
                    style={{ width: `${metrics.weeklyVisitProgress}%` }}
                  />
                </div>
                <span className="ml-2">
                  {metrics.weeklyVisitProgress.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Volume
                <span className="block text-xs text-muted-foreground">
                  Total across all locations
                </span>
              </CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalVolume.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.5% from last week</span>
              </div>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total ARR
                <span className="block text-xs text-muted-foreground">
                  Projected annual revenue
                </span>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.totalARR.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8.2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Charts Grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Visit Trends</CardTitle>
              <CardDescription>
                Number of visits over {selectedTimeRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.visitsOverTime}>
                    <defs>
                      <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#visitGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Highest volume locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] sm:h-[350px]">
                <div className="space-y-4">
                  {metrics.topPerformers.map((location, index) => (
                    <div key={location.name} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <span className="font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {location.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {location.area}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {location.volume.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${location.arr.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
  
        {/* Additional Analysis */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Volume Distribution</CardTitle>
              <CardDescription>
                Weekly volume by area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.volumeByArea}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => value.toLocaleString()}
                    />
                    <Bar dataKey="volume" fill="#3b82f6">
                      {metrics.volumeByArea.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
  
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest visits and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] sm:h-[350px]">
                <div className="space-y-4">
                  {metrics.recentVisits.map((shop) => (
                    <div key={shop.id} className="flex items-start space-x-4">
                      <div className="mt-1">
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {shop.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Visited on {format(new Date(shop.first_visit), 'PPP')}
                        </p>
                        {shop.manager_present && (
                          <Badge variant="secondary" className="text-xs">
                            Manager: {shop.manager_present}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Visits */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Upcoming Visits</CardTitle>
                <CardDescription>
                  High-priority locations to visit
                </CardDescription>
              </div>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/routes">
                  <Map className="mr-2 h-4 w-4" />
                  Plan Route
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.upcomingVisits.map((shop) => (
                <Card key={shop.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{shop.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.area}
                        </p>
                        {shop.volume && (
                          <p className="text-sm">
                            Volume: {shop.volume}
                          </p>
                        )}
                        {shop.parlor_coffee_leads && (
                          <Badge variant="default">Lead</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}