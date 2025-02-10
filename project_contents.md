### /Users/mohameddiomande/Desktop/koatji-crm/src/store/priority-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CoffeeShop } from '@prisma/client'

interface RouteMetrics {
  totalDistance: number
  totalDuration: number
  estimatedArrival: string
  numberOfStops: number
}

interface OptimizationSettings {
  maxStops: number
  preferHigherRated: boolean
  avoidTraffic: boolean
  prioritizeUnvisited: boolean
  timePerStop: number
  startTime: string
  endTime: string
  maxTravelTime: number
  includeNearby: boolean
  searchRadius: number
}

interface PriorityState {
  selectedShops: CoffeeShop[]
  optimizedRoute: CoffeeShop[]
  nearbyShops: CoffeeShop[]
  settings: OptimizationSettings
  routeMetrics: RouteMetrics | null
  savedRoutes: {
    id: string
    name: string
    shops: CoffeeShop[]
    metrics: RouteMetrics
    createdAt: Date
  }[]
  isOptimizing: boolean
  setSelectedShops: (shops: CoffeeShop[]) => void
  addToSelection: (shop: CoffeeShop) => void
  removeFromSelection: (shopId: string) => void
  setOptimizedRoute: (route: CoffeeShop[]) => void
  setNearbyShops: (shops: CoffeeShop[]) => void
  updateSettings: (settings: Partial<OptimizationSettings>) => void
  setRouteMetrics: (metrics: RouteMetrics) => void
  saveRoute: (name: string) => void
  deleteRoute: (id: string) => void
  clearRoute: () => void
  setIsOptimizing: (isOptimizing: boolean) => void
}

const defaultSettings: OptimizationSettings = {
  maxStops: 10,
  preferHigherRated: true,
  avoidTraffic: true,
  prioritizeUnvisited: true,
  timePerStop: 30,
  startTime: "09:00",
  endTime: "17:00",
  maxTravelTime: 45,
  includeNearby: true,
  searchRadius: 2
}

export const usePriorityStore = create<PriorityState>()(
  persist(
    (set, get) => ({
      selectedShops: [],
      optimizedRoute: [],
      nearbyShops: [],
      settings: defaultSettings,
      routeMetrics: null,
      savedRoutes: [],
      isOptimizing: false,

      setSelectedShops: (shops) => set({ selectedShops: shops }),
      
      addToSelection: (shop) => set((state) => ({
        selectedShops: [...state.selectedShops, shop]
      })),
      
      removeFromSelection: (shopId) => set((state) => ({
        selectedShops: state.selectedShops.filter(s => s.id !== shopId)
      })),
      
      setOptimizedRoute: (route) => set({ optimizedRoute: route }),
      
      setNearbyShops: (shops) => set({ nearbyShops: shops }),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      setRouteMetrics: (metrics) => set({ routeMetrics: metrics }),
      
      saveRoute: (name) => set((state) => ({
        savedRoutes: [
          ...state.savedRoutes,
          {
            id: crypto.randomUUID(),
            name,
            shops: state.optimizedRoute,
            metrics: state.routeMetrics!,
            createdAt: new Date()
          }
        ]
      })),
      
      deleteRoute: (id) => set((state) => ({
        savedRoutes: state.savedRoutes.filter(r => r.id !== id)
      })),
      
      clearRoute: () => set({
        optimizedRoute: [],
        routeMetrics: null
      }),
      
      setIsOptimizing: (isOptimizing) => set({ isOptimizing })
    }),
    {
      name: 'priority-store'
    }
  )
)

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/lib/schedule-generator.ts
import { 
  WeeklySchedule, 
  DaySchedule, 
  TimeBlock,
  ScheduleSettings,
  ScheduledVisit
} from "@/types/schedule"
import { CoffeeShop } from "@prisma/client"
import { calculateDistance } from "./route-optimization"

interface GenerateScheduleParams {
  priorityLocations: CoffeeShop[]
  settings: ScheduleSettings
  timeBlocks: TimeBlock[]
  startDate: Date
}

// Calculate available time slots for each day
function calculateAvailableSlots(
  day: DaySchedule,
  settings: ScheduleSettings
): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = []
  const dayStart = settings.startTime
  const dayEnd = settings.endTime

  // Sort time blocks by start time
  const sortedBlocks = [...day.timeBlocks].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  )

  let currentTime = dayStart

  for (const block of sortedBlocks) {
    // Add slot before block if there's time
    if (currentTime < block.startTime) {
      slots.push({
        start: currentTime,
        end: block.startTime
      })
    }
    currentTime = block.endTime
  }

  // Add final slot if there's time left
  if (currentTime < dayEnd) {
    slots.push({
      start: currentTime,
      end: dayEnd
    })
  }

  return slots
}

// Group locations by geographical proximity
function groupLocationsByProximity(
  locations: CoffeeShop[],
  maxDistance: number
): CoffeeShop[][] {
  const groups: CoffeeShop[][] = []
  const assigned = new Set<string>()

  for (const location of locations) {
    if (assigned.has(location.id)) continue

    const group = [location]
    assigned.add(location.id)

    for (const other of locations) {
      if (assigned.has(other.id)) continue

      const distance = calculateDistance(
        { lat: location.latitude, lng: location.longitude },
        { lat: other.latitude, lng: other.longitude }
      )

      if (distance <= maxDistance) {
        group.push(other)
        assigned.add(other.id)
      }
    }

    groups.push(group)
  }

  return groups
}

