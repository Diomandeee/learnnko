### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/routes/[shopId]/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const visitSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = visitSchema.parse(json)

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { shopId: params.shopId }
    })

    const visit = await prisma.visit.create({
      data: {
        ...body,
        shopId: params.shopId,
        visitNumber: visitCount + 1,
        userId: session.user.id
      }
    })

    // Update shop's visited status
    await prisma.shop.update({
      where: { id: params.shopId },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const visits = await prisma.visit.findMany({
      where: { shopId: params.shopId },
      orderBy: { date: "desc" },
      include: {
        photos: true
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/api/routes/generate/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { RouteOptimizer } from "@/lib/route-optimizer"

const routeSettingsSchema = z.object({
  startingPoint: z.string(),
  maxStops: z.number().min(1).max(20),
  maxDistance: z.number().min(1).max(10)
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const settings = routeSettingsSchema.parse(json)

    // Get starting point shop
    const startShop = await prisma.shop.findUnique({
      where: { id: settings.startingPoint }
    })

    if (!startShop) {
      return new NextResponse("Starting point not found", { status: 404 })
    }

    // Get potential target shops
    const targetShops = await prisma.shop.findMany({
      where: {
        id: { not: settings.startingPoint },
        // Add any additional filters like visited status
      }
    })

    // Initialize route optimizer
    const optimizer = new RouteOptimizer({
      maxStops: settings.maxStops,
      maxDistance: settings.maxDistance
    })

    // Generate optimized route
    const route = await optimizer.generateRoute(startShop, targetShops)

    return NextResponse.json(route)
  } catch (error) {
    console.error("[ROUTE_GENERATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-calendar-intersection.ts
import { useState, useEffect, useRef } from 'react';

interface UseCalendarIntersectionOptions {
 root?: Element | null;
 rootMargin?: string;
 threshold?: number | number[];
}

export function useCalendarIntersection(
 options: UseCalendarIntersectionOptions = {}
) {
 const [isIntersecting, setIntersecting] = useState(false);
 const targetRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const observer = new IntersectionObserver(([entry]) => {
     setIntersecting(entry.isIntersecting);
   }, {
     root: options.root || null,
     rootMargin: options.rootMargin || '0px',
     threshold: options.threshold || 0,
   });

   if (targetRef.current) {
     observer.observe(targetRef.current);
   }

   return () => observer.disconnect();
 }, [options.root, options.rootMargin, options.threshold]);

 return [targetRef, isIntersecting] as const;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-coffee-shops.ts
// src/hooks/use-coffee-shops.ts
import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return res.json()
}

export function useCoffeeShops() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
    '/api/coffee-shops',
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  return {
    shops: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-google-maps.ts
import { useState, useEffect } from "react"

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
        script.async = true
        script.onload = () => setIsLoaded(true)
        script.onerror = () => setLoadError(new Error("Failed to load Google Maps"))
        document.body.appendChild(script)
      } catch (error) {
        setLoadError(error)
      }
    }

    loadGoogleMaps()
  }, [])

  return { isLoaded, loadError }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-location-tracking.ts
import { useState, useEffect, useCallback } from 'react'
import { calculateDistance, calculateBearing } from '@/lib/utils/geo'

interface LocationTrackingOptions {
  onLocationUpdate?: (position: GeolocationPosition) => void
  onLocationError?: (error: GeolocationError) => void
  onDestinationReached?: () => void
  destinationThreshold?: number // meters
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

export function useLocationTracking(options: LocationTrackingOptions = {}) {
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  const {
    onLocationUpdate,
    onLocationError,
    onDestinationReached,
    destinationThreshold = 50,
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 5000
  } = options

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported') as GeolocationError)
      return
    }

    setIsTracking(true)
  }, [])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  useEffect(() => {
    if (!isTracking) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position)
        onLocationUpdate?.(position)

        if (options.destination) {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            options.destination.latitude,
            options.destination.longitude
          )

          if (distance * 1000 <= destinationThreshold) {
            onDestinationReached?.()
          }
        }
      },
      (error) => {
        setError(error)
        onLocationError?.(error)
      },
      {
        enableHighAccuracy,
        maximumAge,
        timeout
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isTracking, options.destination])

  return {
    currentPosition,
    error,
    isTracking,
    startTracking,
    stopTracking
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-media-query.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Start listening for changes
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-route-optimization.ts

// src/hooks/use-route-optimization.ts

import { useState, useCallback } from 'react'
import { optimizeRoute } from '@/lib/utils/route-optimizer'
import { useToast } from '@/components/ui/use-toast'

export function useRouteOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const { toast } = useToast()

  const optimizeLocations = useCallback(async (
    startLocation,
    locations,
    options = {}
  ) => {
    setIsOptimizing(true)
    try {
      const optimizedRoute = await optimizeRoute(startLocation, locations, options)
      return optimizedRoute
    } catch (error) {
      console.error('Route optimization error:', error)
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize route. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  return {
    isOptimizing,
    optimizeLocations
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-selected-shop.ts
import { useMapStore } from '@/store/use-map'

export function useSelectedShop() {
  const selectedShop = useMapStore((state) => state.selectedShop)
  const setSelectedShop = useMapStore((state) => state.setSelectedShop)

  return {
    selectedShop,
    setSelectedShop,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-shop-visits.ts
import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShopVisits(shopId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    shopId ? `/api/coffee-shops/${shopId}/visits` : null,
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-shops.ts
import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShops() {
  const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
    '/api/coffee-shops',
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  return {
    shops: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-visit-tracking.ts

// src/hooks/use-visit-tracking.ts

import { useState, useCallback } from 'react'
import { VisitReport } from '@/types/route'

export function useVisitTracking() {
  const [currentVisit, setCurrentVisit] = useState<VisitReport | null>(null)

  const startVisit = useCallback((locationId: string) => {
    setCurrentVisit({
      visitId: crypto.randomUUID(),
      locationId,
      visitDate: new Date(),
    })
  }, [])

  const updateVisit = useCallback((updates: Partial<VisitReport>) => {
    setCurrentVisit(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const completeVisit = useCallback(async () => {
    if (!currentVisit) return

    try {
      // Save visit report to backend
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentVisit)
      })

      if (!response.ok) throw new Error('Failed to save visit')

      setCurrentVisit(null)
      return await response.json()
    } catch (error) {
      console.error('Failed to save visit:', error)
      throw error
    }
  }, [currentVisit])

  return {
    currentVisit,
    startVisit,
    updateVisit,
    completeVisit
  }
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/hooks/use-visits.ts
import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useVisits() {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    '/api/visits',
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
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
  owners               Owner[]   // New field for multiple owners
  notes                String?   // New field for notes
  priority             Int       @default(0)  // Higher number = higher priority
  isPartner            Boolean   @default(false)  // Whether they are a current partner
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  priorityLastUpdated DateTime?  // Track when priority was last calculated
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
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/routes/layout.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/app/dashboard/routes/page.tsx
"use client"

import { useState } from "react"
import { RouteMap } from "@/components/routes/map/route-map"
import { RouteControls } from "@/components/routes/controls/route-controls"
import { RouteList } from "@/components/routes/list/route-list"
import { RouteMetrics } from "@/components/routes/shared/route-metrics"
import { Button } from "@/components/ui/button"
import { useRouteStore } from "@/store/route-store"
import { useToast } from "@/components/ui/use-toast"
import {
  Map,
  FileSpreadsheet,
  Calendar,
  Share2,
  Settings,
} from "lucide-react"

export default function RoutesPage() {
  const [isExporting, setIsExporting] = useState(false)
  const { clearRoute, exportToCalendar, shareRoute } = useRouteStore()
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Export implementation
      setIsExporting(false)
      toast({
        title: "Route Exported",
        description: "Your route has been exported successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export route. Please try again.",
        variant: "destructive"
      })
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Planning</h1>
          <p className="text-muted-foreground">
            Plan and optimize your coffee shop visits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Route
          </Button>
          <Button variant="outline" onClick={exportToCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            Add to Calendar
          </Button>
          <Button variant="outline" onClick={shareRoute}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Route
          </Button>
          <Button variant="destructive" onClick={clearRoute}>
            Clear Route
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Route Controls and List */}
        <div className="col-span-3 space-y-4">
          <RouteControls />
          <RouteMetrics />
          <RouteList />
        </div>

        {/* Map */}
        <div className="col-span-9">
          <RouteMap />
        </div>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/shared/route-metrics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouteStore } from "@/store/route-store"
import { Clock, MapPin, Navigation } from "lucide-react"

export function RouteMetrics() {
  const { metrics, settings } = useRouteStore()

  if (!metrics) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {metrics.totalDistance.toFixed(1)} km
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">
              {Math.round(metrics.totalDuration)} min
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stops</p>
            <p className="text-2xl font-bold">{metrics.numberOfStops}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Arrival</p>
<p className="text-2xl font-bold">{metrics.estimatedArrival}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span>{settings.transportMode.toLowerCase()}</span>
          </div>
          {settings.avoidHighways && (
            <span>Avoiding highways</span>
          )}
          {settings.avoidTolls && (
            <span>Avoiding tolls</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-form.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { useVisitStore } from "@/store/use-visit"
import { VisitFormData } from "@/types/visit"

const visitFormSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
  photos: z.array(z.instanceof(File)).optional(),
})

interface VisitFormProps {
  shopId: string;
  onComplete: () => void;
}

export function VisitForm({ shopId, onComplete }: VisitFormProps) {
  const [loading, setLoading] = useState(false)
  const { addVisit } = useVisitStore()

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: new Date(),
      managerPresent: false,
      samplesDropped: false,
    },
  })

  async function onSubmit(data: VisitFormData) {
    setLoading(true)
    try {
      await addVisit(shopId, data)
      onComplete()
    } catch (error) {
      console.error("Failed to save visit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerPresent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Manager Present</FormLabel>
                <FormDescription>
                  Was the manager present during the visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("managerPresent") && (
          <>
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="samplesDropped"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Samples Dropped</FormLabel>
                <FormDescription>
                  Did you leave any samples during this visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("samplesDropped") && (
          <FormField
            control={form.control}
            name="sampleDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Details</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="List the samples provided..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any notes about the visit..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    field.onChange(files)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextVisitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Visit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-history.tsx
"use client"

import { formatDistanceToNow as formatDistance } from "date-fns"
import { Visit } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VisitHistoryProps {
  visits: Visit[]
}

export function VisitHistory({ visits }: VisitHistoryProps) {
  if (!visits.length) {
    return <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visit #{visit.visitNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(visit.date), new Date(), { addSuffix: true })}
              </p>
            </div>

            {visit.managerPresent && (
              <p className="text-sm">
                Manager present: {visit.managerName || "Yes"}
              </p>
            )}

            {visit.samplesDropped && (
              <p className="text-sm">
                Samples: {visit.sampleDetails || "Dropped off"}
              </p>
            )}

            {visit.notes && (
              <p className="text-sm text-muted-foreground">{visit.notes}</p>
            )}

            {visit.nextVisitDate && (
              <p className="text-xs text-muted-foreground">
                Next visit planned: {formatDistance(new Date(visit.nextVisitDate), new Date(), { addSuffix: true })}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/visit/visit-management.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitForm } from "./visit-form"
import { VisitHistory } from "./visit-history"
import { useShopVisits } from "@/hooks/use-shop-visits"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface VisitManagementProps {
  shop: CoffeeShop | null;
}

export function VisitManagement({ shop }: VisitManagementProps) {
  const { visits, loading, error, mutate } = useShopVisits(shop?.id || null)
  const [showForm, setShowForm] = useState(false)

  if (!shop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a coffee shop to view visit history
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading visits...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading visits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the visit history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Visit History - {shop.title}</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Visit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <VisitForm 
            shopId={shop.id} 
            onComplete={() => {
              setShowForm(false)
              mutate() // Refresh visits list
            }} 
          />
        ) : (
          <VisitHistory visits={visits || []} />
        )}
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/location-selector.tsx
"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouteStore } from "@/store/route-store"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Building2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LocationSelector() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArea, setSelectedArea] = useState("all")
  const [showVisited, setShowVisited] = useState("all")
  const { shops, loading } = useCoffeeShops()
  const { addLocation, selectedLocations } = useRouteStore()

  const filteredShops = shops?.filter(shop => {
    const matchesSearch = shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesArea = selectedArea === "all" || shop.area === selectedArea
    
    const matchesVisited = showVisited === "all" ||
      (showVisited === "visited" && shop.visited) ||
      (showVisited === "not_visited" && !shop.visited)

    const isNotSelected = !selectedLocations.find(loc => loc.id === shop.id)

    return matchesSearch && matchesArea && matchesVisited && isNotSelected
  }) || []

  const areas = shops ? [...new Set(shops.map(shop => shop.area))] : []

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Loading locations...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Locations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
            >
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

            <Select
              value={showVisited}
              onValueChange={setShowVisited}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visit status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="visited">Visited Only</SelectItem>
                <SelectItem value="not_visited">Not Visited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium truncate">{shop.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {shop.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shop.volume && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{shop.volume}</span>
                      </div>
                    )}
                    {shop.visited && (
                      <Badge variant="success" className="text-xs">
                        Visited
                      </Badge>
                    )}
                    {shop.parlor_coffee_leads && (
                      <Badge variant="warning" className="text-xs">
                        Lead
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addLocation(shop)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/navigation-controller.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouteStore } from "@/store/route-store"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Navigation,
  Check,
} from "lucide-react"

export function NavigationController() {
  const {
    currentRoute,
    isNavigating,
    currentStep,
    startNavigation,
    stopNavigation,
    nextStep,
    previousStep,
  } = useRouteStore()
  const { toast } = useToast()

  const currentLocation = currentRoute[currentStep]

  const handleStartNavigation = () => {
    if (currentRoute.length === 0) {
      toast({
        title: "No route selected",
        description: "Please create a route first.",
        variant: "destructive"
      })
      return
    }
    startNavigation()
  }

  if (!isNavigating) {
    return (
      <Button 
        className="w-full" 
        onClick={handleStartNavigation}
      >
        <Play className="mr-2 h-4 w-4" />
        Start Navigation
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Navigation</CardTitle>
          <Badge variant="secondary">
            Stop {currentStep + 1} of {currentRoute.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{currentLocation?.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentLocation?.address}
          </p>
          {currentLocation?.volume && (
            <p className="text-sm">
              Volume: {currentLocation.volume} | ARR: ${((parseFloat(currentLocation.volume) * 52) * 18).toLocaleString()}
            </p>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === currentRoute.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="secondary"
            onClick={() => {
              // Mark current location as visited
              // Update visit status
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark Visited
          </Button>
          <Button 
            variant="destructive"
            onClick={stopNavigation}
          >
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/controls/route-controls.tsx
"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouteStore } from "@/store/route-store"
import { Settings2, Navigation, Car } from "lucide-react"

export function RouteControls() {
  const {
    settings,
    updateSettings,
    optimizeRoute,
    isOptimizing,
  } = useRouteStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Stops */}
        <div className="space-y-2">
          <Label>Maximum Stops</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxStops]}
              onValueChange={(value) => updateSettings({ maxStops: value[0] })}
              min={5}
              max={50}
              step={5}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxStops}</span>
          </div>
        </div>

        {/* Max Distance */}
        <div className="space-y-2">
          <Label>Maximum Distance (km)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.maxDistance]}
              onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="min-w-[4ch] text-right">{settings.maxDistance}km</span>
          </div>
        </div>

        {/* Transport Mode */}
        <div className="space-y-2">
          <Label>Transport Mode</Label>
          <Select
            value={settings.transportMode}
            onValueChange={(value) => updateSettings({ transportMode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRIVING">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Driving</span>
                </div>
              </SelectItem>
              <SelectItem value="WALKING">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>Walking</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Route Optimization */}
        <div className="space-y-2">
          <Label>Optimize By</Label>
          <Select
            value={settings.optimizeBy}
            onValueChange={(value) => updateSettings({ optimizeBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="volume">Volume Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-highways">Avoid Highways</Label>
            <Switch
              id="avoid-highways"
              checked={settings.avoidHighways}
              onCheckedChange={(checked) => 
                updateSettings({ avoidHighways: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="avoid-tolls">Avoid Tolls</Label>
            <Switch
              id="avoid-tolls"
              checked={settings.avoidTolls}
              onCheckedChange={(checked) => 
                updateSettings({ avoidTolls: checked })
              }
            />
          </div>
        </div>

        {/* Optimize Button */}
        <Button 
          className="w-full" 
          onClick={optimizeRoute}
          disabled={isOptimizing}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {isOptimizing ? "Optimizing..." : "Optimize Route"}
        </Button>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/location-action-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { RouteGenerationDialog } from "./route-generation-dialog"

interface LocationActionDialogProps {
  shop: CoffeeShop
  onGenerateRoute: (shop: CoffeeShop) => void
  onVisitRecorded: () => void
}

export function LocationActionDialog({
  shop,
  onGenerateRoute,
  onVisitRecorded,
}: LocationActionDialogProps) {
  const { toast } = useToast()
  const [managerPresent, setManagerPresent] = useState(false)
  const [staffSize, setStaffSize] = useState("")
  const [showRouteDialog, setShowRouteDialog] = useState(false)

  const handleVisitRecord = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerPresent,
          staffSize: parseInt(staffSize),
          date: new Date(),
        }),
      })

      if (!response.ok) throw new Error("Failed to record visit")

      toast({
        title: "Visit Recorded",
        description: "The visit has been successfully recorded.",
      })
      onVisitRecorded()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shop.title}</DialogTitle>
          <DialogDescription>
            {shop.address}
            <div className="flex gap-2 mt-2">
              {shop.visited && <Badge variant="success">Visited</Badge>}
              {shop.is_source && <Badge variant="default">Source Location</Badge>}
              {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Manager Present</Label>
            <Switch
              checked={managerPresent}
              onCheckedChange={setManagerPresent}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-2">Estimated Staff Size</Label>
            <Input
              type="number"
              value={staffSize}
              onChange={(e) => setStaffSize(e.target.value)}
              className="col-span-2"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setShowRouteDialog(true)}
            className="w-full"
          >
            Generate Route from Here
          </Button>
          <Button
            type="submit"
            onClick={handleVisitRecord}
            className="w-full"
            variant={shop.visited ? "outline" : "default"}
          >
            {shop.visited ? "Update Visit" : "Mark as Visited"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <RouteGenerationDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        startingPoint={shop}
        onGenerate={onGenerateRoute}
      />
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/map-preview.tsx
"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPreviewProps {
  startingPoint: CoffeeShop
  maxDistance: number
  className?: string
}

export function MapPreview({
  startingPoint,
  maxDistance,
  className
}: MapPreviewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={[startingPoint.latitude, startingPoint.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[startingPoint.latitude, startingPoint.longitude]}
        />
        <Circle
          center={[startingPoint.latitude, startingPoint.longitude]}
          radius={maxDistance * 1000}
          pathOptions={{ fillColor: "blue", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/map.tsx
"use client"

import { useEffect, useRef } from "react"
import { useMapStore } from "@/store/use-map"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { ShopMarker } from "./shop-marker"
import { RouteLayer } from "./route-layer"
import { useShops } from "@/hooks/use-shops"

export function Map() {
  const mapRef = useRef(null)
  const { shops = [], loading } = useShops()
  const { center, zoom, selectedShop, setSelectedShop } = useMapStore()

  if (loading) {
    return <div>Loading map...</div>
  }

  return (
    <div className="h-[800px] rounded-lg border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {shops?.map((shop) => (
          <ShopMarker
            key={shop.id}
            shop={shop}
            selected={selectedShop?.id === shop.id}
            onSelect={setSelectedShop}
          />
        ))}

        <RouteLayer />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-controls.tsx
"use client"

import { useState } from "react"
import { useRouteStore } from "@/store/use-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useShops } from "@/hooks/use-shops"

export function RouteControls() {
  const [loading, setLoading] = useState(false)
  const { generateRoute, clearRoute, settings, updateSettings } = useRouteStore()
  const { shops, loading: shopsLoading } = useShops()

  // Filter source shops (either is_source=true or visited=true)
  const sourceShops = shops?.filter(shop => shop.is_source || shop.visited) || []

  const handleGenerateRoute = async () => {
    setLoading(true)
    await generateRoute()
    setLoading(false)
  }

  if (shopsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Settings</CardTitle>
        </CardHeader>
        <CardContent>
          Loading source shops...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label>Starting Point</label>
          <Select
            value={settings.startingPoint}
            onValueChange={(value) => updateSettings({ startingPoint: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a starting point" />
            </SelectTrigger>
            <SelectContent>
              {sourceShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.title}
                  {shop.is_source && " (Partner)"}
                  {shop.visited && !shop.is_source && " (Visited)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select a partner shop or previously visited location
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Stops</label>
          <Input
            type="number"
            value={settings.maxStops}
            onChange={(e) => updateSettings({ maxStops: parseInt(e.target.value) })}
            min={1}
            max={20}
          />
          <p className="text-sm text-muted-foreground">
            Maximum number of stops in the route
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Distance (km)</label>
          <Slider
            value={[settings.maxDistance]}
            onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
            min={1}
            max={10}
            step={0.5}
          />
          <p className="text-sm text-muted-foreground">
            Maximum distance between stops
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleGenerateRoute} 
            className="w-full"
            disabled={loading || !settings.startingPoint}
          >
            {loading ? "Generating..." : "Generate Route"}
          </Button>
          <Button 
            onClick={clearRoute}
            variant="outline" 
            className="w-full"
          >
            Clear Route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-generation-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPreview } from "./map-preview"

interface RouteGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startingPoint: CoffeeShop
  onGenerate: (shop: CoffeeShop) => void
}

export function RouteGenerationDialog({
  open,
  onOpenChange,
  startingPoint,
  onGenerate,
}: RouteGenerationDialogProps) {
  const [maxStops, setMaxStops] = useState(5)
  const [maxDistance, setMaxDistance] = useState(2)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/routes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startingPoint: startingPoint.id,
          maxStops,
          maxDistance,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate route")

      const route = await response.json()
      onGenerate(route)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to generate route:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Route</DialogTitle>
          <DialogDescription>
            Generate a route starting from {startingPoint.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Maximum Stops</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxStops]}
                onValueChange={(value) => setMaxStops(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxStops}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance (km)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                min={0.5}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxDistance}</span>
            </div>
          </div>

          <MapPreview
            startingPoint={startingPoint}
            maxDistance={maxDistance}
            className="h-[200px] rounded-lg border"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-layer.tsx
"use client"

import { Polyline } from "react-leaflet"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route?: CoffeeShop[]
  color?: string
}

export function RouteLayer({ route, color = "#3B82F6" }: RouteLayerProps) {
  if (!route || route.length < 2) return null

  const positions = route.map(shop => [shop.latitude, shop.longitude])

  return (
    <Polyline
      positions={positions as [number, number][]}
      pathOptions={{
        color,
        weight: 3,
        opacity: 0.7,
      }}
    />
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/route-map.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouteStore } from "@/store/route-store"
import { calculateDistance, degToRad } from "@/lib/utils/geo"

interface GoogleMapWrapper extends google.maps.Map {
  markers?: google.maps.Marker[]
  currentLocationMarker?: google.maps.Marker
}

export function RouteMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<GoogleMapWrapper | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const {
    selectedLocations,
    currentRoute,
    settings,
    isNavigating,
    currentStep,
    setMetrics,
  } = useRouteStore()
  const { toast } = useToast()

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps") as any
        const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes") as any

        const mapInstance = new Map(mapRef.current, {
          center: { lat: selectedLocations[0]?.latitude || 40.7128, lng: selectedLocations[0]?.longitude || -74.0060 },
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        const directionsServiceInstance = new DirectionsService()
        const directionsRendererInstance = new DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,  // We'll add custom markers
        })

        setMap(mapInstance)
        setDirectionsService(directionsServiceInstance)
        setDirectionsRenderer(directionsRendererInstance)
        
        // Add traffic layer
        const trafficLayer = new google.maps.TrafficLayer()
        trafficLayer.setMap(mapInstance)

      } catch (error) {
        console.error('Failed to initialize map:', error)
        toast({
          title: "Error",
          description: "Failed to load map. Please try refreshing the page.",
          variant: "destructive"
        })
      }
    }

    const loadGoogleMaps = () => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onload = () => initMap()
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    return () => {
      if (map) {
        map.markers?.forEach(marker => marker.setMap(null))
        if (directionsRenderer) directionsRenderer.setMap(null)
      }
    }
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    map.markers?.forEach(marker => marker.setMap(null))
    map.markers = []

    const bounds = new google.maps.LatLngBounds()

    // Add markers for selected locations
    selectedLocations.forEach((location, index) => {
      const position = { lat: location.latitude, lng: location.longitude }
      bounds.extend(position)

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: location.visited ? "#22c55e" : "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: location.title,
        label: {
          text: (index + 1).toString(),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold"
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-4">
            <h3 class="font-bold">${location.title}</h3>
            <p class="text-sm text-muted-foreground">${location.address}</p>
            ${location.volume ? `
              <p class="text-sm mt-2">Volume: ${location.volume}</p>
              <p class="text-sm">ARR: $${((parseFloat(location.volume) * 52) * 18).toLocaleString()}</p>
            ` : ''}
            ${location.manager_present ? `
              <p class="text-sm">Manager: ${location.manager_present}</p>
            ` : ''}
            ${location.visited ? 
              '<span class="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Visited</span>' :
              '<span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Not Visited</span>'
            }
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      if (!map.markers) map.markers = []
      map.markers.push(marker)
    })

    if (selectedLocations.length > 0) {
      map.fitBounds(bounds)
    }
  }, [map, selectedLocations])

  // Update route display when route changes
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer || currentRoute.length < 2) return

    const calculateRoute = async () => {
      try {
        const waypoints = currentRoute.slice(1, -1).map(location => ({
          location: { lat: location.latitude, lng: location.longitude },
          stopover: true
        }))

        const request = {
          origin: { lat: currentRoute[0].latitude, lng: currentRoute[0].longitude },
          destination: { 
            lat: currentRoute[currentRoute.length - 1].latitude, 
            lng: currentRoute[currentRoute.length - 1].longitude 
          },
          waypoints,
          optimizeWaypoints: true,
          travelMode: settings.transportMode as google.maps.TravelMode,
          avoidHighways: settings.avoidHighways,
          avoidTolls: settings.avoidTolls,
        }

        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(request, (result, status) => {
            if (status === 'OK') resolve(result)
            else reject(new Error(`Directions request failed: ${status}`))
          })
        })

        directionsRenderer.setDirections(result)

        // Calculate metrics
        let totalDistance = 0
        let totalDuration = 0
        result.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0
          totalDuration += leg.duration?.value || 0
        })

        setMetrics({
          totalDistance: totalDistance / 1000, // Convert to kilometers
          totalDuration: totalDuration / 60, // Convert to minutes
          numberOfStops: currentRoute.length,
          estimatedArrival: new Date(Date.now() + totalDuration * 1000).toLocaleTimeString()
        })

      } catch (error) {
        console.error('Failed to calculate route:', error)
        toast({
          title: "Error",
description: "Failed to calculate route. Please try again.",
          variant: "destructive"
        })
      }
    }

    calculateRoute()
  }, [map, directionsService, directionsRenderer, currentRoute, settings])

  // Handle navigation mode
  useEffect(() => {
    if (!map || !isNavigating) return

    const location = currentRoute[currentStep]
    if (!location) return

    // Update map view for current location
    map.panTo({ lat: location.latitude, lng: location.longitude })
    map.setZoom(16)

    // Update current location marker
    if (map.currentLocationMarker) {
      map.currentLocationMarker.setMap(null)
    }

    map.currentLocationMarker = new google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
        rotation: 0
      }
    })

    // Start location tracking if available
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )

          // Update current location marker
          if (map.currentLocationMarker) {
            map.currentLocationMarker.setPosition(currentPos)

            // Calculate bearing to destination
            const heading = google.maps.geometry.spherical.computeHeading(
              currentPos,
              new google.maps.LatLng(location.latitude, location.longitude)
            )

            // Update marker rotation
            map.currentLocationMarker.setIcon({
              ...map.currentLocationMarker.getIcon(),
              rotation: heading
            })

            // Check if near destination (within 50 meters)
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              currentPos,
              new google.maps.LatLng(location.latitude, location.longitude)
            )

            if (distance < 50) {
              // Trigger arrival event
              toast({
                title: "Arrived at destination",
                description: `You have arrived at ${location.title}`,
              })
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          toast({
            title: "Location Error",
            description: "Unable to track current location.",
            variant: "destructive"
          })
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [map, isNavigating, currentStep, currentRoute])

  return (
    <Card className="relative overflow-hidden">
      <div 
        ref={mapRef}
        className="w-full h-[800px] rounded-lg" 
      />
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/map/shop-marker.tsx
"use client"

import { useState } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { CoffeeShop } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouteStore } from "@/store/use-route"
import "leaflet/dist/leaflet.css"

interface ShopMarkerProps {
  shop: CoffeeShop
  selected?: boolean
  onSelect?: (shop: CoffeeShop) => void
}

export function ShopMarker({ shop, selected, onSelect }: ShopMarkerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [managerPresent, setManagerPresent] = useState(false)
  const [managerName, setManagerName] = useState("")
  const [samplesDropped, setSamplesDropped] = useState(false)
  const [sampleDetails, setSampleDetails] = useState("")
  const [notes, setNotes] = useState("")
  const { updateSettings, generateRoute } = useRouteStore()

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="
        w-8 h-8 rounded-full flex items-center justify-center text-white
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${shop.visited ? 'bg-green-500' : shop.is_source ? 'bg-red-500' : 'bg-blue-500'}
        ${shop.parlor_coffee_leads ? 'border-2 border-yellow-400' : ''}
      ">
        ${shop.visited ? '✓' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  const handleMarkVisited = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(),
          managerPresent,
          managerName: managerName || undefined,
          samplesDropped,
          sampleDetails: sampleDetails || undefined,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to record visit')

      toast({
        title: "Visit recorded",
        description: "The shop has been marked as visited",
      })

      setVisitDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit",
        variant: "destructive",
      })
    }
  }

  const handleGenerateRoute = async () => {
    try {
      await updateSettings({ startingPoint: shop.id })
      await generateRoute()
      toast({
        title: "Route generated",
        description: `Route generated from ${shop.title}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate route",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Marker
        position={[shop.latitude, shop.longitude]}
        icon={customIcon}
        eventHandlers={{
          click: () => onSelect?.(shop),
        }}
      >
        <Popup>
          <div className="min-w-[200px] space-y-4">
            <div>
              <h3 className="font-bold mb-1">{shop.title}</h3>
              <p className="text-sm mb-1">{shop.address}</p>
              {shop.rating && (
                <p className="text-sm mb-1">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
              {shop.visited && (
                <p className="text-sm text-green-600">✓ Visited</p>
              )}
              {shop.parlor_coffee_leads && (
                <p className="text-sm text-yellow-600">🎯 Lead</p>
              )}
              {shop.is_source && (
                <p className="text-sm text-red-600">📍 Source Location</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleGenerateRoute}
                className="w-full"
              >
                Generate Route From Here
              </Button>
              
              {!shop.visited && (
                <Button 
                  onClick={() => setVisitDialogOpen(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Mark as Visited
                </Button>
              )}

              {shop.website && (
                <Button 
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Popup>
      </Marker>

      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Visit - {shop.title}</DialogTitle>
            <DialogDescription>
              Record details about your visit to this coffee shop
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="manager-present">Manager Present</Label>
              <Switch
                id="manager-present"
                checked={managerPresent}
                onCheckedChange={setManagerPresent}
              />
            </div>

            {managerPresent && (
              <div className="space-y-2">
                <Label htmlFor="manager-name">Manager's Name</Label>
                <Input
                  id="manager-name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Enter manager's name"
                />
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="samples-dropped">Samples Dropped</Label>
              <Switch
                id="samples-dropped"
                checked={samplesDropped}
                onCheckedChange={setSamplesDropped}
              />
            </div>

            {samplesDropped && (
              <div className="space-y-2">
                <Label htmlFor="sample-details">Sample Details</Label>
                <Input
                  id="sample-details"
                  value={sampleDetails}
                  onChange={(e) => setSampleDetails(e.target.value)}
                  placeholder="Enter sample details"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the visit"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkVisited}>
              Record Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/list/route-list.tsx
"use client"

import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouteStore } from "@/store/route-store"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { 
  GripVertical,
  MapPin,
  Building2,
  Users,
  DollarSign,
  ArrowUpDown,
} from "lucide-react"

export function RouteList() {
  const {
    currentRoute,
    updateRoute,
    removeLocation,
    isNavigating,
    currentStep,
  } = useRouteStore()

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return

    const items = Array.from(currentRoute)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    updateRoute(items)
  }, [currentRoute, updateRoute])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route Stops</CardTitle>
          <Badge variant="secondary">
            {currentRoute.length} stops
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="route-stops">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {currentRoute.map((location, index) => (
                    <Draggable
                      key={location.id}
                      draggableId={location.id}
                      index={index}
                      isDragDisabled={isNavigating}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 rounded-lg border ${
                            snapshot.isDragging ? "border-primary" : "border-border"
                          } ${
                            isNavigating && index === currentStep 
                              ? "bg-primary/10 border-primary" 
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1.5 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {location.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {location.address}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {location.manager_present && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{location.manager_present}</span>
                                  </div>
                                )}
                                {location.volume && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{location.volume}</span>
                                  </div>
                                )}
                                {location.visited && (
                                  <Badge variant="success" className="text-xs">
                                    Visited
                                  </Badge>
                                )}
                                {location.parlor_coffee_leads && (
                                  <Badge variant="warning" className="text-xs">
                                    Lead
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {!isNavigating && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeLocation(location.id)}
                              >
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/leads-analytics.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { CoffeeShop } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LeadsAnalytics() {
  const { shops, loading } = useShops()
  const [leads, setLeads] = useState<CoffeeShop[]>([])

  useEffect(() => {
    if (shops) {
      const leadShops = shops
        .filter(shop => shop.parlor_coffee_leads)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setLeads(leadShops)
    }
  }, [shops])

  if (loading) {
    return <div>Loading leads...</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {leads.map((shop) => (
          <div key={shop.id} className="flex items-start space-x-4">
            <Badge variant={shop.visited ? "success" : "default"}>
              {shop.visited ? "Visited" : "New Lead"}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{shop.title}</p>
              <p className="text-sm text-muted-foreground">{shop.area}</p>
              {shop.rating && (
                <p className="text-xs">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads generated yet</p>
        )}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/route-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitStats } from "./visit-stats"
import { VisitChart } from "./visit-chart"
import { LeadsAnalytics } from "./leads-analytics"

export function RouteAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Visit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitStats />
          <VisitChart />
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/visit-chart.tsx
"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useShops } from "@/hooks/use-shops"

interface VisitData {
  area: string
  totalShops: number
  visitedShops: number
  leads: number
}

export function VisitChart() {
  const { shops, loading } = useShops()
  const [data, setData] = useState<VisitData[]>([])

  useEffect(() => {
    if (shops && shops.length > 0) {
      // Group shops by area
      const areaData = shops.reduce((acc, shop) => {
        const area = shop.area || 'Unknown'
        if (!acc[area]) {
          acc[area] = {
            area,
            totalShops: 0,
            visitedShops: 0,
            leads: 0
          }
        }
        
        acc[area].totalShops++
        if (shop.visited) acc[area].visitedShops++
        if (shop.parlor_coffee_leads) acc[area].leads++
        
        return acc
      }, {} as Record<string, VisitData>)

      setData(Object.values(areaData))
    }
  }, [shops])

  if (loading) {
    return <div>Loading chart...</div>
  }

  return (
    <div className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalShops" name="Total Shops" fill="#94a3b8" />
          <Bar dataKey="visitedShops" name="Visited" fill="#22c55e" />
          <Bar dataKey="leads" name="Leads" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/components/routes/analytics/visit-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"

interface VisitStats {
  totalVisits: number
  totalShops: number
  visitedShops: number
  visitRate: number
  leadsGenerated: number
  conversionRate: number
}

export function VisitStats() {
  const { shops, loading } = useShops()
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    totalShops: 0,
    visitedShops: 0,
    visitRate: 0,
    leadsGenerated: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (shops && shops.length > 0) {
      const visitedShops = shops.filter(shop => shop.visited).length
      const leadsGenerated = shops.filter(shop => shop.parlor_coffee_leads).length

      setStats({
        totalVisits: 0, // This would come from Visit records
        totalShops: shops.length,
        visitedShops,
        visitRate: (visitedShops / shops.length) * 100,
        leadsGenerated,
        conversionRate: (leadsGenerated / visitedShops) * 100 || 0
      })
    }
  }, [shops])

  if (loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Visit Rate"
        value={`${stats.visitRate.toFixed(1)}%`}
        description={`${stats.visitedShops} of ${stats.totalShops} shops`}
      />
      <StatCard
        title="Leads Generated"
        value={stats.leadsGenerated.toString()}
        description="Potential opportunities"
      />
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        description="Visits to leads"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/route-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CoffeeShop } from '@prisma/client'
import { RouteSettings, RouteMetrics } from '@/types/route'

interface RouteState {
  selectedLocations: CoffeeShop[]
  currentRoute: CoffeeShop[]
  settings: RouteSettings
  metrics: RouteMetrics | null
  isOptimizing: boolean
  isNavigating: boolean
  currentStep: number
  addLocation: (location: CoffeeShop) => void
  removeLocation: (locationId: string) => void
  updateRoute: (route: CoffeeShop[]) => void
  updateSettings: (settings: Partial<RouteSettings>) => void
  setMetrics: (metrics: RouteMetrics) => void
  startNavigation: () => void
  stopNavigation: () => void
  nextStep: () => void
  previousStep: () => void
  clearRoute: () => void
  optimizeRoute: () => Promise<void>
  exportToCalendar: () => Promise<void>
  shareRoute: () => Promise<void>
}

const defaultSettings: RouteSettings = {
  maxStops: 10,
  maxDistance: 5,
  optimizeBy: 'distance',
  avoidHighways: false,
  avoidTolls: false,
  transportMode: 'DRIVING',
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      selectedLocations: [],
      currentRoute: [],
      settings: defaultSettings,
      metrics: null,
      isOptimizing: false,
      isNavigating: false,
      currentStep: -1,

      addLocation: (location) => {
        set((state) => ({
          selectedLocations: [...state.selectedLocations, location]
        }))
      },

      removeLocation: (locationId) => {
        set((state) => ({
          selectedLocations: state.selectedLocations.filter(
            (loc) => loc.id !== locationId
          )
        }))
      },

      updateRoute: (route) => {
        set({ currentRoute: route })
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }))
      },

      setMetrics: (metrics) => {
        set({ metrics })
      },

      startNavigation: () => {
        set({ isNavigating: true, currentStep: 0 })
      },

      stopNavigation: () => {
        set({ isNavigating: false, currentStep: -1 })
      },

      nextStep: () => {
        const { currentStep, currentRoute } = get()
        if (currentStep < currentRoute.length - 1) {
          set({ currentStep: currentStep + 1 })
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      clearRoute: () => {
        set({
          selectedLocations: [],
          currentRoute: [],
          metrics: null,
          isNavigating: false,
          currentStep: -1
        })
      },

      optimizeRoute: async () => {
        const state = get()
        set({ isOptimizing: true })
        try {
          // Optimization logic here
          set({ isOptimizing: false })
        } catch (error) {
          set({ isOptimizing: false })
          throw error
        }
      },

      exportToCalendar: async () => {
        const { currentRoute } = get()
        // Calendar export logic
      },

      shareRoute: async () => {
        const { currentRoute } = get()
        // Share route logic
      }
    }),
    {
      name: 'route-storage'
    }
  )
)
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-map.ts
import { create } from 'zustand'
import { Shop } from '@/types/shop'

interface MapState {
  center: [number, number]
  zoom: number
  selectedShop: Shop | null
  setSelectedShop: (shop: Shop | null) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
}

export const useMapStore = create<MapState>((set) => ({
  center: [40.7128, -74.0060], // Default to NYC coordinates
  zoom: 12,
  selectedShop: null,
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
}))
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-route.ts
import { create } from 'zustand'
import { CoffeeShop } from '@prisma/client'
import { RouteOptimizer } from '@/lib/route-optimizer'

interface RouteSettings {
  startingPoint: string
  maxStops: number
  maxDistance: number
}

interface RouteState {
  settings: RouteSettings
  currentRoute: CoffeeShop[]
  loading: boolean
  error: string | null
  updateSettings: (settings: Partial<RouteSettings>) => void
  generateRoute: () => Promise<void>
  clearRoute: () => void
}

export const useRouteStore = create<RouteState>((set, get) => ({
  settings: {
    startingPoint: '',
    maxStops: 10,
    maxDistance: 5,
  },
  currentRoute: [],
  loading: false,
  error: null,

  updateSettings: (newSettings) => 
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  generateRoute: async () => {
    set({ loading: true, error: null })
    try {
      const { settings } = get()
      
      // Fetch shops
      const shopsResponse = await fetch('/api/coffee-shops')
      const shops: CoffeeShop[] = await shopsResponse.json()
      
      // Find starting shop
      const startShop = shops.find(shop => shop.id === settings.startingPoint)
      if (!startShop) throw new Error('Starting point not found')
      
      // Get target shops (exclude visited and source locations)
      const targetShops = shops.filter(shop => 
        !shop.visited && 
        !shop.is_source && 
        shop.id !== settings.startingPoint
      )

      // Initialize optimizer
      const optimizer = new RouteOptimizer({
        maxStops: settings.maxStops,
        maxDistance: settings.maxDistance
      })

      // Generate route
      const route = await optimizer.generateRoute(startShop, targetShops)
      
      // Update state with route
      set({ 
        currentRoute: [startShop, ...route.map(stop => stop.shop)],
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  clearRoute: () => set({ currentRoute: [] }),
}))
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-scheduling-store.ts
import { create } from 'zustand';
import { Shift, Staff, ShiftTemplate } from '@/types/scheduling';
import { ShiftType, StaffRole } from '@prisma/client';

interface DateRange {
  from: Date;
  to: Date;
}

interface SchedulingState {
  // Data
  shifts: Shift[];
  staff: Staff[];
  templates: ShiftTemplate[];
  
  // UI State
  selectedDate: Date;
  dateRange: DateRange;
  selectedShift: string | null;
  selectedStaff: string | null;
  
  // Filters
  filter: {
    shiftType: ShiftType | 'ALL';
    staffRole: StaffRole | null;
    certifications: string[];
    dateRange: DateRange | null;
  };

  // Loading States
  isLoading: {
    shifts: boolean;
    staff: boolean;
    templates: boolean;
  };

  // Actions
  setShifts: (shifts: Shift[]) => void;
  setStaff: (staff: Staff[]) => void;
  setTemplates: (templates: ShiftTemplate[]) => void;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedShift: (shiftId: string | null) => void;
  setSelectedStaff: (staffId: string | null) => void;
  setFilter: (filter: Partial<SchedulingState['filter']>) => void;
  setLoading: (key: keyof SchedulingState['isLoading'], value: boolean) => void;
}

export const useSchedulingStore = create<SchedulingState>((set) => ({
  // Initial Data
  shifts: [],
  staff: [],
  templates: [],

  // Initial UI State
  selectedDate: new Date(),
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  },
  selectedShift: null,
  selectedStaff: null,

  // Initial Filters
  filter: {
    shiftType: 'ALL',
    staffRole: null,
    certifications: [],
    dateRange: null,
  },

  // Initial Loading States
  isLoading: {
    shifts: false,
    staff: false,
    templates: false,
  },

  // Actions
  setShifts: (shifts) => set({ shifts }),
  setStaff: (staff) => set({ staff }),
  setTemplates: (templates) => set({ templates }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedShift: (selectedShift) => set({ selectedShift }),
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  setLoading: (key, value) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
}));

// Selectors
export const useSelectedShift = () => useSchedulingStore(
  (state) => state.shifts.find(s => s.id === state.selectedShift)
);

export const useFilteredShifts = () => useSchedulingStore((state) => {
  const { shifts, filter } = state;
  return shifts.filter(shift => {
    if (filter.shiftType !== 'ALL' && shift.type !== filter.shiftType) return false;
    if (filter.dateRange) {
      const shiftDate = new Date(shift.startTime);
      if (shiftDate < filter.dateRange.from || shiftDate > filter.dateRange.to) return false;
    }
    return true;
  });
});

export const useFilteredStaff = () => useSchedulingStore((state) => {
  const { staff, filter } = state;
  return staff.filter(s => {
    if (filter.staffRole && s.role !== filter.staffRole) return false;
    if (filter.certifications.length > 0) {
      return filter.certifications.every(cert => s.certifications.includes(cert));
    }
    return true;
  });
});
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-shift-store.ts
import { create } from 'zustand';
import { Shift } from '@/types/scheduling/shift';

interface ShiftStore {
 shifts: Shift[];
 selectedShift: Shift | null;
 loading: boolean;
 error: string | null;
 draggingShift: {
   shift: Shift;
   type: 'move' | 'resize';
 } | null;
 
 // Actions
 setShifts: (shifts: Shift[]) => void;
 selectShift: (shift: Shift | null) => void;
 setLoading: (loading: boolean) => void;
 setError: (error: string | null) => void;
 setDraggingShift: (dragging: { shift: Shift; type: 'move' | 'resize' } | null) => void;
 
 // Async actions
 fetchShifts: (startDate: Date, endDate: Date) => Promise<void>;
 createShift: (shiftData: Partial<Shift>) => Promise<void>;
 updateShift: (id: string, shiftData: Partial<Shift>) => Promise<void>;
 deleteShift: (id: string) => Promise<void>;
 assignStaff: (shiftId: string, staffId: string) => Promise<void>;
 removeStaffAssignment: (shiftId: string, staffId: string) => Promise<void>;
}

export const useShiftStore = create<ShiftStore>((set) => ({
 shifts: [],
 selectedShift: null,
 loading: false,
 error: null,
 draggingShift: null,

 setShifts: (shifts) => set({ shifts }),
 selectShift: (shift) => set({ selectedShift: shift }),
 setLoading: (loading) => set({ loading }),
 setError: (error) => set({ error }),
 setDraggingShift: (dragging) => set({ draggingShift: dragging }),

 fetchShifts: async (startDate: Date, endDate: Date) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
     );
     
     if (!response.ok) throw new Error('Failed to fetch shifts');
     
     const shifts = await response.json();
     set({ shifts, loading: false });
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to fetch shifts',
       loading: false 
     });
   }
 },

 createShift: async (shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch('/api/scheduling/shifts', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to create shift');
     
     const newShift = await response.json();
     set((state) => ({ 
       shifts: [...state.shifts, newShift],
       loading: false 
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to create shift',
       loading: false 
     });
   }
 },

 updateShift: async (id, shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to update shift');
     
     const updatedShift = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => s.id === id ? updatedShift : s),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to update shift',
       loading: false 
     });
   }
 },

 deleteShift: async (id) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'DELETE',
     });
     
     if (!response.ok) throw new Error('Failed to delete shift');
     
     set((state) => ({
       shifts: state.shifts.filter((s) => s.id !== id),
       selectedShift: null,
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to delete shift',
       loading: false 
     });
   }
 },

 assignStaff: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${shiftId}/assignments`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ staffId }),
     });
     
     if (!response.ok) throw new Error('Failed to assign staff');
     
     const assignment = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: [...s.assignedStaff, assignment]
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to assign staff',
       loading: false 
     });
   }
 },

 removeStaffAssignment: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts/${shiftId}/assignments?staffId=${staffId}`,
       { method: 'DELETE' }
     );
     
     if (!response.ok) throw new Error('Failed to remove staff assignment');
     
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: s.assignedStaff.filter(
               (a) => a.staffId !== staffId
             )
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to remove staff assignment',
       loading: false 
     });
   }
 }
}));
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-sidebar.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isResetting: boolean;
  toggleCollapse: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isResetting: false,
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      onResetStart: () => set({ isResetting: true }),
      onResetEnd: () => set({ isResetting: false }),
    }),
    {
      name: 'sidebar-state',
    }
  )
);
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/koatji-crm/src/store/use-visit.ts
import { create } from 'zustand'
import { Visit, VisitFormData } from '@/types/visit'

interface VisitState {
  visits: Visit[]
  loading: boolean
  error: string | null
  fetchVisits: (shopId: string) => Promise<void>
  addVisit: (shopId: string, data: VisitFormData) => Promise<void>
  updateVisit: (visitId: string, data: Partial<VisitFormData>) => Promise<void>
}

export const useVisitStore = create<VisitState>((set) => ({
  visits: [],
  loading: false,
  error: null,

  fetchVisits: async (shopId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`)
      if (!response.ok) throw new Error('Failed to fetch visits')

      const visits = await response.json()
      set({ visits, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  addVisit: async (shopId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to add visit')

      const newVisit = await response.json()
      set((state) => ({
        visits: [...state.visits, newVisit],
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  updateVisit: async (visitId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update visit')

      const updatedVisit = await response.json()
      set((state) => ({
        visits: state.visits.map((visit) =>
          visit.id === visitId ? updatedVisit : visit
        ),
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },
}))
________________________________________________________________________________