// Calculate visit duration based on location type and settings
function calculateVisitDuration(
  location: CoffeeShop,
  settings: ScheduleSettings
): number {
  let duration = location.priority && location.priority >= 4
    ? settings.priorityVisitDuration
    : settings.visitDuration

  // Add extra time for key activities
  if (location.isPartner) duration += 15
  if (location.parlor_coffee_leads) duration += 15
  if (!location.visited) duration += 10

  return duration
}

// Check if a visit fits in a time slot
function visitFitsInSlot(
  visit: ScheduledVisit,
  slot: { start: string; end: string }
): boolean {
  const visitDuration = visit.estimatedDuration
  const slotStart = new Date(`1970-01-01T${slot.start}`)
  const slotEnd = new Date(`1970-01-01T${slot.end}`)
  const slotDuration = (slotEnd.getTime() - slotStart.getTime()) / 1000 / 60

  return visitDuration <= slotDuration
}

export async function generateWeeklySchedule({
  priorityLocations,
  settings,
  timeBlocks,
  startDate
}: GenerateScheduleParams): Promise<WeeklySchedule> {
  // Initialize week structure
  const days: DaySchedule[] = Array.from({ length: 5 }, (_, i) => ({
    day: i,
    date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
    timeBlocks: timeBlocks.filter(block => block.day === i),
    visits: [],
    availableMinutes: 480 // 8 hours default
  }))

  // Group locations by area
  const locationGroups = groupLocationsByProximity(
    priorityLocations,
    settings.maxTravelTime
  )

  // Distribute location groups across days
  for (const group of locationGroups) {
    // Find best day for this group
    let bestDay = days[0]
    let maxAvailableTime = 0

    for (const day of days) {
      const slots = calculateAvailableSlots(day, settings)
      const totalAvailable = slots.reduce((total, slot) => {
        const start = new Date(`1970-01-01T${slot.start}`)
        const end = new Date(`1970-01-01T${slot.end}`)
        return total + (end.getTime() - start.getTime()) / 1000 / 60
      }, 0)

      if (totalAvailable > maxAvailableTime) {
        maxAvailableTime = totalAvailable
        bestDay = day
      }
    }

    // Schedule visits for this group
    const slots = calculateAvailableSlots(bestDay, settings)
    let currentSlotIndex = 0

    for (const location of group) {
      if (currentSlotIndex >= slots.length) break

      const duration = calculateVisitDuration(location, settings)
      const visit: ScheduledVisit = {
        id: crypto.randomUUID(),
        shopId: location.id,
        shop: location,
        startTime: slots[currentSlotIndex].start,
        endTime: '', // Will be calculated
        day: bestDay.day,
        isPriority: (location.priority || 0) >= 4,
        estimatedDuration: duration
      }

      if (visitFitsInSlot(visit, slots[currentSlotIndex])) {
        // Calculate end time
        const startDate = new Date(`1970-01-01T${visit.startTime}`)
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000)
        visit.endTime = endDate.toTimeString().slice(0, 5)

        bestDay.visits.push(visit)
      } else {
        currentSlotIndex++
        if (currentSlotIndex < slots.length) {
          visit.startTime = slots[currentSlotIndex].start
          const startDate = new Date(`1970-01-01T${visit.startTime}`)
          const endDate = new Date(startDate.getTime() + duration * 60 * 1000)
          visit.endTime = endDate.toTimeString().slice(0, 5)

          bestDay.visits.push(visit)
        }
      }
    }
  }

  return {
    weekNumber: getWeekNumber(startDate),
    startDate,
    endDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000),
    days
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/types/schedule.ts
import { CoffeeShop } from "@prisma/client"

export type TimeBlock = {
  id: string
  day: number // 0-6 for Monday-Sunday
  startTime: string
  endTime: string
  type: TimeBlockType
  title: string
  description?: string
  recurrent?: boolean
}

export type TimeBlockType = 
  | 'TEAM_MEETING'
  | 'CLIENT_MEETING'
  | 'DELIVERY'
  | 'BREAK'
  | 'PRIORITY_VISIT'
  | 'NEARBY_VISIT'
  | 'OTHER'

export type DaySchedule = {
  day: number
  date: Date
  timeBlocks: TimeBlock[]
  visits: ScheduledVisit[]
  availableMinutes: number
}
export type ScheduledVisit = {
  id: string
  shopId: string
  shop: CoffeeShop
  startTime: string
  endTime: string
  day: number
  isPriority: boolean
  estimatedDuration: number // in minutes
}

export type WeeklySchedule = {
  weekNumber: number
  startDate: Date
  endDate: Date
  days: DaySchedule[]
}

export interface ScheduleSettings {
  visitDuration: number // Default duration for a visit in minutes
  priorityVisitDuration: number // Duration for priority visits
  maxVisitsPerDay: number
  startTime: string // Default day start time
  endTime: string // Default day end time
  preferredDays: number[] // 0-6 for specific locations
  breakDuration: number // Duration of breaks between visits
  maxTravelTime: number // Maximum time willing to travel between locations
  minVisitsPerLocation: number // Minimum visits required for priority locations
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/schedule-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimeBlock, WeekSchedule, ScheduleSettings } from '@/types/schedule'

interface ScheduleState {
  timeBlocks: TimeBlock[]
  currentSchedule: WeekSchedule | null
  settings: ScheduleSettings
  addTimeBlock: (block: TimeBlock) => void
  removeTimeBlock: (id: string) => void
  updateSchedule: (schedule: WeekSchedule) => void
  updateSettings: (settings: Partial<ScheduleSettings>) => void
  clearSchedule: () => void
}

const defaultSettings: ScheduleSettings = {
  startTime: "09:00",
  endTime: "17:00",
  visitDuration: 30,
  priorityVisitDuration: 45,
  maxTravelTime: 30,
  prioritizeClusters: true,
  balanceWeekly: true,
  includeNearby: true,
  nearbyRadius: 2
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      timeBlocks: [],
      currentSchedule: null,
      settings: defaultSettings,

      addTimeBlock: (block) =>
        set((state) => ({
          timeBlocks: [...state.timeBlocks, block]
        })),

      removeTimeBlock: (id) =>
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== id)
        })),

      updateSchedule: (schedule) =>
        set({
          currentSchedule: schedule
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      clearSchedule: () =>
        set({
          currentSchedule: null
        })
    }),
    {
      name: 'schedule-store'
    }
  )
)

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-coffee-shops.ts
import useSWR from 'swr';
import { CoffeeShop } from '@prisma/client';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useCoffeeShops() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
    '/api/coffee-shops',
    fetcher,
    {
      refreshInterval: 0, // Only refresh manually
      revalidateOnFocus: false,
    }
  );

  return {
    shops: data,
    loading: isLoading,
    error: error,
    mutate,
  };
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/priority/page.tsx
import { Metadata } from "next"
import { PriorityList } from "@/components/priority/list/priority-list"
import { PriorityMap } from "@/components/priority/map/priority-map"
import { WeeklyScheduler } from "@/components/priority/scheduler/weekly-scheduler"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Priority Routes | BUF BARISTA CRM",
  description: "Manage priority locations and optimize routes"
}

export default async function PriorityPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Priority Routes</h1>
          <p className="text-muted-foreground">
            Manage high-priority locations and create optimized routes
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Priority Location List */}
          <div className="col-span-2">
            <PriorityList />
          </div>

          {/* Map View */}
          <div className="col-span-3">
            <PriorityMap />
          </div>

          {/* Weekly Schedule */}
          <div className="col-span-2">
            <WeeklyScheduler />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/scheduler/day-schedule.tsx
"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Star,
  Building2,
  Tag,
  X,
  CalendarRange,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DaySchedule as DayScheduleType, TimeBlock, ScheduledVisit } from "@/types/schedule"

// time slots for the day 9am - 5pm
const TIME_SLOTS = [
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "1:00",
  "1:30",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
  "5:00"
]

interface DayScheduleProps {
  day: number
  schedule?: DayScheduleType
  timeBlocks: TimeBlock[]
  onRemoveTimeBlock: (id: string) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const TIME_BLOCK_COLORS = {
  TEAM_MEETING: "bg-blue-100 border-blue-200 text-blue-700",
  CLIENT_MEETING: "bg-purple-100 border-purple-200 text-purple-700",
  DELIVERY: "bg-green-100 border-green-200 text-green-700",
  BREAK: "bg-gray-100 border-gray-200 text-gray-700",
  PRIORITY_VISIT: "bg-yellow-100 border-yellow-200 text-yellow-700",
  NEARBY_VISIT: "bg-indigo-100 border-indigo-200 text-indigo-700",
  OTHER: "bg-red-100 border-red-200 text-red-700"
}

export function DaySchedule({
  day,
  schedule,
  timeBlocks,
  onRemoveTimeBlock
}: DayScheduleProps) {
  const timelineItems = useMemo(() => {
    const items: Array<{
      time: string
      blocks: TimeBlock[]
      visits: ScheduledVisit[]
    }> = TIME_SLOTS.map(time => ({
      time,
      blocks: [],
      visits: []
    }))

    // Add time blocks
    timeBlocks.forEach(block => {
      const startIdx = TIME_SLOTS.indexOf(block.startTime)
      if (startIdx !== -1) {
        items[startIdx].blocks.push(block)
      }
    })

    // Add scheduled visits
    schedule?.visits.forEach(visit => {
      const startIdx = TIME_SLOTS.indexOf(visit.startTime)
      if (startIdx !== -1) {
        items[startIdx].visits.push(visit)
      }
    })

    return items
  }, [timeBlocks, schedule])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{DAYS[day]}</h3>
          {schedule && (
            <span className="text-sm text-muted-foreground">
              {schedule.date.toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {schedule?.visits.length || 0} visits
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CalendarRange className="h-3 w-3" />
            {timeBlocks.length} blocks
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {timelineItems.map(({ time, blocks, visits }) => (
          <div key={time} className="grid grid-cols-[80px,1fr] gap-4">
            <div className="text-sm text-muted-foreground">{time}</div>
            <div className="space-y-2">
              {blocks.map(block => (
                <div
                  key={block.id}
                  className={cn(
                    "rounded-lg border p-2 relative group",
                    TIME_BLOCK_COLORS[block.type]
                  )}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveTimeBlock(block.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">{block.title}</div>
                  <div className="text-sm">
                    {block.startTime} - {block.endTime}
                  </div>
                </div>
              ))}

              {visits.map(visit => (
                <div
                  key={visit.id}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{visit.shop.title}</div>
                    <div className="flex items-center gap-1">
                      {visit.isPriority && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          Priority
                        </Badge>
                      )}
                      {visit.shop.isPartner && (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          Partner
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {visit.startTime} - {visit.endTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {visit.shop.area}
                    </div>
                    {visit.shop.volume && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {visit.shop.volume}/wk
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/scheduler/schedule-settings.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { usePriorityStore } from "@/store/priority-store"

interface ScheduleSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleSettings({
  open,
  onOpenChange
}: ScheduleSettingsProps) {
  const { settings, updateSettings } = usePriorityStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={localSettings.startTime}
                onChange={(e) => 
                  setLocalSettings({
                    ...localSettings,
                    startTime: e.target.value
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={localSettings.endTime}
                onChange={(e) => 
                  setLocalSettings({
                    ...localSettings,
                    endTime: e.target.value
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Regular Visit Duration (minutes)</Label>
            <Slider
              value={[localSettings.visitDuration]}
              onValueChange={(value) => 
                setLocalSettings({
                  ...localSettings,
                  visitDuration: value[0]
                })
              }
              min={15}
              max={60}
              step={15}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.visitDuration} minutes
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority Visit Duration (minutes)</Label>
            <Slider
              value={[localSettings.priorityVisitDuration]}
              onValueChange={(value) => 
                setLocalSettings({...localSettings,
                  priorityVisitDuration: value[0]
                })
              }
              min={30}
              max={90}
              step={15}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.priorityVisitDuration} minutes
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Travel Time Between Visits (minutes)</Label>
            <Slider
              value={[localSettings.maxTravelTime]}
              onValueChange={(value) => 
                setLocalSettings({
                  ...localSettings,
                  maxTravelTime: value[0]
                })
              }
              min={15}
              max={60}
              step={5}
            />
            <div className="text-sm text-muted-foreground">
              {localSettings.maxTravelTime} minutes
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prioritize Geographical Clusters</Label>
                <div className="text-sm text-muted-foreground">
                  Optimize for locations in the same area
                </div>
              </div>
              <Switch
                checked={localSettings.prioritizeClusters}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    prioritizeClusters: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Balance Weekly Distribution</Label>
                <div className="text-sm text-muted-foreground">
                  Spread priority visits across the week
                </div>
              </div>
              <Switch
                checked={localSettings.balanceWeekly}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    balanceWeekly: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Nearby Locations</Label>
                <div className="text-sm text-muted-foreground">
                  Add non-priority locations when convenient
                </div>
              </div>
              <Switch
                checked={localSettings.includeNearby}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    includeNearby: checked
                  })
                }
              />
            </div>
          </div>

          {localSettings.includeNearby && (
            <div className="space-y-2">
              <Label>Search Radius for Nearby Locations (km)</Label>
              <Slider
                value={[localSettings.nearbyRadius]}
                onValueChange={(value) => 
                  setLocalSettings({
                    ...localSettings,
                    nearbyRadius: value[0]
                  })
                }
                min={0.5}
                max={5}
                step={0.5}
              />
              <div className="text-sm text-muted-foreground">
                {localSettings.nearbyRadius} kilometers
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/scheduler/time-block-dialog.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeBlock, TimeBlockType } from "@/types/schedule"

interface TimeBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBlock: (block: TimeBlock) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const BLOCK_TYPES: { value: TimeBlockType; label: string }[] = [
  { value: "TEAM_MEETING", label: "Team Meeting" },
  { value: "CLIENT_MEETING", label: "Client Meeting" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "BREAK", label: "Break" },
  { value: "OTHER", label: "Other" }
]

export function TimeBlockDialog({
  open,
  onOpenChange,
  onAddBlock
}: TimeBlockDialogProps) {
  const [block, setBlock] = useState<Partial<TimeBlock>>({
    type: "TEAM_MEETING",
    day: 0,
    startTime: "09:00",
    endTime: "10:00",
    recurrent: true
  })

  const handleSubmit = () => {
    if (!block.title || !block.type || !block.startTime || !block.endTime) {
      return
    }

    onAddBlock({
      id: crypto.randomUUID(),
      title: block.title,
      type: block.type,
      day: block.day || 0,
      startTime: block.startTime,
      endTime: block.endTime,
      description: block.description,
      recurrent: block.recurrent || false
    })

    onOpenChange(false)
    setBlock({
      type: "TEAM_MEETING",
      day: 0,
      startTime: "09:00",
      endTime: "10:00",
      recurrent: true
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Block</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={block.title || ""}
              onChange={(e) => setBlock({ ...block, title: e.target.value })}
              placeholder="Enter block title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={block.type}
                onValueChange={(value: TimeBlockType) => 
                  setBlock({ ...block, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Day</Label>
              <Select
                value={block.day?.toString()}
                onValueChange={(value) => 
                  setBlock({ ...block, day: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={block.startTime}
                onChange={(e) => 
                  setBlock({ ...block, startTime: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={block.endTime}
                onChange={(e) => 
                  setBlock({ ...block, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description (Optional)</Label>
            <Input
              value={block.description || ""}
              onChange={(e) => 
                setBlock({ ...block, description: e.target.value })
              }
              placeholder="Add description"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Recurring Weekly</Label>
            <Switch
              checked={block.recurrent}
              onCheckedChange={(checked) => 
                setBlock({ ...block, recurrent: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/scheduler/weekly-scheduler.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Clock,
  MapPin,
  Plus,
  Settings,
  RefreshCw
} from "lucide-react"
import { DaySchedule } from "./day-schedule"
import { TimeBlockDialog } from "./time-block-dialog"
import { ScheduleSettings } from "./schedule-settings"
import { useScheduleStore } from "@/store/schedule-store"
import { WeeklySchedule, TimeBlock } from "@/types/schedule"
import { generateWeeklySchedule } from "@/lib/schedule-generator"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function WeeklyScheduler() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [timeBlockOpen, setTimeBlockOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { 
    schedule,
    settings,
    timeBlocks,
    updateSchedule,
    addTimeBlock,
    removeTimeBlock
  } = useScheduleStore()

  const handleGenerateSchedule = async () => {
    setIsGenerating(true)
    try {
      const newSchedule = await generateWeeklySchedule({
        priorityLocations: [], // Get from store
        settings,
        timeBlocks,
        startDate: new Date() // Or selected week
      })
      updateSchedule(newSchedule)
    } catch (error) {
      console.error('Failed to generate schedule:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeBlockOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              Previous Week
            </Button>
            <div className="font-medium">
              Week of {schedule?.startDate.toLocaleDateString()}
            </div>
            <Button variant="outline" size="sm">
              Next Week
            </Button>
          </div>

          {/* Daily Schedules */}
          <div className="space-y-4">
            {DAYS.map((day, index) => (
              <DaySchedule
                key={day}
                day={index}
                schedule={schedule?.days[index]}
                timeBlocks={timeBlocks.filter(block => block.day === index)}
                onRemoveTimeBlock={removeTimeBlock}
              />
            ))}
          </div>

          {/* Generate Schedule Button */}
          <Button
            className="w-full"
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Weekly Schedule
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Dialogs */}
      <TimeBlockDialog
        open={timeBlockOpen}
        onOpenChange={setTimeBlockOpen}
        onAddBlock={addTimeBlock}
      />
      <ScheduleSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/map/map-marker.tsx
"use client"

import { CoffeeShop } from "@prisma/client"
import { useMemo } from "react"

interface MapMarkerProps {
  shop: CoffeeShop
  isSelected?: boolean
  isOptimized?: boolean
  sequenceNumber?: number
  onClick?: () => void
}

export function MapMarker({
  shop,
  isSelected,
  isOptimized,
  sequenceNumber,
  onClick
}: MapMarkerProps) {
  const marker = useMemo(() => {
    if (!google) return null

    // Create custom marker icon
    const iconUrl = createMarkerIcon(shop, isSelected, isOptimized, sequenceNumber)
    
    const marker = new google.maps.Marker({
      position: { lat: shop.latitude, lng: shop.longitude },
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15)
      },
      title: shop.title,
      optimized: false
    })

    // Create info window content
    const content = `
      <div class="p-4 min-w-[200px]">
        <div class="font-bold text-lg mb-2">${shop.title}</div>
        <div class="text-sm mb-2">${shop.address}</div>
        ${shop.volume ? `
          <div class="text-sm mb-2">Volume: ${shop.volume}/week</div>
          <div class="text-sm mb-2">ARR: $${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}</div>
        ` : ''}
        <div class="flex flex-wrap gap-2 mt-2">
          ${shop.isPartner ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Partner</span>' : ''}
          ${shop.parlor_coffee_leads ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Lead</span>' : ''}
          ${shop.visited ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Visited</span>' : ''}
          ${shop.priority ? `<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Priority ${shop.priority}</span>` : ''}
        </div>
      </div>
    `

    const infoWindow = new google.maps.InfoWindow({
      content,
      maxWidth: 300
    })

    // Add click listener
    marker.addListener('click', () => {
      if (onClick) onClick()
      infoWindow.open({
        anchor: marker,
        map: marker.getMap()
      })
    })

    return marker
  }, [shop, isSelected, isOptimized, sequenceNumber, onClick])

  return null // This is a headless component
}

// Helper function to create marker icon as data URL
function createMarkerIcon(
  shop: CoffeeShop,
  isSelected?: boolean,
  isOptimized?: boolean,
  sequenceNumber?: number
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  canvas.width = 30
  canvas.height = 30

  // Set marker color based on shop properties
  let color = '#6B7280' // Default gray
  if (shop.isPartner) color = '#22C55E' // Green
  else if (shop.parlor_coffee_leads) color = '#EAB308' // Yellow
  else if (shop.priority >= 4) color = '#8B5CF6' // Purple
  else if (shop.visited) color = '#3B82F6' // Blue

  // Draw marker circle
  ctx.beginPath()
  ctx.arc(15, 15, 12, 0, Math.PI * 2)
  ctx.fillStyle = isSelected ? '#EF4444' : color // Red if selected
  ctx.fill()
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw sequence number if optimized
  if (isOptimized && typeof sequenceNumber === 'number') {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sequenceNumber.toString(), 15, 15)
  }

  return canvas.toDataURL()
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/map/optimization-settings.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { usePriorityStore } from "@/store/priority-store"

interface OptimizationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OptimizationSettings({
  open,
  onOpenChange
}: OptimizationSettingsProps) {
  const { settings, updateSettings } = usePriorityStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Route Optimization Settings</DialogTitle>
          <DialogDescription>
            Configure how routes are optimized and generated
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Stops</Label>
              <Slider
                value={[localSettings.maxStops]}
                onValueChange={(value) => 
                  setLocalSettings({ ...localSettings, maxStops: value[0] })
                }
                min={5}
                max={20}
                step={1}
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.maxStops} stops
              </span>
            </div>

            <div className="space-y-2">
              <Label>Time Per Stop (minutes)</Label>
              <Slider
                value={[localSettings.timePerStop]}
                onValueChange={(value) => 
                  setLocalSettings({ ...localSettings, timePerStop: value[0] })
                }
                min={15}
                max={60}
                step={5}
              />
              <span className="text-sm text-muted-foreground">
                {localSettings.timePerStop} minutes
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={localSettings.startTime}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={localSettings.endTime}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Travel Time Between Stops (minutes)</Label>
            <Slider
              value={[localSettings.maxTravelTime]}
              onValueChange={(value) => 
                setLocalSettings({ ...localSettings, maxTravelTime: value[0] })
              }
              min={15}
              max={90}
              step={15}
            />
            <span className="text-sm text-muted-foreground">
              {localSettings.maxTravelTime} minutes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Prefer Higher Rated</Label>
                <div className="text-sm text-muted-foreground">
                  Prioritize locations with better ratings
                </div>
              </div>
              <Switch
                checked={localSettings.preferHigherRated}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, preferHigherRated: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Avoid Traffic</Label>
                <div className="text-sm text-muted-foreground">
                  Consider traffic conditions in route planning
                </div>
              </div>
              <Switch
                checked={localSettings.avoidTraffic}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, avoidTraffic: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Prioritize Unvisited</Label>
              <div className="text-sm text-muted-foreground">
                Give higher priority to locations not yet visited
              </div>
            </div>
            <Switch
              checked={localSettings.prioritizeUnvisited}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, prioritizeUnvisited: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/map/priority-map.tsx
"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouteOptimizer } from "@/hooks/use-route-optimizer"
import { 
  Settings2, 
  MapPin, 
  Circle, 
  Navigation, 
  Route as RouteIcon,
  RefreshCw,
  Save
} from "lucide-react"
import { CoffeeShop } from "@prisma/client"
import { calculateDistance, findNearbyLocations } from "@/lib/route-optimization"
import { usePriorityStore } from "@/store/priority-store"
import { OptimizationSettings } from "./optimization-settings"
import { RouteSummary } from "./route-summary"
import { MapMarker } from "./map-marker"
import { RouteLayer } from "./route-layer"

export function PriorityMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { 
    selectedShops,
    optimizedRoute,
    setOptimizedRoute,
    settings,
    updateSettings,
    setRouteMetrics,
    isOptimizing,
    setIsOptimizing 
  } = usePriorityStore()

  const { optimizeRoute, metrics } = useRouteOptimizer()

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps")
        const directionsServiceInstance = new google.maps.DirectionsService()
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
        })

        const mapInstance = new Map(mapRef.current, {
          zoom: 12,
          center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        directionsRendererInstance.setMap(mapInstance)

        setMap(mapInstance)
        setDirectionsService(directionsServiceInstance)
        setDirectionsRenderer(directionsRendererInstance)
      } catch (error) {
        console.error('Error initializing map:', error)
        toast({
          title: "Error",
          description: "Failed to initialize map. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    initMap()
  }, [])

  // Update map bounds when selected shops change
  useEffect(() => {
    if (!map || !selectedShops.length) return

    const bounds = new google.maps.LatLngBounds()
    selectedShops.forEach(shop => {
      bounds.extend({ lat: shop.latitude, lng: shop.longitude })
    })
    map.fitBounds(bounds, 50)
  }, [map, selectedShops])

  // Handle optimize route
  const handleOptimizeRoute = async () => {
    if (!selectedShops.length || !directionsService) {
      toast({
        title: "Error",
        description: "Please select locations first",
        variant: "destructive"
      })
      return
    }

    setIsOptimizing(true)
    try {
      const optimizedStops = await optimizeRoute(
        selectedShops,
        settings,
        directionsService
      )

      setOptimizedRoute(optimizedStops)
      setRouteMetrics(metrics!)

      // Update route display
      if (directionsRenderer && optimizedStops.length > 1) {
        const waypoints = optimizedStops.slice(1, -1).map(stop => ({
          location: { lat: stop.latitude, lng: stop.longitude },
          stopover: true
        }))

        const response = await directionsService.route({
          origin: { 
            lat: optimizedStops[0].latitude, 
            lng: optimizedStops[0].longitude 
          },
          destination: { 
            lat: optimizedStops[optimizedStops.length - 1].latitude, 
            lng: optimizedStops[optimizedStops.length - 1].longitude 
          },
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        })

        directionsRenderer.setDirections(response)
      }

      toast({
        title: "Success",
        description: `Route optimized with ${optimizedStops.length} stops`
      })
    } catch (error) {
      console.error('Error optimizing route:', error)
      toast({
        title: "Error",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Planning</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-4 w-4" />
              {selectedShops.length} selected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map */}
          <div 
            ref={mapRef}
            className="w-full h-[500px] rounded-lg border"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || selectedShops.length === 0}
              className="flex-1"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RouteIcon className="h-4 w-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>

          {/* Route Summary */}
          {optimizedRoute.length > 0 && (
            <RouteSummary />
          )}
        </div>
      </CardContent>

      <OptimizationSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/map/route-layer.tsx
"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route: CoffeeShop[]
  color?: string
  strokeWidth?: number
  opacity?: number
}

export function RouteLayer({
  route,
  color = "#3B82F6",
  strokeWidth = 3,
  opacity = 0.8
}: RouteLayerProps) {
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null)

  useEffect(() => {
    if (!route.length || !google) return

    // Create polyline for route
    const routePath = route.map(shop => ({
      lat: shop.latitude,
      lng: shop.longitude
    }))

    const newPolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: strokeWidth,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: color,
        },
        offset: '50%',
        repeat: '100px'
      }]
    })

    setPolyline(newPolyline)

    return () => {
      if (polyline) {
        polyline.setMap(null)
      }
    }
  }, [route, color, strokeWidth, opacity])

  return null // This is a headless component
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/map/route-summary.tsx
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePriorityStore } from "@/store/priority-store"
import { 
  Clock, 
  MapPin, 
  BarChart2, 
  Calendar,
  Star,
  Building,
  User,
  DollarSign
} from "lucide-react"

export function RouteSummary() {
  const { 
    optimizedRoute, 
    routeMetrics, 
    settings 
  } = usePriorityStore()

  if (!optimizedRoute.length || !routeMetrics) return null

  // Calculate route statistics
  const routeStats = {
    totalPartners: optimizedRoute.filter(shop => shop.isPartner).length,
    totalLeads: optimizedRoute.filter(shop => shop.parlor_coffee_leads).length,
    totalUnvisited: optimizedRoute.filter(shop => !shop.visited).length,
    averagePriority: optimizedRoute.reduce((acc, shop) => 
      acc + (shop.priority || 0), 0) / optimizedRoute.length,
    potentialRevenue: optimizedRoute.reduce((acc, shop) => {
      if (!shop.volume) return acc
      const volume = parseFloat(shop.volume)
      if (isNaN(volume)) return acc
      return acc + (volume * 52 * 18) // Weekly volume * 52 weeks * $18
    }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Summary</CardTitle>
        <CardDescription>
          Optimized route with {optimizedRoute.length} stops
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Distance</div>
              <div className="text-2xl font-bold">
                {routeMetrics.totalDistance.toFixed(1)} km
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Duration</div>
              <div className="text-2xl font-bold">
                {Math.round(routeMetrics.totalDuration)} min
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Arrival Time</div>
              <div className="text-2xl font-bold">
                {routeMetrics.estimatedArrival}
              </div>
            </div>
          </div>

          {/* Route Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium">Location Types</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Partners</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalPartners}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Leads</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalLeads}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Unvisited</span>
                  </div>
                  <Badge variant="outline">{routeStats.totalUnvisited}</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-medium">Route Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Avg Priority</span>
                  </div>
                  <Badge variant="outline">
                    {routeStats.averagePriority.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Potential ARR</span>
                  </div>
                  <Badge variant="outline">
                    ${routeStats.potentialRevenue.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          {/* Stop List */}
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h4 className="font-medium">Stops</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-2">
                {optimizedRoute.map((shop, index) => (
                  <div
                    key={shop.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{shop.title}</span>
                        {shop.isPartner && (
                          <Badge variant="success">Partner</Badge>
                        )}
                        {shop.parlor_coffee_leads && (
                          <Badge variant="warning">Lead</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {shop.address}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {shop.volume && (
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          {shop.volume}/wk
                        </Badge>
                      )}
                      {shop.priority && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          {shop.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/list/location-search-dialog.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Star, DollarSign, MapPin } from "lucide-react"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { usePriorityStore } from "@/store/priority-store"
import { CoffeeShop } from "@prisma/client"

interface LocationSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LocationSearchDialog({
  open,
  onOpenChange
}: LocationSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { shops = [], loading } = useCoffeeShops()
  const { selectedShops, setSelectedShops } = usePriorityStore()

  // Filter shops based on search term
  const filteredShops = shops.filter(shop => {
    const alreadySelected = selectedShops.some(s => s.id === shop.id)
    if (alreadySelected) return false

    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      shop.title.toLowerCase().includes(searchLower) ||
      shop.address.toLowerCase().includes(searchLower) ||
      shop.area?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelect = (shopId: string) => {
    setSelectedIds(prev =>
      prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    )
  }

  const handleAdd = () => {
    const shopsToAdd = shops.filter(shop => selectedIds.includes(shop.id))
    setSelectedShops([...selectedShops, ...shopsToAdd])
    onOpenChange(false)
    setSelectedIds([])
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Locations</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedIds.includes(shop.id)}
                  onCheckedChange={() => handleSelect(shop.id)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {shop.title}
                    </span>
                    {shop.isPartner && (
                      <Badge variant="success">Partner</Badge>
                    )}
                    {shop.parlor_coffee_leads && (
                      <Badge variant="warning">Lead</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{shop.address}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {shop.priority && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {shop.priority}
                      </Badge>
                    )}
                    {shop.volume && (
                      <Badge variant="outline" className="gap-1">
                        <DollarSign className="h-3 w-3" />
                        {shop.volume}/wk
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredShops.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? "Loading locations..." : "No locations found"}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.length === 0}
          >
            Add {selectedIds.length} Location{selectedIds.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/priority/list/priority-list.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Star, Route, DollarSign, MapPin, X } from "lucide-react"
import { usePriorityStore } from "@/store/priority-store"
import { LocationSearchDialog } from "./location-search-dialog"

export function PriorityList() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { selectedShops, removeFromSelection } = usePriorityStore()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Priority Locations</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {selectedShops.map(shop => (
                <div
                  key={shop.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromSelection(shop.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <div className="font-medium">{shop.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {shop.area || shop.address}
                    </div>

                    <div className="flex items-center gap-2">
                      {shop.isPartner && (
                        <Badge variant="success">Partner</Badge>
                      )}
                      {shop.parlor_coffee_leads && (
                        <Badge variant="warning">Lead</Badge>
                      )}
                      {shop.priority && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          {shop.priority}
                        </Badge>
                      )}
                      {shop.volume && (
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          {shop.volume}/wk
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedShops.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No locations selected
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <LocationSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
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
### /Users/mohameddiomande/Desktop/koatji-crm/src/lib/route-optimization/index.ts
import { CoffeeShop } from "@prisma/client"

interface Location {
  lat: number
  lng: number
}

interface OptimizationSettings {
  maxStops: number
  preferHigherRated: boolean
  avoidTraffic: boolean
  prioritizeUnvisited: boolean
  timePerStop: number
  startTime: string
  endTime: string
  maxTravelTime: number
}

// Calculate location score based on various factors
function calculateLocationScore(
  location: CoffeeShop,
  settings: OptimizationSettings
): number {
  let score = 0

  // Priority score (0-5)
  score += (location.priority || 0) * 2

  // Rating score (0-5)
  if (settings.preferHigherRated && location.rating) {
    score += location.rating
  }

  // Visit status
  if (settings.prioritizeUnvisited && !location.visited) {
    score += 3
  }

  // Volume score
  if (location.volume) {
    const volume = parseFloat(location.volume)
    if (!isNaN(volume)) {
      score += Math.min(volume / 20, 5)
    }
  }

  // Partner status
  if (location.isPartner) {
    score += 2
  }

  // Lead status
  if (location.parlor_coffee_leads) {
    score += 2
  }

  return score
}

// Calculate distance matrix between locations
async function calculateDistanceMatrix(
  locations: CoffeeShop[],
  directionsService: google.maps.DirectionsService
): Promise<number[][]> {
  const matrix: number[][] = []

  for (let i = 0; i < locations.length; i++) {
    matrix[i] = []
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        matrix[i][j] = 0
        continue
      }

      try {
        const response = await directionsService.route({
          origin: { lat: locations[i].latitude, lng: locations[i].longitude },
          destination: { lat: locations[j].latitude, lng: locations[j].longitude },
          travelMode: google.maps.TravelMode.DRIVING
        })

        matrix[i][j] = response.routes[0].legs[0].distance?.value || 0
      } catch (error) {
        console.error(`Error calculating distance between locations ${i} and ${j}:`, error)
        matrix[i][j] = Infinity
      }
    }
  }

  return matrix
}

// Nearest neighbor algorithm with priority scoring
async function findOptimalRoute(
  locations: CoffeeShop[],
  settings: OptimizationSettings,
  directionsService: google.maps.DirectionsService
): Promise<CoffeeShop[]> {
  const distanceMatrix = await calculateDistanceMatrix(locations, directionsService)
  const visited = new Set<number>()
  const route: CoffeeShop[] = []
  
  // Start with highest priority location
  let currentIndex = 0
  let maxScore = -1
  
  locations.forEach((location, index) => {
    const score = calculateLocationScore(location, settings)
    if (score > maxScore) {
      maxScore = score
      currentIndex = index
    }
  })

  route.push(locations[currentIndex])
  visited.add(currentIndex)

  // Build route
  while (visited.size < locations.length && route.length < settings.maxStops) {
    let nextIndex = -1
    let minDistance = Infinity
    let maxPriorityScore = -1

    for (let i = 0; i < locations.length; i++) {
      if (visited.has(i)) continue

      const distance = distanceMatrix[currentIndex][i]
      if (distance === Infinity) continue

      const priorityScore = calculateLocationScore(locations[i], settings)
      const combinedScore = priorityScore / (distance + 1) // Avoid division by zero

      if (combinedScore > maxPriorityScore) {
        maxPriorityScore = combinedScore
        minDistance = distance
        nextIndex = i
      }
    }

    if (nextIndex === -1) break

    route.push(locations[nextIndex])
    visited.add(nextIndex)
    currentIndex = nextIndex
  }

  return route
}

export async function optimizeRoute(
  locations: CoffeeShop[],
  settings: OptimizationSettings,
  directionsService: google.maps.DirectionsService
): Promise<CoffeeShop[]> {
  if (!locations.length) return []
  if (locations.length === 1) return locations

  try {
    return await findOptimalRoute(locations, settings, directionsService)
  } catch (error) {
    console.error('Error in route optimization:', error)
    throw new Error('Failed to optimize route')
  }
}

export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lng - point1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function findNearbyLocations(
  center: Location,
  locations: CoffeeShop[],
  radius: number,
  maxResults = 20
): CoffeeShop[] {
  return locations
    .map(location => ({
      location,
      distance: calculateDistance(center, {
        lat: location.latitude,
        lng: location.longitude
      })
    }))
    .filter(({ distance }) => distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map(({ location }) => location)
}

export type { Location, OptimizationSettings }

________________________________________________________________________________
