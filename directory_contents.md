### /Users/mohameddiomande/Desktop/code/buf-crm/next.config.ts
module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/prisma/schema.prisma
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
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
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
}

model Contact {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  firstName String
  lastName  String
  email     String
  phone     String?
  company   String?
  notes     String?
  status    Status   @default(NEW)
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MenuItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean   @default(false)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime  @default(now())
  total          Float
  isComplimentary Boolean   @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String    @db.ObjectId
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
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


model Folder {
  id        String    @id @default(cuid())
  name      String
  color     String?   @default("#94a3b8")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  qrCodes   QRCode[]
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(cuid())
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]

  @@index([shortCode])
}

model DeviceRule {
  id         String   @id @default(cuid())
  qrCodeId   String
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
  id         String    @id @default(cuid())
  qrCodeId   String
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/prisma/seed.ts
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
### /Users/mohameddiomande/Desktop/code/buf-crm/setup-buf-crm.sh
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Creating complete reports implementation...${NC}"

# First, let's update the prisma schema
cat > prisma/schema.prisma << 'EOF'
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
  menuItems     MenuItem[]
  quickNotes    QuickNote[]
  salesReports  SalesReport[]
  metricsSnapshots MetricsSnapshot[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
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
}

model Contact {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  firstName String
  lastName  String
  email     String
  phone     String?
  company   String?
  notes     String?
  status    Status   @default(NEW)
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MenuItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean   @default(false)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
  salesMetrics SalesItemMetrics[]
}

model Order {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime  @default(now())
  total          Float
  isComplimentary Boolean   @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String    @db.ObjectId
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  salesReport    SalesReport?  @relation(fields: [salesReportId], references: [id])
  salesReportId  String?   @db.ObjectId
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
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

model SalesReport {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @db.ObjectId
  user                  User      @relation(fields: [userId], references: [id])
  date                  DateTime
  totalSales           Float
  totalOrders          Int
  averageOrderValue    Float
  uniqueCustomers      Int
  repeatCustomerRate   Float
  averagePreparationTime Float
  customerRetentionRate Float
  salesGrowthRate      Float
  orders               Order[]
  peakHourSales        Json      // Stores hour and sales data
  categoryPerformance  Json      // Stores category-wise performance
  topSellingItems      Json      // Stores top selling items data
  hourlyOrders         Json      // Stores orders by hour
  preparationTimes     Json      // Stores preparation time analytics
  dailyMetrics         Json      // Stores daily sales and orders
  periodComparison     Json?     // Stores comparison with previous period
  itemMetrics          SalesItemMetrics[]
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model SalesItemMetrics {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem        MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId      String    @db.ObjectId
  salesReport     SalesReport @relation(fields: [salesReportId], references: [id])
  salesReportId   String    @db.ObjectId
  quantity        Int
  revenue         Float
  averagePrice    Float
  popularity      Float     // Percentage of orders containing this item
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model MetricsSnapshot {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  userId          String    @db.ObjectId
  user            User      @relation(fields: [userId], references: [id])
  timestamp       DateTime  @default(now())
  metrics         Json      // Stores detailed metrics data
  type            String    // daily, weekly, monthly
  periodStart     DateTime
  periodEnd       DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, type, timestamp])
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
EOF

# Create reports service with all helper functions
mkdir -p src/lib/services

cat > src/lib/services/reports-service.ts << 'EOF'
import { 
  Order, 
  SalesReport, 
  MetricsSnapshot,
  SalesItemMetrics,
  CategoryPerformance
} from '@/types/pos';
import { 
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format 
} from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  repeatCustomerRate: number;
  averagePreparationTime: number;
  customerRetentionRate: number;
  salesGrowthRate: number;
  peakHourSales: {
    hour: string | number;
    sales: number;
  };
  categoryPerformance: CategoryPerformance[];
  dailyMetrics: DailyMetrics[];
  topSellingItems: TopSellingItem[];
  hourlyOrders: HourlyOrders[];
  preparationTimes: PreparationTime[];
}

interface DailyMetrics {
  date: string;
  sales: number;
  orders: number;
}

interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface HourlyOrders {
  hour: number;
  orders: number;
}

interface PreparationTime {
  preparationTime: number;
  orderValue: number;
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  includeDetails: boolean;
  dateRange: DateRange;
}

export const reportsService = {
  // Main data fetching function
  async getReports(dateRange: DateRange): Promise<Order[]> {
    try {
      const response = await fetch('/api/pos/reports?' + new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      }));
      
      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const orders = await response.json();
      
      // Store in localStorage as backup
      this.cacheReportData(dateRange.start, orders);
      
      return orders;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return this.getBackupReportData(dateRange);
    }
  },

  // Cache management
  private cacheReportData(startDate: Date, data: Order[]): void {
    const cacheKey = `cached_reports_${format(startDate, 'yyyy-MM-dd')}`;
    const cacheData = {
      timestamp: new Date().toISOString(),
      orders: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  },

  private getBackupReportData(dateRange: DateRange): Order[] {
    // Try to get from cache first
    const cacheKey = `cached_reports_${format(dateRange.start, 'yyyy-MM-dd')}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { orders } = JSON.parse(cachedData);
      return orders;
    }
    
    // Fall back to filtering all orders
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    return allOrders.filter((order: Order) => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  },

  // Detailed metrics generation
  async generateDetailedReport(dateRange: DateRange): Promise<SalesReport> {
    try {
      const response = await fetch('/api/pos/reports/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateRange),
      });
      
      if (!response.ok) throw new Error('Failed to generate detailed report');
      
      const report = await response.json();
      return report;
    } catch (error) {
      console.error('Error generating detailed report:', error);
      throw error;
    }
  },

  // Metrics snapshots
  async getMetricsSnapshot(type: 'daily' | 'weekly' | 'monthly'): Promise<MetricsSnapshot> {
    try {
      const response = await fetch(`/api/pos/reports/metrics/${type}`);
      if (!response.ok) throw new Error('Failed to fetch metrics snapshot');
      return await response.json();
    } catch (error) {
      console.error('Error fetching metrics snapshot:', error);
      throw error;
    }
  },

  // Export functionality
  async exportReportData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch('/api/pos/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) throw new Error('Failed to export report');
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Helper functions for calculations
  calculateMetrics(orders: Order[]): SalesMetrics {
    const totalSales = orders.reduce((sum, order) => 
      sum + (order.isComplimentary ? 0 : order.total), 0
    );

    const totalOrders = orders.length;

    const uniqueCustomers = new Set(
      orders.map(order => order.customerName)
    ).size;

    // More calculations...
    // This is just a partial implementation
    return {
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      uniqueCustomers,
      // ... other metrics
    } as SalesMetrics;
  },

  // Trend analysis
  analyzeTrends(currentPeriod: Order[], previousPeriod: Order[]): any {
    // Implement trend analysis
    return {
      salesGrowth: 0,
      orderGrowth: 0,
      // ... other trend metrics
    };
  },

  // Time-based analysis
  getPeriodComparison(dateRange: DateRange): Promise<any> {
    // Implementation
  },

  // Category analysis
  analyzeCategoryPerformance(orders: Order[]): CategoryPerformance[] {
    // Implementation
  }
};

EOF

# Create API routes for reports
mkdir -p src/app/api/pos/reports

cat > src/app/api/pos/reports/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all orders for the period
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from "@/lib/auth/options";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = registerSchema.parse(json);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(body.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/contacts/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract `id` from the URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return new NextResponse("Bad Request: ID is required", { status: 400 });
    }

    const activities = await prisma.activity.findMany({
      where: {
        contactId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/contacts/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract `id` from the request URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new NextResponse("Contact ID required", { status: 400 });
    }

    const contact = await prisma.contact.findUnique({
      where: {
        id,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new NextResponse("Contact ID required", { status: 400 });
    }

    const body = await req.json();
    const contact = await prisma.contact.update({
      where: {
        id,
      },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new NextResponse("Contact ID required", { status: 400 });
    }

    await prisma.contact.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONTACT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/contacts/route.ts
// src/app/api/contacts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  console.log("[CONTACTS_POST] Starting request handler");

  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions);
    console.log("[CONTACTS_POST] Session data:", {
      email: session?.user?.email,
      exists: !!session
    });

    if (!session?.user?.email) {
      console.log("[CONTACTS_POST] No valid session found");
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // 2. Find user and create if not exists
    let user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log("[CONTACTS_POST] Found user:", user);

    if (!user) {
      console.log("[CONTACTS_POST] User not found, creating new user");
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          password: '', // You might want to handle this differently
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
      console.log("[CONTACTS_POST] Created new user:", user);
    }

    // 3. Get and validate contact data
    const contactData = await request.json();
    console.log("[CONTACTS_POST] Contact data:", contactData);

    // 4. Create the contact
    const contact = await prisma.contact.create({
      data: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone || null,
        company: contactData.company || null,
        notes: contactData.notes || null,
        status: "NEW",
        userId: user.id,
      },
    });

    console.log("[CONTACTS_POST] Created contact:", contact);

    // 5. Return success response
    return NextResponse.json(
      { message: "Contact created successfully", contact },
      { status: 201 }
    );

  } catch (error) {
    console.error("[CONTACTS_POST] Error:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[CONTACTS_GET] Session:", session);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACTS_GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/folders/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"

// DELETE handler
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    // Extract `id` from the URL
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()

    const folder = await prisma.folder.findUnique({
      where: { id: id as string }
    })

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 })
    }

    if (folder.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Delete the folder and set any QR codes in it to have null folderId
    await prisma.$transaction([
      prisma.qRCode.updateMany({
        where: { folderId: id },
        data: { folderId: null }
      }),
      prisma.folder.delete({
        where: { id: id as string }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FOLDER_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// PATCH handler
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    // Extract `id` from the URL
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()

    const folder = await prisma.folder.findUnique({
      where: { id: id as string }
    })

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 })
    }

    if (folder.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: id as string },
      data: {
        name: json.name,
      }
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error("[FOLDER_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/folders/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"

const createFolderSchema = z.object({
  name: z.string().min(2),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { qrCodes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("[FOLDERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const json = await request.json()
    const data = createFolderSchema.parse(json)

    const folder = await prisma.folder.create({
      data: {
        name: data.name,
        userId: user.id,
      },
      include: {
        _count: {
          select: { qrCodes: true }
        }
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[FOLDER_CREATE]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    )
  }
}


________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/menu/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession(authOptions);
   if (!session?.user?.email) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   const data = await request.json();
   const menuItem = await prisma.menuItem.update({
     where: { id: params.id },
     data: {
       name: data.name,
       price: data.price,
       category: data.category,
       popular: data.popular
     }
   });

   return NextResponse.json(menuItem);
 } catch (error) {
   console.error("[MENU_PATCH]", error);
   return NextResponse.json({ error: "Internal error" }, { status: 500 });
 }
}

export async function DELETE(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession(authOptions);
   if (!session?.user?.email) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   await prisma.menuItem.update({
     where: { id: params.id },
     data: { active: false }
   });

   return new NextResponse(null, { status: 204 });
 } catch (error) {
   console.error("[MENU_DELETE]", error);
   return NextResponse.json({ error: "Internal error" }, { status: 500 });
 }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/menu/route.ts
// src/app/api/pos/menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        active: true,
        userId: user.id
      },
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal error", 
        message: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ 
      error: "Internal error" 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        popular: data.popular,
        active: true,
        userId: user.id
      }
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal error", 
        message: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ 
      error: "Internal error" 
    }, { status: 500 });
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Query QuickNotes with proper relation
    const notes = await prisma.quickNote.findMany({
      where: { 
        userId: user.id 
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { 
        createdAt: "desc" 
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("[NOTES_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    
    const note = await prisma.quickNote.create({
      data: {
        content: data.content,
        userId: user.id
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const orderId = params.id;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status,
        notes: data.notes,
        leadInterest: data.leadInterest,
        preparationTime: data.preparationTime,
        items: data.items ? {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        } : undefined
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Update localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = existingOrders.map((order: any) => 
      order.id === orderId ? updatedOrder : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDERS_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

    // Set order status to cancelled instead of deleting
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });

    // Update localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = existingOrders.filter((order: any) => order.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ORDERS_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's orders with included items and menu items
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        status: data.status || 'PENDING',
        total: data.total,
        isComplimentary: data.isComplimentary,
        queueTime: data.queueTime,
        startTime: data.startTime,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes,
        userId: user.id,
        items: {
          create: data.items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create order" }, 
      { status: 500 }
    );
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/pos/waste/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/options";

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email }
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const data = await request.json();
    
//     const wasteLog = await prisma.wasteLog.create({
//       data: {
//         itemName: data.itemName,
//         quantity: data.quantity,
//         reason: data.reason,
//         userId: user.id
//       }
//     });

//     return NextResponse.json(wasteLog);
//   } catch (error) {
//     console.error("[WASTE_POST]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const wasteLogs = await prisma.wasteLog.findMany({
//       orderBy: { createdAt: "desc" }
//     });

//     return NextResponse.json(wasteLogs);
//   } catch (error) {
//     console.error("[WASTE_GET]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/qr/[id]/image/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getQRCodeById } from "@/lib/db"
import { generateQRCode } from "@/lib/qr"

export async function GET(request: NextRequest) {
  try {
    // Extract `id` from the URL path
    const url = new URL(request.url)
    const id = url.pathname.split("/").slice(-2, -1)[0] // grabs the second last part of the path

    const qrCode = await getQRCodeById(id)

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    const imageData = await generateQRCode(qrCode.shortCode)

    return NextResponse.json({ imageData })
  } catch (error) {
    console.error("[QR_CODE_IMAGE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/qr/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

// Define schema for updating QR codes
const updateQRCodeSchema = z.object({
  name: z.string().min(2).optional(),
  defaultUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
})

// PATCH handler for updating a QR code
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const json = await req.json()
    const body = updateQRCodeSchema.parse(json)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedQRCode = await prisma.qRCode.update({
      where: { id },
      data: body,
      include: {
        deviceRules: true,
        scheduleRules: true,
      },
    })

    return NextResponse.json(updatedQRCode)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("[QR_CODE_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// DELETE handler for deleting a QR code
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.qRCode.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QR_CODE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// GET handler for fetching a QR code
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        deviceRules: true,
        scheduleRules: true,
      },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/qr/[id]/schedule-rules/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const scheduleRuleSchema = z.object({
  startDate: z.string(),
  endDate: z.string().nullable(),
  timeZone: z.string(),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  targetUrl: z.string().url(),
  priority: z.number(),
})

const scheduleRulesSchema = z.array(scheduleRuleSchema)

// Use this utility to retrieve params from the request URL.
function getIdFromUrl(req: NextRequest): string | null {
  return req.nextUrl.pathname.split("/").pop() || null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    const id = getIdFromUrl(req)
    if (!id) {
      return new NextResponse("Invalid QR code ID", { status: 400 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: { scheduleRules: true }
    })

    if (!qrCode) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(qrCode.scheduleRules)
  } catch (error) {
    console.error("[SCHEDULE_RULES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    const id = getIdFromUrl(req)
    if (!id) {
      return new NextResponse("Invalid QR code ID", { status: 400 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id }
    })

    if (!qrCode) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const rules = scheduleRulesSchema.parse(json)

    // Delete existing rules
    await prisma.scheduleRule.deleteMany({
      where: { qrCodeId: id }
    })

    // Create new rules
    await prisma.scheduleRule.createMany({
      data: rules.map(rule => ({
        ...rule,
        qrCodeId: id,
        startDate: new Date(rule.startDate),
        endDate: rule.endDate ? new Date(rule.endDate) : null,
        timeZone: rule.timeZone || '',
        targetUrl: '', // Add this line to explicitly define targetUrl as required
        priority: 0 // Add this line to explicitly define priority as required
      }))
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("[SCHEDULE_RULES_PUT]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/qr/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"

const createQRCodeSchema = z.object({
  name: z.string().min(2),
  defaultUrl: z.string().url(),
  folderId: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        folder: true,
      },
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error("[QR_CODES_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    
    let url = json.defaultUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }

    const data = createQRCodeSchema.parse({
      ...json,
      defaultUrl: url,
    })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    function generateShortCode(length: number = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const qrCode = await prisma.qRCode.create({
      data: {
        name: data.name,
        defaultUrl: data.defaultUrl,
        shortCode: generateShortCode(),
        isActive: true,
        userId: user.id,
        folderId: data.folderId,
      },
      include: {
        folder: true,
      },
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_CREATE]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input. Please check your URL format." },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    
    const updatedSettings = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        // Add the fields you want to update
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("[SETTINGS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        name: true,
        email: true,
        // Add other fields you want to return
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/auth/login/page.tsx
import { Metadata } from "next";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login | BUF BARISTA CRM",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/auth/register/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Register | BUF BARISTA CRM",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/contacts/[id]/page.tsx
import { ContactDetails } from "@/components/contacts/contact-details";
import { getContactById } from "@/lib/contacts";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";


// @ts-expect-error - Page props typing conflict with Next.js types
export default async function ContactPage(props: Props) {
  const contact = await getContactById(props.params.id);

  if (!contact) {
    notFound();
  }

  return (
    <PageContainer>
      <ContactDetails initialData={contact} />
    </PageContainer>


  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/contacts/new/page.tsx
import { Metadata } from "next";
import { ContactForm } from "@/components/contacts/contact-form";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "New Contact | CRM",
  description: "Create a new contact in your CRM",
};

export default function NewContactPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <ContactForm />
      </div>
    </PageContainer>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/contacts/page.tsx
import { Suspense } from "react";
import { ContactList } from "@/components/contacts/contact-list";
import { Search } from "@/components/contacts/search";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactStats } from "@/lib/contacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ArrowDown,
  Download,
  MoreHorizontal,
  UserPlus,
  Mail,
  Share2,
  Trash2,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DataTableLoading } from "@/components/contacts/data-table-loading";

interface PageProps {
  searchParams?: {
    [key: string]: string | undefined
  }
}

async function getSearchParams(searchParams: PageProps['searchParams']) {
  const params = {
    search: searchParams?.search,
    status: searchParams?.status,
    sort: searchParams?.sort ?? 'newest',
    page: searchParams?.page ? parseInt(searchParams.page) : 1
  };

  return Promise.resolve(params);
}

export default async function ContactsPage({ searchParams = {} }: PageProps) {
  const [stats, params] = await Promise.all([
    getContactStats(),
    getSearchParams(searchParams)
  ]);

  return (
    <PageContainer>
      <div className="space-y-3 w-full px-2 mx-auto md:space-y-6 md:p-6">
        <h1 className="page-title text-xl md:text-2xl">Contacts</h1>
        
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div></div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/contacts/new" className="flex-1 md:flex-none">
              <Button className="w-full h-8 md:h-9 md:w-auto">
                <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">New Contact</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                  <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Email Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Share List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Filters - More compact on mobile */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-0.5 p-2 md:p-3">
            <CardTitle className="text-sm md:text-base">Filter Contacts</CardTitle>
            <CardDescription className="text-xs">
              Refine your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-2 md:space-y-3 md:p-3">
            <div className="flex flex-col space-y-2 md:space-y-3">
              <div className="space-y-0.5">
                <label className="text-xs font-medium">Status</label>
                <Select value={params.status ?? "all"}>
                  <SelectTrigger className="h-7 text-xs md:h-8">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <label className="text-xs font-medium">Sort By</label>
                <Select value={params.sort}>
                  <SelectTrigger className="h-7 text-xs md:h-8">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <label className="text-xs font-medium">Search</label>
                <Search />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Smaller on mobile */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            {
              title: "Total",
              icon: <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
              value: stats.total.toLocaleString(),
              subtitle: (
                <div className="flex items-center space-x-1">
                  {parseFloat(stats.percentageChange) > 0 ? (
                    <ArrowUp className="h-2 w-2 md:h-3 md:w-3 text-emerald-500" />
                  ) : (
                    <ArrowDown className="h-2 w-2 md:h-3 md:w-3 text-red-500" />
                  )}
                  <p className={cn(
                    "text-[8px] md:text-[10px]",
                    parseFloat(stats.percentageChange) > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {stats.percentageChange}%
                  </p>
                </div>
              )
            },
            {
              title: "New",
              icon: <UserPlus className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
              value: stats.newThisMonth.toLocaleString(),
              subtitle: "This month"
            },
            {
              title: "Qualified",
              icon: <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
              value: (stats.byStatus?.QUALIFIED || 0).toLocaleString(),
              subtitle: "Active leads"
            },
            {
              title: "Conversion",
              icon: <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
              value: `${stats.total > 0
                ? ((stats.byStatus?.CONVERTED || 0) / stats.total * 100).toFixed(1)
                : "0.0"}%`,
              subtitle: "Overall rate"
            }
          ].map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-2 md:p-3">
                <CardTitle className="text-[10px] md:text-xs font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
                <p className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5 md:mt-1">
                  {typeof stat.subtitle === 'string' ? stat.subtitle : stat.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact List */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-0.5 p-2 md:p-3">
            <CardTitle className="text-sm md:text-base">All Contacts</CardTitle>
            <CardDescription className="text-xs">
              Your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Suspense fallback={<DataTableLoading />}>
              <ContactList
                searchQuery={params.search}
                statusFilter={params.status}
                sortOrder={params.sort}
                page={params.page}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/inventory/page.tsx
import { Suspense } from "react";
import { ContactList } from "@/components/contacts/contact-list";
import { Search } from "@/components/contacts/search";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContactStats } from "@/lib/contacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ArrowDown,
  Download,
  MoreHorizontal,
  UserPlus,
  Mail,
  Share2,
  Trash2,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DataTableLoading } from "@/components/contacts/data-table-loading";

interface PageProps {
  searchParams?: {
    [key: string]: string | undefined
  }
}

async function getSearchParams(searchParams: PageProps['searchParams']) {
  const params = {
    search: searchParams?.search,
    status: searchParams?.status,
    sort: searchParams?.sort ?? 'newest',
    page: searchParams?.page ? parseInt(searchParams.page) : 1
  };

  return Promise.resolve(params);
}

export default async function ContactsPage({ searchParams = {} }: PageProps) {
  const [stats, params] = await Promise.all([
    getContactStats(),
    getSearchParams(searchParams)
  ]);

  const statsCards = [
    {
      title: "Total",
      icon: <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
      value: stats.total.toLocaleString(),
      subtitle: (
        <span className="flex items-center space-x-1">
          {parseFloat(stats.percentageChange) > 0 ? (
            <ArrowUp className="h-2 w-2 md:h-3 md:w-3 text-emerald-500" />
          ) : (
            <ArrowDown className="h-2 w-2 md:h-3 md:w-3 text-red-500" />
          )}
          <span
            className={cn(
              "text-[8px] md:text-[10px]",
              parseFloat(stats.percentageChange) > 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {stats.percentageChange}%
          </span>
        </span>
      )
    },
    {
      title: "New",
      icon: <UserPlus className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
      value: stats.newThisMonth.toLocaleString(),
      subtitle: "This month"
    },
    {
      title: "Qualified",
      icon: <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
      value: (stats.byStatus?.QUALIFIED || 0).toLocaleString(),
      subtitle: "Active leads"
    },
    {
      title: "Conversion",
      icon: <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />,
      value: `${stats.total > 0
        ? ((stats.byStatus?.CONVERTED || 0) / stats.total * 100).toFixed(1)
        : "0.0"}%`,
      subtitle: "Overall rate"
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-3 w-full px-2 mx-auto md:space-y-6 md:p-6">
        <h1 className="page-title text-xl md:text-2xl">Contacts</h1>
        
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div></div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/contacts/new" className="flex-1 md:flex-none">
              <Button className="w-full h-8 md:h-9 md:w-auto">
                <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">New Contact</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                  <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Email Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Share List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Filters */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-0.5 p-2 md:p-3">
            <CardTitle className="text-sm md:text-base">Filter Contacts</CardTitle>
            <CardDescription className="text-xs">
              Refine your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-2 md:space-y-3 md:p-3">
            <div className="flex flex-col space-y-2 md:space-y-3">
              <div className="space-y-0.5">
                <label className="text-xs font-medium">Status</label>
                <Select value={params.status ?? "all"}>
                  <SelectTrigger className="h-7 text-xs md:h-8">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <label className="text-xs font-medium">Sort By</label>
                <Select value={params.sort}>
                  <SelectTrigger className="h-7 text-xs md:h-8">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <label className="text-xs font-medium">Search</label>
                <Search />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-2 md:p-3">
                <CardTitle className="text-[10px] md:text-xs font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">
                  {stat.value}
                </div>
                <span className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5 md:mt-1">
                  {stat.subtitle}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact List */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-0.5 p-2 md:p-3">
            <CardTitle className="text-sm md:text-base">All Contacts</CardTitle>
            <CardDescription className="text-xs">
              Your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <Suspense fallback={<DataTableLoading />}>
              <ContactList
                searchQuery={params.search}
                statusFilter={params.status}
                sortOrder={params.sort}
                page={params.page}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/inventory/styles.css
.inventory-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 24px;
    color: #4a90e2;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
    margin-top: 40px;
  }
  
  .add-button,
  .export-button,
  .import-button,
  .refresh-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: white;
  }
  
  .add-button {
    background-color: #28a745;
  }
  
  .export-button,
  .import-button {
    background-color: #17a2b8;
  }
  
  .refresh-button {
    background-color: #6c757d;
  }
  
  .filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .search-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    background-color: white;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .search-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 14px;
  }
  
  .category-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    min-width: 150px;
  }
  
  .low-stock-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    color: #856404;
    margin-bottom: 20px;
  }
  
  .view-all-button {
    padding: 4px 8px;
    background-color: #856404;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .inventory-table-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
  }
  
  .inventory-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .inventory-table th {
    background-color: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: bold;
    color: #495057;
    cursor: pointer;
  }
  
  .inventory-table td {
    padding: 12px;
    border-top: 1px solid #dee2e6;
  }
  
  .low-stock {
    background-color: #fff3cd;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .edit-button,
  .delete-button {
    padding: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .edit-button {
    background-color: #17a2b8;
    color: white;
  }
  
  .delete-button {
    background-color: #dc3545;
    color: white;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #495057;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    font-size: 14px;
    color: #495057;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .cancel-button,
  .save-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: white;
  }
  
  .cancel-button {
    background-color: #6c757d;
  }
  
  .save-button {
    background-color: #28a745;
  }
  
  .delete-modal {
    max-width: 400px;
  }
  
  .delete-modal p {
    margin-bottom: 20px;
    color: #495057;
  }
  
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    animation: slideIn 0.3s ease-out;
    z-index: 1000;
  }
  
  .notification.success {
    background-color: #28a745;
  }
  
  .notification.error {
    background-color: #dc3545;
  }
  
  .quick-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 20px;
    background-color: #4a90e2;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .action-button:hover {
    background-color: #357abd;
  }
  
  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 15px;
    }
  
    .header-actions {
      flex-wrap: wrap;
    }
  
    .add-button,
    .export-button,
    .import-button,
    .refresh-button {
      flex: 1;
      justify-content: center;
    }
  
    .filters {
      flex-direction: column;
    }
  
    .search-container {
      width: 100%;
    }
  
    .category-select {
      width: 100%;
    }
  
    .form-grid {
      grid-template-columns: 1fr;
    }
  
    .modal-content {
      width: 95%;
      margin: 10px;
      padding: 15px;
    }
  
    .inventory-table {
      font-size: 14px;
    }
  
    .quick-actions {
      flex-direction: column;
    }
  
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .inventory-table-container {
      margin: 0 -20px;
      width: calc(100% + 40px);
      border-radius: 0;
    }
  
    .inventory-table th,
    .inventory-table td {
      padding: 8px;
    }
  
    .actions {
      flex-direction: column;
      gap: 4px;
    }
  
    .edit-button,
    .delete-button {
      width: 100%;
    }
  }
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/layout.tsx
import { SideNav } from "@/components/dashboard/navigation/side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <div className="flex min-h-screen">
        <SideNav />
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="h-full pt-0">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/management/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types/pos'
import { posService } from '@/lib/services/pos-service'
import { CATEGORIES } from '@/constants/pos-data'
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Plus, Edit2, Trash2, Save, Coffee, Search } from 'lucide-react'
import { Label } from "@/components/ui/label"

export default function ManagementPage() {
 const [menuItems, setMenuItems] = useState<MenuItem[]>([])
 const [loading, setLoading] = useState(true)
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
 const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
 const [searchTerm, setSearchTerm] = useState("")
 const [filterCategory, setFilterCategory] = useState<string>("All")
 
 const [newItem, setNewItem] = useState({
   name: '',
   price: '',
   category: '',
   popular: false,
 })

 useEffect(() => {
   loadMenuItems()
 }, [])

 const loadMenuItems = async () => {
   try {
     setLoading(true)
     const items = await posService.getMenuItems()
     setMenuItems(items)
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to load menu items",
       variant: "destructive",
     })
   } finally {
     setLoading(false)
   }
 }

 const handleAddItem = async () => {
   try {
     if (!newItem.name || !newItem.price || !newItem.category) {
       toast({
         title: "Error",
         description: "Please fill in all required fields",
         variant: "destructive",
       })
       return
     }

     await posService.createMenuItem({
       name: newItem.name,
       price: parseFloat(newItem.price),
       category: newItem.category,
       popular: newItem.popular,
       active: true
     })

     setNewItem({
       name: '',
       price: '',
       category: '',
       popular: false,
     })

     setIsAddDialogOpen(false)
     await loadMenuItems()

     toast({
       title: "Success",
       description: "Menu item added successfully",
     })
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to add menu item",
       variant: "destructive",
     })
   }
 }

 const handleUpdateItem = async (item: MenuItem) => {
   try {
     await posService.updateMenuItem(item.id, item)
     setEditingItem(null)
     await loadMenuItems()

     toast({
       title: "Success",
       description: "Menu item updated successfully",
     })
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update menu item",
       variant: "destructive",
     })
   }
 }

 const handleDeleteItem = async (id: string) => {
   if (!confirm('Are you sure you want to delete this item?')) return

   try {
     await posService.deleteMenuItem(id)
     await loadMenuItems()

     toast({
       title: "Success",
       description: "Menu item deleted successfully",
     })
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to delete menu item",
       variant: "destructive",
     })
   }
 }

 const filteredItems = menuItems.filter(item => {
   const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
   const matchesCategory = filterCategory === "All" || item.category === filterCategory
   return matchesSearch && matchesCategory
 })

 return (
   <PageContainer>
     <div className="p-8">
       <Card>
         <CardHeader>
           <div className="flex justify-between items-center">
             <div>
               <CardTitle>Menu Management</CardTitle>
               <CardDescription>Manage your menu items, categories, and prices</CardDescription>
             </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
               <DialogTrigger asChild>
                 <Button>
                   <Plus className="mr-2 h-4 w-4" />
                   Add Menu Item
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Add New Menu Item</DialogTitle>
                   <DialogDescription>
                     Add a new item to your menu. Fill in all the required information.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                     <Label htmlFor="name">Name</Label>
                     <Input
                       id="name"
                       value={newItem.name}
                       onChange={e => setNewItem({...newItem, name: e.target.value})}
                       placeholder="Item name"
                     />
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="price">Price</Label>
                     <Input
                       id="price"
                       type="number"
                       step="0.01"
                       value={newItem.price}
                       onChange={e => setNewItem({...newItem, price: e.target.value})}
                       placeholder="0.00"
                     />
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="category">Category</Label>
                     <Select
                       value={newItem.category}
                       onValueChange={value => setNewItem({...newItem, category: value})}
                     >
                       <SelectTrigger id="category">
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         {CATEGORIES.map(category => (
                           <SelectItem key={category} value={category}>
                             {category}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex items-center gap-2">
                     <Label htmlFor="popular">Popular Item</Label>
                     <Switch
                       id="popular"
                       checked={newItem.popular}
                       onCheckedChange={checked => setNewItem({...newItem, popular: checked})}
                     />
                   </div>
                 </div>
                 <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                     Cancel
                   </Button>
                   <Button onClick={handleAddItem}>
                     Add Item
                   </Button>
                 </div>
               </DialogContent>
             </Dialog>
           </div>
         </CardHeader>
         <CardContent>
           <div className="mb-4 flex gap-4">
             <div className="flex-1">
               <div className="relative">
                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Search menu items..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-8"
                 />
               </div>
             </div>
             <Select
               value={filterCategory}
               onValueChange={setFilterCategory}
             >
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Select category" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="All">All Categories</SelectItem>
                 {CATEGORIES.map(category => (
                   <SelectItem key={category} value={category}>
                     {category}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           {loading ? (
             <div className="flex items-center justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
             </div>
           ) : (
             <div className="rounded-md border">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-[300px]">Name</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead className="w-[100px]">Price</TableHead>
                     <TableHead className="w-[100px]">Popular</TableHead>
                     <TableHead className="text-right w-[100px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredItems.map((item) => (
                     <TableRow key={item.id}>
                       <TableCell>
                         {editingItem?.id === item.id ? (
                           <Input
                             value={editingItem.name}
                             onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                           />
                         ) : (
                           <div className="flex items-center gap-2">
                             <Coffee className="h-4 w-4 text-muted-foreground" />
                             {item.name}
                           </div>
                         )}
                       </TableCell>
                       <TableCell>
                         {editingItem?.id === item.id ? (
                           <Select
                             value={editingItem.category}
                             onValueChange={value => setEditingItem({...editingItem, category: value})}
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="Select category" />
                             </SelectTrigger>
                             <SelectContent>
                               {CATEGORIES.map(category => (
                                 <SelectItem key={category} value={category}>
                                   {category}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         ) : (
                           item.category
                         )}
                       </TableCell>
                       <TableCell>
                         {editingItem?.id === item.id ? (
                           <Input
                             type="number"
                             step="0.01"
                             value={editingItem.price}
                             onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                             className="w-[100px]"
                           />
                         ) : (
                           `$${item.price.toFixed(2)}`
                         )}
                       </TableCell>
                       <TableCell>
                         <Switch
                           checked={editingItem?.id === item.id ? editingItem.popular : item.popular}
                           onCheckedChange={checked => {
                             if (editingItem?.id === item.id) {
                               setEditingItem({...editingItem, popular: checked})
                             } else {
                               handleUpdateItem({...item, popular: checked})
                             }
                           }}
                         />
                       </TableCell>
                       <TableCell className="text-right">
                         {editingItem?.id === item.id ? (
                           <div className="flex justify-end gap-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setEditingItem(null)}
                             >
                               Cancel
                             </Button>
                             <Button
                               size="sm"
                               onClick={() => handleUpdateItem(editingItem)}
                             >
                               <Save className="h-4 w-4" />
                             </Button>
                           </div>
                         ) : (
                           <div className="flex justify-end gap-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setEditingItem(item)}
                             >
                               <Edit2 className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeleteItem(item.id)}
                             >
                               <Trash2 className="h-4 w-4 text-red-500" />
                             </Button>
                           </div>
                         )}
                       </TableCell>
                     </TableRow>
                   ))}
                   {filteredItems.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={5} className="h-24 text-center">
                         No menu items found.
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   </PageContainer>
 )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/order/page.tsx
"use client"
import React, { useState, useEffect, useCallback } from 'react'
import {
 Clock,
 Check,
 PlayCircle,
 ThumbsUp,
 ThumbsDown,
 Mail,
 Phone,
 ArrowUpDown,
 Trash2,
 Edit2,
 Save,
 Download,
 Upload,
 RefreshCcw,
 Search,
 Calendar,
 FileText,
 AlertTriangle,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { PageContainer } from "@/components/layout/page-container"
import { orderService } from '@/lib/services/order-service'
import './styles.css'

interface OrderItem {
 id: string
 menuItem: {
   id: string
   name: string
 }
 quantity: number
 price: number
}

interface Order {
 id: string
 orderNumber: number
 customerName: string
 status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
 timestamp: string
 items: OrderItem[]
 total: number
 isComplimentary: boolean
 queueTime: number
 preparationTime?: number
 customerEmail?: string
 customerPhone?: string
 leadInterest?: boolean
 startTime?: string
 notes?: string
}

interface SearchFilters {
 customerName: string
 orderId: string
 itemName: string
 dateRange: {
   start: string
   end: string
 }
}

const ActiveOrders: React.FC = () => {
 // Basic state
 const [orders, setOrders] = useState<Order[]>([])
 const [allOrders, setAllOrders] = useState<Order[]>([])
 const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
 const [statusFilter, setStatusFilter] = useState('All')
 const [sortCriteria, setSortCriteria] = useState('timestamp')
 const [sortDirection, setSortDirection] = useState('desc')
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 // Modal states
 const [showClearConfirmation, setShowClearConfirmation] = useState(false)
 const [showResetConfirmation, setShowResetConfirmation] = useState(false)
 const [showOrderDetails, setShowOrderDetails] = useState(false)

 // Search and filter states
 const [searchFilters, setSearchFilters] = useState<SearchFilters>({
   customerName: '',
   orderId: '',
   itemName: '',
   dateRange: {
     start: '',
     end: ''
   }
 })

 // Order editing states
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
 const [editedItems, setEditedItems] = useState<OrderItem[]>([])
 const [orderNotes, setOrderNotes] = useState('')

 // Message state for user feedback
 const [message, setMessage] = useState<{
   type: 'success' | 'error'
   text: string
 } | null>(null)

 // Helper function to show messages
 const showMessage = useCallback((text: string, type: 'success' | 'error') => {
   setMessage({ text, type })
   setTimeout(() => setMessage(null), 3000)
 }, [])

 // Load orders from API with localStorage fallback
 const loadOrders = useCallback(async () => {
   setIsLoading(true)
   setError(null)
   try {
     const loadedOrders = await orderService.getOrders()
     setOrders(loadedOrders)
     setAllOrders(loadedOrders)
     setFilteredOrders(loadedOrders)
   } catch (error) {
     setError('Error loading orders. Using cached data.')
     // Fallback to localStorage
     const cachedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
     setOrders(cachedOrders)
     setAllOrders(cachedOrders)
     setFilteredOrders(cachedOrders)
   }
   setIsLoading(false)
 }, [])

 // Filter and sort orders based on search criteria and filters
 const filterAndSortOrders = useCallback(() => {
   let filtered = orders

   if (statusFilter !== 'All') {
     filtered = filtered.filter((order) => order.status === statusFilter)
   }

   if (searchFilters.customerName) {
     filtered = filtered.filter((order) =>
       order.customerName
         .toLowerCase()
         .includes(searchFilters.customerName.toLowerCase())
     )
   }

   if (searchFilters.orderId) {
     filtered = filtered.filter((order) =>
       order.orderNumber.toString().includes(searchFilters.orderId)
     )
   }

   if (searchFilters.itemName) {
     filtered = filtered.filter((order) =>
       order.items.some((item) =>
         item.menuItem.name.toLowerCase().includes(searchFilters.itemName.toLowerCase())
       )
     )
   }

   if (searchFilters.dateRange.start && searchFilters.dateRange.end) {
     const startDate = new Date(searchFilters.dateRange.start)
     const endDate = new Date(searchFilters.dateRange.end)
     filtered = filtered.filter((order) => {
       const orderDate = new Date(order.timestamp)
       return orderDate >= startDate && orderDate <= endDate
     })
   }

   // Sort filtered orders
   const sorted = [...filtered].sort((a, b) => {
     if (sortCriteria === 'timestamp') {
       return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
     } else if (sortCriteria === 'preparationTime') {
       return (b.preparationTime || 0) - (a.preparationTime || 0)
     } else if (sortCriteria === 'queueTime') {
       return b.queueTime - a.queueTime
     }
     return 0
   })

   if (sortDirection === 'asc') {
     sorted.reverse()
   }

   setFilteredOrders(sorted)
 }, [orders, statusFilter, searchFilters, sortCriteria, sortDirection])

 // Update filters
 const updateSearchFilters = (
   field: keyof SearchFilters,
   value: string | { start: string; end: string }
 ) => {
   setSearchFilters((prev) => ({
     ...prev,
     [field]: value
   }))
 }

 // Calculate new total based on items
 const calculateTotal = (items: OrderItem[]) => {
   return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
 }

 // Handle item editing
 const updateOrderItem = (
   orderId: string,
   itemId: string,
   updates: Partial<OrderItem>
 ) => {
   if (!selectedOrder) return

   const updatedItems = selectedOrder.items.map((item) =>
     item.id === itemId ? { ...item, ...updates } : item
   )

   const newTotal = calculateTotal(updatedItems)

   setSelectedOrder({
     ...selectedOrder,
     items: updatedItems,
     total: newTotal
   })
 }

 // Effect hooks for initial load and filtering
 useEffect(() => {
   loadOrders()
 }, [loadOrders])

 useEffect(() => {
   filterAndSortOrders()
 }, [filterAndSortOrders])

 // Order status management
 const updateOrderStatus = async (orderId: string, newStatus: string) => {
   try {
     const preparationTime = newStatus === 'COMPLETED' && selectedOrder?.startTime
       ? (Date.now() - new Date(selectedOrder.startTime).getTime()) / 1000
       : undefined

     const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus, preparationTime)
     await loadOrders()
     showMessage('Order status updated successfully', 'success')
   } catch (error) {
     showMessage('Failed to update order status', 'error')
   }
 }

 // Handle updating order notes
 const handleUpdateOrderNotes = async (orderId: string, notes: string) => {
   try {
     await orderService.updateOrderNotes(orderId, notes)
     await loadOrders()
     showMessage('Order notes updated successfully', 'success')
   } catch (error) {
     showMessage('Failed to update order notes', 'error')
   }
 }

 // Lead interest tracking
 const recordLeadInterest = async (orderId: string, interested: boolean) => {
   try {
     await orderService.updateLeadInterest(orderId, interested)
     await loadOrders()
     showMessage('Lead interest recorded successfully', 'success')
   } catch (error) {
     showMessage('Failed to record lead interest', 'error')
   }
 }

 // Order cancellation
 const cancelOrder = async (orderId: string) => {
   if (window.confirm('Are you sure you want to cancel this order?')) {
     try {
       await orderService.updateOrderStatus(orderId, 'CANCELLED')
       await loadOrders()
       showMessage('Order cancelled successfully', 'success')
     } catch (error) {
       showMessage('Failed to cancel order', 'error')
     }
   }
 }

 // Order modification
 const modifyOrder = (orderId: string) => {
   const orderToModify = orders.find((order) => order.id === orderId)
   if (orderToModify) {
     setSelectedOrder(orderToModify)
     setEditedItems([...orderToModify.items])
     setOrderNotes(orderToModify.notes || '')
     setShowOrderDetails(true)
   }
 }

 // Save modified order
 const saveModifiedOrder = async () => {
   if (!selectedOrder) return

   try {
     const modifiedOrder = {
       ...selectedOrder,
       items: editedItems,
       notes: orderNotes,
       total: calculateTotal(editedItems)
     }

     await orderService.updateOrder(selectedOrder.id, modifiedOrder)
     await loadOrders()
     
     setShowOrderDetails(false)
     setSelectedOrder(null)
     showMessage('Order updated successfully', 'success')
   } catch (error) {
     showMessage('Failed to update order', 'error')
   }
 }

 // Time formatting
 const formatTime = (seconds: number) => {
   const minutes = Math.floor(seconds / 60)
   const remainingSeconds = Math.floor(seconds % 60)
   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
 }

 // PDF generation
 const generatePDF = () => {
   const doc = new jsPDF()
   const tableColumn = [
     'Order #',
     'Customer',
     'Status',
     'Total',
     'Queue Time',
     'Prep Time',
     'Notes'
   ]
   const tableRows: (string | number)[][] = []

   allOrders.forEach((order) => {
     const orderData = [
       order.orderNumber,
       order.customerName,
       order.status,
       order.isComplimentary ? 'Free' : `$${order.total}`,
       formatTime(order.queueTime),
       order.preparationTime ? formatTime(order.preparationTime) : 'N/A',
       order.notes || 'N/A'
     ]
     tableRows.push(orderData)
   })

   doc.autoTable({
     head: [tableColumn],
     body: tableRows,
     startY: 20
   })

   doc.text('Buf Barista - Complete Order Report', 14, 15)
   doc.save('buf-barista-all-orders.pdf')
 }

 // Data management functions
 const clearAllOrders = async () => {
   try {
     await orderService.clearAllOrders()
     await loadOrders()
     showMessage('All orders cleared successfully', 'success')
   } catch (error) {
     showMessage('Failed to clear orders', 'error')
   }
 }

 const resetAllData = async () => {
   try {
     await orderService.resetAllData()
     await loadOrders()
     showMessage('All data reset successfully', 'success')
     window.location.reload()
   } catch (error) {
     showMessage('Failed to reset data', 'error')
   }
 }

 const exportData = async () => {
   try {
     const data = await orderService.exportOrders()
     const blob = new Blob([data], { type: 'application/json' })
     const url = URL.createObjectURL(blob)
     const a = document.createElement('a')
     a.href = url
     a.download = 'buf-barista-data.json'
     document.body.appendChild(a)
     a.click()
     document.body.removeChild(a)
     URL.revokeObjectURL(url)
     showMessage('Data exported successfully', 'success')
   } catch (error) {
     showMessage('Failed to export data', 'error')
   }
 }

 const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0]
   if (!file) return

   try {
     const reader = new FileReader()
     reader.onload = async (e) => {
       const content = e.target?.result as string
       await orderService.importOrders(content)
       await loadOrders()
       showMessage('Data imported successfully', 'success')
     }
     reader.readAsText(file)
   } catch (error) {
     showMessage('Failed to import data', 'error')
   }
 }

 // Toggle notes editing
 const toggleEditNotes = (orderId: string) => {
   const order = orders.find((o) => o.id === orderId)
   if (order) {
     setSelectedOrder(order)
     setOrderNotes(order.notes || '')
     setShowOrderDetails(true)
   }
 }
  // Render component
  return (
    <PageContainer>
      <div className="active-orders-container">
        <h1 className="page-title">Active Orders</h1>

        {isLoading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">{error}</div>}

        {/* Search and Filter Section */}
        <div className="search-section">
          <div className="search-inputs">
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchFilters.customerName}
                onChange={(e) =>
                  updateSearchFilters('customerName', e.target.value)
                }
                className="search-input"
              />
            </div>
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchFilters.orderId}
                onChange={(e) => updateSearchFilters('orderId', e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchFilters.itemName}
                onChange={(e) => updateSearchFilters('itemName', e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="date-range">
            <Calendar size={16} />
            <input
              type="date"
              value={searchFilters.dateRange.start}
              onChange={(e) =>
                updateSearchFilters('dateRange', {
                  ...searchFilters.dateRange,
                  start: e.target.value
                })
              }
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={searchFilters.dateRange.end}
              onChange={(e) =>
                updateSearchFilters('dateRange', {
                  ...searchFilters.dateRange,
                  end: e.target.value
                })
              }
              className="date-input"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}
            className="filter-dropdown"
          >
            <option value="timestamp">Sort by Time</option>
            <option value="preparationTime">Sort by Prep Time</option>
            <option value="queueTime">Sort by Queue Time</option>
          </select>

          <button
            onClick={() =>
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
            }
            className="sort-button"
          >
            <ArrowUpDown size={16} />
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <button onClick={generatePDF} className="pdf-button">
            <Save size={16} />
            Save as PDF
          </button>

          <button onClick={clearAllOrders} className="clear-button">
            <Trash2 size={16} />
            Clear All Orders
          </button>

          <button onClick={resetAllData} className="reset-button">
            <RefreshCcw size={16} />
            Reset All Data
          </button>

          <button onClick={exportData} className="export-button">
            <Download size={16} />
            Export Data
          </button>

          <label className="import-button">
            <Upload size={16} />
            Import Data
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={importData}
            />
          </label>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${order.status.toLowerCase()}`}
            >
              <div className="order-header">
                <span className="order-number">Order #{order.id}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <div className="customer-name">{order.customerName}</div>
                <div className="order-time">
                  <Clock size={14} className="icon" />
                  {order.timestamp}
                </div>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>
                      {order.isComplimentary
                        ? 'Free'
                        : `$${(item.price * item.quantity).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                Total: {order.isComplimentary ? 'Free' : `$${order.total}`}
              </div>
              <div className="order-metrics">
                <div>Queue Time: {formatTime(order.queueTime)}</div>
                {order.preparationTime && (
                  <div>Preparation Time: {formatTime(order.preparationTime)}</div>
                )}
              </div>

              <div className="customer-contact">
                {order.customerEmail && <Mail size={14} className="icon" />}
                {order.customerPhone && <Phone size={14} className="icon" />}
              </div>

              {/* Order Notes Section */}
              <div className="order-notes-section">
                <div className="notes-header">
                  <FileText size={14} className="icon" />
                  <span>Notes</span>
                  <button
                    onClick={() => toggleEditNotes(order.id)}
                    className="edit-notes-button"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="notes-content">
                  {order.notes ? (
                    <p>{order.notes}</p>
                  ) : (
                    <p className="no-notes">No notes added</p>
                  )}
                </div>
              </div>

              {/* Lead Interest Section */}
              {order.status === 'Completed' && order.leadInterest === undefined && (
                <div className="lead-interest-section">
                  <div className="lead-interest-header">
                    Customer interested in sales pitch?
                  </div>
                  <div className="lead-interest-buttons">
                    <button
                      onClick={() => recordLeadInterest(order.id, true)}
                      className="lead-button yes"
                    >
                      <ThumbsUp size={16} className="icon" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => recordLeadInterest(order.id, false)}
                      className="lead-button no"
                    >
                      <ThumbsDown size={16} className="icon" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              )}

              {order.leadInterest !== undefined && (
                <div
                  className={`lead-status ${
                    order.leadInterest ? 'interested' : 'not-interested'
                  }`}
                >
                  <div className="lead-status-content">
                    <span className="lead-status-label">Lead Status:</span>
                    <span className="lead-status-value">
                      {order.leadInterest ? (
                        <>
                          <ThumbsUp size={16} className="icon" />
                          Interested
                        </>
                      ) : (
                        <>
                          <ThumbsDown size={16} className="icon" />
                          Not Interested
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {order.status !== 'Completed' && (
                <div className="order-actions">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'In Progress')}
                    className="start-button"
                    disabled={order.status === 'In Progress'}
                  >
                    <PlayCircle size={16} className="icon" /> Start
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                    className="complete-button"
                  >
                    <Check size={16} className="icon" /> Complete
                  </button>
                  <button
                    onClick={() => modifyOrder(order.id)}
                    className="modify-button"
                    disabled={order.status === 'Completed'}
                  >
                    <Edit2 size={16} className="icon" /> Modify
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="cancel-button"
                    disabled={order.status !== 'Pending'}
                  >
                    <Trash2 size={16} className="icon" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modals */}
        {showClearConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <h2>Clear All Orders</h2>
              <p>
                Are you sure you want to clear all orders? This action will remove
                orders from the active list but they will still be included in the
                PDF report.
              </p>
              <div className="modal-actions">
                <button
                  onClick={confirmClearAllOrders}
                  className="confirm-button"
                >
                  Yes, Clear All
                </button>
                <button onClick={cancelClearAllOrders} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <h2>Reset All Data</h2>
              <p>
                Are you sure you want to reset all data? This action will clear
                all orders, preferences, and inventory data. This action cannot be
                undone.
              </p>
              <div className="modal-actions">
                <button onClick={confirmResetAllData} className="confirm-button">
                  Yes, Reset All Data
                </button>
                <button onClick={cancelResetAllData} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Edit Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="modal">
            <div className="modal-content">
              <h2>Modify Order</h2>
              <div className="order-form">
                <label>
                  Customer Name:
                  <input
                    type="text"
                    value={selectedOrder.customerName}
                    onChange={(e) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        customerName: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  Order Notes:
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add notes about the order..."
                    rows={3}
                  />
                </label>

                <div className="items-list">
                  <h3>Order Items</h3>
                  {editedItems.map((item, index) => (
                    <div key={index} className="edit-item">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            name: e.target.value
                          })
                        }
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            quantity: parseInt(e.target.value)
                          })
                        }
                      />
                      <input
                        type="number"
                        value={item.price}
                        step="0.01"
                        min="0"
                        onChange={(e) =>
                          updateOrderItem(selectedOrder.id, item.id, {
                            price: parseFloat(e.target.value)
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          setEditedItems((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="remove-item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={saveModifiedOrder} className="confirm-button">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetails(false)
                    setSelectedOrder(null)
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? (
              <Check size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {message.text}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default ActiveOrders


________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/order/styles.css
.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
/* Container Styles */
.active-orders-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
}

/* Page Title */
.page-title {
  font-size: 28px;
  color: #4a90e2;
  margin-bottom: 20px;
  text-align: center;
}

/* Loading and Error States */
.loading,
.error {
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 5px;
}

.loading {
  background-color: #e9ecef;
  color: #495057;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* Search Section */
.search-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.date-input {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* Filters Section */
.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-dropdown,
.sort-button,
.pdf-button,
.refresh-button,
.clear-button,
.reset-button,
.export-button,
.import-button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}
/* Notes Section */
.order-notes-section {
  margin-top: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.edit-notes-button {
  margin-left: auto;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.edit-notes-button:hover {
  color: #4a90e2;
  background-color: rgba(74, 144, 226, 0.1);
}

.notes-content {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.no-notes {
  color: #6c757d;
  font-style: italic;
}

/* Lead Interest Section */
.lead-interest-section {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.lead-interest-header {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 10px;
  text-align: center;
}

.lead-interest-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.lead-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 120px;
}

.lead-button.yes {
  background-color: #28a745;
  color: white;
}

.lead-button.yes:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.lead-button.no {
  background-color: #dc3545;
  color: white;
}

.lead-button.no:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.lead-button:active {
  transform: translateY(1px);
}

.lead-button .icon {
  font-size: 16px;
}

/* Lead Status */
.lead-status {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.lead-status.interested {
  border-left: 4px solid #28a745;
}

.lead-status.not-interested {
  border-left: 4px solid #dc3545;
}

.lead-status-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lead-status-label {
  font-weight: 500;
  color: #495057;
}

.lead-status-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.lead-status.interested .lead-status-value {
  color: #28a745;
}

.lead-status.not-interested .lead-status-value {
  color: #dc3545;
}

/* Notes Modal Enhancements */
.order-form textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 8px;
}

.order-form textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.notes-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}

@media (max-width: 768px) {
  .lead-interest-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .lead-button {
    max-width: none;
  }
}
.sort-button,
.pdf-button,
.refresh-button,
.export-button,
.import-button {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.clear-button {
  background-color: #dc3545;
  color: white;
}

.reset-button {
  background-color: #ffc107;
  color: #212529;
}

/* Orders Grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Order Card Elements */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-number {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.order-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.order-status.pending {
  background-color: #ffc107;
  color: #856404;
}

.order-status.in-progress {
  background-color: #17a2b8;
  color: white;
}

.order-status.completed {
  background-color: #28a745;
  color: white;
}

/* Order Details */
.order-details {
  margin-bottom: 15px;
}

.customer-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
/* Add these styles to the existing style block */

/* Order Action Buttons */
.order-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
}
.confirm-button,
.start-button,
.complete-button,
.modify-button,
.cancel-button,
.nav-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-decoration: none;
  width: 100%;
}

.confirm-button {
  background-color: #007bff;
  color: white;
  margin-bottom: 10px;
}

.start-button {
  background-color: #ffc107;
  color: #856404;
}

.start-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.complete-button {
  background-color: #28a745;
  color: white;
}

.complete-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.modify-button {
  background-color: #17a2b8;
  color: white;
}

.modify-button:hover {
  background-color: #138496;
  transform: translateY(-2px);
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

.cancel-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

/* Navigation Button */
.nav-button {
  background-color: #6c757d;
  color: white;
  margin-top: 20px;
  width: auto;
  min-width: 150px;
  padding: 12px 24px;
  font-size: 16px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
}

.nav-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

/* Disabled State */
.start-button:disabled,
.complete-button:disabled,
.modify-button:disabled,
.cancel-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.order-actions .icon {
  font-size: 16px;
}

/* Add this to the media queries section */
@media (max-width: 768px) {
  .order-actions {
    grid-template-columns: 1fr;
  }

  .start-button,
  .complete-button,
  .modify-button,
  .cancel-button {
    padding: 12px 16px;
    font-size: 16px;
  }

  .nav-button {
    width: 100%;
    margin-top: 30px;
  }
}

/* Add hover effect to all buttons */
button:active {
  transform: translateY(1px);
}

/* Button icon alignment */
.icon {
  margin-right: 4px;
  vertical-align: middle;
}
.order-time {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.order-notes {
  margin-top: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.order-notes .icon {
  margin-top: 2px;
  color: #666;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #333;
}

.order-form label {
  display: block;
  margin-bottom: 15px;
}

.order-form input,
.order-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

.items-list {
  margin-top: 20px;
}

.edit-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.remove-item {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
}

/* Message Notifications */
.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.message.success {
  background-color: #28a745;
}

.message.error {
  background-color: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Media Queries */
@media (max-width: 768px) {
  .search-inputs {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .filter-dropdown,
  .sort-button,
  .pdf-button,
  .refresh-button,
  .clear-button,
  .reset-button,
  .export-button,
  .import-button {
    width: 100%;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .edit-item {
    grid-template-columns: 1fr;
  }
  
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/page.tsx
import { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Overview } from "@/components/dashboard/overview";
import { ContactChart } from "@/components/dashboard/analytics/contact-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range";
import { getContacts } from "@/lib/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import {
  Users,
   Download,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { DataExport } from "@/components/contacts/data-export";
import { Contact } from "@/types/contacts";

export const metadata: Metadata = {
  title: "Dashboard | BUF BARISTA CRM",
  description: "View your CRM analytics and insights",
};

const timeFrames = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
] as const;

interface DashboardStats {
  totalContacts: number;
  newContacts: number;
  convertedContacts: number;
  qualifiedLeads: number;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const contacts: Contact[] = await getContacts();

  const stats: DashboardStats = {
    totalContacts: contacts.length,
    newContacts: contacts.filter(c => c.status === 'NEW').length,
    convertedContacts: contacts.filter(c => c.status === 'CONVERTED').length,
    qualifiedLeads: contacts.filter(c => c.status === 'QUALIFIED').length,
  };

  return (
    <PageContainer>
      <div className="space-y-4 max-w-[500px] mx-auto px-2 md:max-w-full md:space-y-6 md:p-6">
        {/* Header */}
          <h1 className="page-title">Dashboard</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CalendarDateRangePicker />
            <div className="flex items-center gap-2">
              <DataExport contacts={contacts} />
              <Button size="sm" className="h-8 md:h-9">
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Time Frame Filter */}
        <div className="flex items-center">
          <Select defaultValue="month">
            <SelectTrigger className="h-8 w-[140px] text-xs md:h-9 md:w-[180px] md:text-sm">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              {timeFrames.map((timeFrame) => (
                <SelectItem 
                  key={timeFrame.value} 
                  value={timeFrame.value}
                  className="text-xs md:text-sm"
                >
                  {timeFrame.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Charts */}
        <div className="grid gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-base">Overview</CardTitle>
              <CardDescription className="text-xs">
                Contact acquisition and conversion overview
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-base">Recent Contacts</CardTitle>
              <CardDescription className="text-xs">
                Latest additions to your contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <RecentSales />
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-base">Lead Sources</CardTitle>
              <CardDescription className="text-xs">Source distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Website</p>
                      <p className="text-xs text-muted-foreground">45%</p>
                    </div>
                    <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-base">Status Distribution</CardTitle>
              <CardDescription className="text-xs">Contact status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">New</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.newContacts} contacts
                      </p>
                    </div>
                    <div className="w-24 h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ 
                          width: `${(stats.newContacts / stats.totalContacts) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:col-span-2 lg:col-span-1">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest updates</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">New contact added</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <ContactChart contacts={contacts} />

        {/* Quick Actions */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 p-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/dashboard/contacts/new">
                <Button className="w-full h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  New Contact
                </Button>
              </Link>
              <Link href="/dashboard/contacts">
                <Button variant="outline" className="w-full h-9">
                  <Users className="h-4 w-4 mr-2" />
                  All Contacts
                </Button>
              </Link>
            </div>
          </CardContent> 
        </Card>
      </div>
    </PageContainer>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/pos/page.tsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
 Coffee,
 X,
 DollarSign,
 Gift,
 Moon,
 Sun,
 Search,
 Bell,
 Plus,
 Minus,
 Trash2,
 Star,
 Clock,
 CalendarDays,
 Loader2
} from 'lucide-react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import { format } from 'date-fns'
import { PageContainer } from "@/components/layout/page-container"
import { posService } from '@/lib/services/pos-service'
import './styles.css'
import { MenuItem, MilkOption, CartItem, CustomerInfo } from '@/types/pos'

// Constants
const flavorOptions = [
 'No Flavoring',
 'Vanilla',
 'Caramel',
 'Hazelnut',
 'Raspberry',
 'Pumpkin Spice'
]

const milkOptions: MilkOption[] = [
 { name: 'No Milk', price: 0 },
 { name: 'Whole Milk', price: 0 },
 { name: 'Oat Milk', price: 0 }
]

const BufBaristaPOS: React.FC = () => {
 // Basic state
 const [cart, setCart] = useState<CartItem[]>([])
 const [menuItems, setMenuItems] = useState<MenuItem[]>([])
 const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
   firstName: '',
   lastInitial: '',
   organization: '',
   email: '',
   phone: ''
 })
 const [orderNotes, setOrderNotes] = useState('')
 const [orderNumber, setOrderNumber] = useState(1)
 const [selectedCategory, setSelectedCategory] = useState('All')
 const [isComplimentaryMode, setIsComplimentaryMode] = useState(true)
 const [queueStartTime, setQueueStartTime] = useState<Date | null>(null)
 const [isDarkMode, setIsDarkMode] = useState(false)
 const [searchTerm, setSearchTerm] = useState('')
 const [quickNotes, setQuickNotes] = useState<string[]>([])
 const [isLoading, setIsLoading] = useState(true)

 // Modal states
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false)
 const [notification, setNotification] = useState<string | null>(null)
 const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
 const [selectedFlavor, setSelectedFlavor] = useState('')
 const [selectedMilk, setSelectedMilk] = useState(milkOptions[0])
 const [showPopular, setShowPopular] = useState(false)

 // Initial data loading
 useEffect(() => {
   const loadInitialData = async () => {
     setIsLoading(true)
    const prefs = {
      lastOrderNumber: 1,
      darkMode: false,
      complimentaryMode: true
    };

    try {
      const lastOrderNumber = prefs.lastOrderNumber || 1;
      setOrderNumber((lastOrderNumber as number) + 1);
      setIsDarkMode(prefs.darkMode || false);
      setIsComplimentaryMode(prefs.complimentaryMode || true);

      setQueueStartTime(new Date());
    } catch (error) {
       console.error('Error loading initial data:', error)
       showNotification('Error loading some data. Using fallback options.')
       
       // Load from localStorage as fallback
       const savedQuickNotes = localStorage.getItem('quickNotes')
       if (savedQuickNotes) {
         setQuickNotes(JSON.parse(savedQuickNotes))
       }

       const lastOrderNumber = localStorage.getItem('lastOrderNumber')
       if (lastOrderNumber) {
         setOrderNumber(parseInt(lastOrderNumber) + 1)
       }

       const savedDarkMode = localStorage.getItem('darkMode')
       if (savedDarkMode) {
         setIsDarkMode(JSON.parse(savedDarkMode))
       }

       const savedComplimentaryMode = localStorage.getItem('complimentaryMode')
       if (savedComplimentaryMode) {
         setIsComplimentaryMode(JSON.parse(savedComplimentaryMode))
       }
     } finally {
       setIsLoading(false)
     }
   }

   loadInitialData()
 }, [])

 // Save preferences
 useEffect(() => {
   posService.savePreference('darkMode', isDarkMode)
   document.body.classList.toggle('dark-mode', isDarkMode)
 }, [isDarkMode])

 useEffect(() => {
   posService.savePreference('complimentaryMode', isComplimentaryMode)
 }, [isComplimentaryMode])

 const categories = useMemo(
   () => ['All', ...new Set(menuItems.map((item) => item.category))],
   [menuItems]
 )

 const showNotification = useCallback((message: string) => {
   setNotification(message)
   setTimeout(() => setNotification(null), 3000)
 }, [])

 const addToCart = useCallback((item: MenuItem) => {
   setSelectedItem(item)
   setSelectedFlavor('No Flavoring')

   // Set default milk based on specific drinks and categories
   const noMilkDrinks = ['Espresso', 'Americano']
   const defaultMilk = noMilkDrinks.includes(item.name)
     ? milkOptions.find((milk) => milk.name === 'No Milk') || milkOptions[0]
     : item.category === 'Coffee' || item.category === 'Specialty'
     ? milkOptions.find((milk) => milk.name === 'Whole Milk') || milkOptions[0]
     : milkOptions[0]

   setSelectedMilk(defaultMilk)
   setIsCustomizationModalOpen(true)
 }, [])

 const confirmCustomization = useCallback(() => {
   if (!selectedItem) return

   const newItem: CartItem = {
     ...selectedItem,
     flavor: selectedFlavor === 'No Flavoring' ? undefined : selectedFlavor,
     milk: selectedMilk,
     quantity: 1
   }

   setCart((prevCart) => {
     const existingItemIndex = prevCart.findIndex(
       (item) =>
         item.id === newItem.id &&
         item.flavor === newItem.flavor &&
         item.milk?.name === newItem.milk?.name
     )

     if (existingItemIndex !== -1) {
       return prevCart.map((item, index) =>
         index === existingItemIndex
           ? { ...item, quantity: item.quantity + 1 }
           : item
       )
     }

     return [...prevCart, newItem]
   })

   showNotification(
     `Added ${selectedItem.name} with ${selectedMilk.name}${
       selectedFlavor !== 'No Flavoring' ? ` and ${selectedFlavor}` : ''
     } to cart`
   )

   setIsCustomizationModalOpen(false)
 }, [selectedItem, selectedFlavor, selectedMilk, showNotification])

 const removeFromCart = useCallback((index: number) => {
   setCart((prevCart) => {
     const newCart = [...prevCart]
     if (newCart[index].quantity > 1) {
       newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 }
     } else {
       newCart.splice(index, 1)
     }
     return newCart
   })
 }, [])

 const increaseQuantity = useCallback((index: number) => {
   setCart((prevCart) => {
     const newCart = [...prevCart]
     newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + 1 }
     return newCart
   })
 }, [])

 const calculateTotal = useCallback(() => {
   return isComplimentaryMode
      ? '0.00'
      : cart.reduce(
          (total, item) =>
            total + (item.price + (item.milk?.price || 0)) * item.quantity,
          0
        ).toFixed(2)
  }
, [cart, isComplimentaryMode])

 const handlePlaceOrder = useCallback(() => {
   if (cart.length === 0) return
   setIsModalOpen(true)
 }, [cart])

 const addQuickNote = useCallback(async (note: string) => {
   setOrderNotes((prev) => (prev ? `${prev}\n${note}` : note))
   try {
     await posService.createQuickNote(note)
     const notes = await posService.getQuickNotes()
     setQuickNotes(notes.map(note => note.content))
   } catch (error) {
     console.error('Error saving quick note:', error)
   }
 }, [])

 const confirmOrder = useCallback(async () => {
   if (!customerInfo.firstName || !customerInfo.lastInitial) return

   const orderStartTime = new Date()
   const newOrder = {
     orderNumber,
     customerName: `${customerInfo.firstName} ${customerInfo.lastInitial}.`,
     customerInfo,
     items: cart,
     notes: orderNotes,
     status: 'PENDING',
     total: parseFloat(calculateTotal()),
     isComplimentary: isComplimentaryMode,
     queueTime: queueStartTime
       ? (orderStartTime.getTime() - queueStartTime.getTime()) / 1000
       : 0,
     startTime: orderStartTime
   }

   try {
     await posService.createOrder({ ...newOrder, id: '', userId: '' })
     
     setCart([])
     setCustomerInfo({
       firstName: '',
       lastInitial: '',
       organization: '',
       email: '',
       phone: ''
     })
     setOrderNotes('')
     setOrderNumber(orderNumber + 1)
     setQueueStartTime(new Date())
     setIsModalOpen(false)
     showNotification('Order placed successfully!')
   } catch (error) {
     console.error('Error creating order:', error)
     showNotification('Error creating order. Please try again.')
   }
 }, [
   customerInfo,
   cart,
   orderNumber,
   calculateTotal,
   isComplimentaryMode,
   queueStartTime,
   showNotification,
   orderNotes
 ])

 const filteredMenuItems = useMemo(
   () =>
     menuItems.filter(
       (item) =>
         (selectedCategory === 'All' || item.category === selectedCategory) &&
         item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
         (!showPopular || item.popular)
     ),
   [selectedCategory, searchTerm, showPopular, menuItems]
 )

 const handleKeyPress = useCallback(
   (e: KeyboardEvent) => {
     if (e.key === 'Enter' && e.ctrlKey) {
       handlePlaceOrder()
     }
   },
   [handlePlaceOrder]
 )

 useEffect(() => {
   window.addEventListener('keydown', handleKeyPress)
   return () => {
     window.removeEventListener('keydown', handleKeyPress)
   }
 }, [handleKeyPress])

 const toggleServiceMode = useCallback(() => {
   setIsComplimentaryMode((prev) => !prev)
   showNotification(
     `Switched to ${isComplimentaryMode ? 'Pop-up' : 'Complimentary'} mode`
   )
 }, [isComplimentaryMode, showNotification])

 if (isLoading) {
   return (
     <PageContainer>
       <div className="flex items-center justify-center min-h-screen">
         <div className="flex flex-col items-center space-y-4">
           <Loader2 className="w-8 h-8 animate-spin" />
           <p className="text-lg">Loading POS system...</p>
         </div>
       </div>
     </PageContainer>
   )
 }

 return (
   <PageContainer>
     <div className={`pos-container ${isDarkMode ? 'dark-mode' : ''}`}>
       <h1 className="page-title">Point of Sale</h1>

       <header className="pos-header">
         <div className="header-left">
           <Link href="/waste" passHref>
             <button className="waste-button">
               <Trash2 />
               Waste
             </button>
           </Link>
           <button onClick={toggleServiceMode} className="mode-button">
             {isComplimentaryMode ? <Gift /> : <DollarSign />}
             {isComplimentaryMode ? 'Complimentary' : 'Pop-up'}
           </button>
           <button
             onClick={() => setShowPopular(!showPopular)}
             className={`mode-button ${showPopular ? 'active' : ''}`}
           >
             <Star />
             Popular
           </button>
         </div>

         <div className="search-container">
           <Search />
           <input
             type="text"
             placeholder="Search menu..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="search-input"
           />
         </div>

         <div className="header-right">
           <span className="current-time">
             <Clock size={16} />
             {format(new Date(), 'HH:mm')}
           </span>
           <span className="current-date">
             <CalendarDays size={16} />
             {format(new Date(), 'MMM dd, yyyy')}
           </span>
           <button
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="mode-button"
           >
             {isDarkMode ? <Sun /> : <Moon />}
           </button>
         </div>
       </header>

       <main className="pos-main">
         <section className="cart-section">
           <h2 className="section-title">Cart</h2>

           {cart.length === 0 ? (
             <p className="empty-cart">Your cart is empty</p>
           ) : (
             <ul className="cart-items">
               {cart.map((item, index) => (
                 <li key={index} className="cart-item">
                   <span className="item-name">
                     {item.name}
                     {item.milk && (
                       <span className="item-customization">
                         {' '}
                         ({item.milk.name})
                       </span>
                     )}
                     {item.flavor && (
                       <span className="item-customization">
                         {' '}
                         with {item.flavor}
                       </span>
                     )}
                   </span>
                   <div className="item-controls">
                     <button
                       onClick={() => removeFromCart(index)}
                       className="quantity-button"
                     >
                       <Minus size={16} />
                       </button>
                     <span className="item-quantity">{item.quantity}</span>
                     <button
                       onClick={() => increaseQuantity(index)}
                       className="quantity-button"
                     >
                       <Plus size={16} />
                     </button>
                     <span className="item-price">
                       {isComplimentaryMode
                         ? ''
                         : `$${(
                             (item.price + (item.milk?.price || 0)) *
                             item.quantity
                           ).toFixed(2)}`}
                     </span>
                     <Button
                       onClick={() => removeFromCart(index)}
                       className="remove-item"
                     >
                       <X size={16} />
                     </Button>
                   </div>
                 </li>
               ))}
             </ul>
           )}

           <div className="order-notes-section">
             <textarea
               value={orderNotes}
               onChange={(e) => setOrderNotes(e.target.value)}
               placeholder="Add notes about this order..."
               className="notes-input"
             />
             <div className="quick-notes">
               <div className="quick-note-chips">
                 {quickNotes.map((note, index) => (
                   <button
                     key={index}
                     onClick={() => addQuickNote(note)}
                     className="quick-note-chip"
                   >
                     {note}
                   </button>
                 ))}
               </div>
             </div>
           </div>

           <div className="cart-total">
             <span>Total:</span>
             <span>{isComplimentaryMode ? '' : `$${calculateTotal()}`}</span>
           </div>

           <button
             onClick={handlePlaceOrder}
             disabled={cart.length === 0}
             className="place-order-button"
           >
             Place Order
           </button>

           <Link href="/dashboard/orders" passHref>
             <button className="view-orders-button">View Orders</button>
           </Link>
           <Link href="/dashboard/sales" passHref>
             <button className="view-orders-button">View Reports</button>
           </Link>
         </section>

         <section className="menu-section">
           <div className="category-filters">
             {categories.map((category) => (
               <button
                 key={category}
                 onClick={() => setSelectedCategory(category)}
                 className={`category-button ${
                   category === selectedCategory ? 'active' : ''
                 }`}
               >
                 {category}
               </button>
             ))}
           </div>

           <div className="menu-grid">
             {filteredMenuItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => addToCart(item)}
                 className="menu-item"
               >
                 <Coffee className="item-icon" />
                 <h3 className="item-name">
                   {item.name}
                   {item.popular && <Star className="popular-icon" size={16} />}
                 </h3>
                 <p className="item-price">
                   {isComplimentaryMode ? '' : `$${item.price.toFixed(2)}`}
                 </p>
               </button>
             ))}
           </div>
         </section>
       </main>

       {/* Customer Information Modal */}
       {isModalOpen && (
         <div className="modal-overlay">
           <div className="modal-content">
             <h3 className="modal-title">Customer Information</h3>
             <input
               type="text"
               value={customerInfo.firstName}
               onChange={(e) =>
                 setCustomerInfo({ ...customerInfo, firstName: e.target.value })
               }
               placeholder="First Name"
               className="modal-input"
             />
             <input
               type="text"
               value={customerInfo.lastInitial}
               onChange={(e) =>
                 setCustomerInfo({
                   ...customerInfo,
                   lastInitial: e.target.value
                 })
               }
               placeholder="Last Name Initial"
               className="modal-input"
             />
             <input
               type="text"
               value={customerInfo.organization}
               onChange={(e) =>
                 setCustomerInfo({
                   ...customerInfo,
                   organization: e.target.value
                 })
               }
               placeholder="Organization (Optional)"
               className="modal-input"
             />
             <input
               type="email"
               value={customerInfo.email}
               onChange={(e) =>
                 setCustomerInfo({
                   ...customerInfo,
                   email: e.target.value
                 })
               }
               placeholder="Email (Optional)"
               className="modal-input"
             />
             <input
               type="tel"
               value={customerInfo.phone}
               onChange={(e) =>
                 setCustomerInfo({
                   ...customerInfo,
                   phone: e.target.value
                 })
               }
               placeholder="Phone (Optional)"
               className="modal-input"
             />
             <div className="modal-buttons">
               <button
                 onClick={() => setIsModalOpen(false)}
                 className="modal-button cancel"
               >
                 Cancel
               </button>
               <button onClick={confirmOrder} className="modal-button confirm">
                 Confirm Order
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Customization Modal */}
       {isCustomizationModalOpen && selectedItem && (
         <div className="modal-overlay">
           <div className="modal-content">
             <h3 className="modal-title">Customize {selectedItem.name}</h3>

             <div className="customization-section">
               <h4 className="section-subtitle">Select Milk</h4>
               <div className="milk-options">
                 {milkOptions.map((milk) => (
                   <button
                     key={milk.name}
                     onClick={() => setSelectedMilk(milk)}
                     className={`milk-button ${
                       selectedMilk.name === milk.name ? 'selected' : ''
                     }`}
                   >
                     <span>{milk.name}</span>
                     {milk.price > 0 && (
                       <span className="milk-price">
                         +${milk.price.toFixed(2)}
                       </span>
                     )}
                   </button>
                 ))}
               </div>
             </div>

             <div className="customization-section">
               <h4 className="section-subtitle">Select Flavor</h4>
               {flavorOptions.map((flavor) => (
                 <button
                   key={flavor}
                   onClick={() => setSelectedFlavor(flavor)}
                   className={`flavor-button ${
                     selectedFlavor === flavor ? 'selected' : ''
                   }`}
                 >
                   {flavor}
                 </button>
               ))}
             </div>

             <div className="modal-buttons">
               <button
                 onClick={() => setIsCustomizationModalOpen(false)}
                 className="modal-button cancel"
               >
                 Cancel
               </button>
               <button
                 onClick={confirmCustomization}
                 className="modal-button confirm"
                 disabled={!selectedFlavor}
               >
                 Add to Cart
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Notification */}
       {notification && (
         <div className="notification">
           <Bell size={16} />
           {notification}
         </div>
       )}
     </div>
   </PageContainer>
 )
}

export default BufBaristaPOS

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/pos/styles.css
/* Base Variables */
:root {
  --primary-color: #4a90e2;
  --secondary-color: #50e3c2;
  --accent-color: #f5a623;
  --background-color: #f8f9fa;
  --text-color: #333333;
  --border-color: #e1e4e8;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
}

/* Container Styles */
.pos-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-color);
}

/* Header Styles */
.pos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-time,
.current-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 14px;
}

.mode-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--secondary-color);
  color: white;
}

.waste-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--danger-color);
  color: white;
}

.mode-button:hover {
  background-color: var(--accent-color);
  transform: translateY(-2px);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px;
  min-width: 200px;
}

/* Main Layout */
.pos-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}


/* Menu Section */
.menu-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.category-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ghostwhite;
  color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.category-button.active {
  background-color: var(--primary-color);
  color: teal;
  transform: translateY(-2px);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: white;
  position: relative;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-icon {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.popular-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--warning-color);
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.item-price {
  font-size: 14px;
  color: var(--accent-color);
  font-weight: bold;
}

/* Cart Section */
.cart-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-cart {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 1rem;
}

.cart-items {
  list-style-type: none;
  padding: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.item-customization {
  font-size: 14px;
  color: var(--accent-color);
  font-style: italic;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-button:hover {
  background-color: var(--background-color);
}

.item-quantity {
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}

.remove-item {
  color: var(--danger-color);
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
}

.remove-item:hover {
  transform: scale(1.1);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border-color);
}

.running-total {
  margin-top: 1rem;
  font-weight: bold;
  color: var(--accent-color);
}

/* Notes Section */
.order-notes-section {
  margin-top: 15px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.notes-input {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
}

.quick-notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-note-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #4a90e2;
  color: white;
}

.quick-note-button:hover {
  background-color: #357abd;
  transform: translateY(-2px);
}

.quick-note-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-note-chip {
  padding: 6px 12px;
  border: none;
  border-radius: 15px;
  background-color: #e9ecef;
  color: #495057;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-note-chip:hover {
  background-color: #4a90e2;
  color: white;
  transform: translateY(-2px);
}

/* Action Buttons */
.place-order-button,
.view-orders-button {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.place-order-button {
  background-color: #28a745;
  color: white;
}

.place-order-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.place-order-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.view-orders-button {
  background-color: #17a2b8;
  color: white;
}

.view-orders-button:hover {
  background-color: #138496;
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.section-subtitle {
  font-size: 16px;
  color: #495057;
  margin-bottom: 10px;
}

.modal-input,
.modal-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
  font-family: inherit;
}

.modal-textarea {
  min-height: 100px;
  resize: vertical;
}

.customization-section {
  margin-bottom: 20px;
}

.milk-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.milk-button,
.flavor-button {
  width: 100%;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  background-color: white;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  margin-bottom: 5px;
}

.milk-button:hover,
.flavor-button:hover {
  background-color: #f8f9fa;
}

.milk-button.selected,
.flavor-button.selected {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.milk-price {
  font-size: 12px;
  opacity: 0.8;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button.confirm {
  background-color: #28a745;
  color: white;
}

.modal-button.cancel {
  background-color: #dc3545;
  color: white;
}

.modal-button:hover {
  transform: translateY(-2px);
}

.modal-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  background-color: #4a90e2;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: slide In 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Dark Mode Styles */
.dark-mode {
  --background-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #444;
  --primary-color: #3a7bc8;
  --secondary-color: #3cc9ac;
  --accent-color: #f5a623;
}

.dark-mode .pos-container {
  background-color: var(--background-color);
  color: var(--text-color);
}

.dark-mode .pos-header,
.dark-mode .menu-section,
.dark-mode .cart-section,
.dark-mode .modal-content,
.dark-mode .menu-item {
  background-color: #2c2c2c;
  color: var(--text-color);
}

.dark-mode .search-container {
  background-color: #3c3c3c;
  border-color: #444;
}

.dark-mode .search-input {
  background-color: #3c3c3c;
  color: var(--text-color);
}

.dark-mode .category-button {
  background-color: #3c3c3c;
  color: var(--text-color);
}

.dark-mode .category-button.active {
  background-color: var(--primary-color);
  color: white;
}

.dark-mode .order-notes-section {
  background-color: #2c2c2c;
  border-color: #444;
}

.dark-mode .notes-input,
.dark-mode .modal-input,
.dark-mode .modal-textarea {
  background-color: #3c3c3c;
  border-color: #444;
  color: var(--text-color);
}

.dark-mode .quick-note-chip {
  background-color: #3c3c3c;
  color: #f0f0f0;
}

.dark-mode .milk-button,
.dark-mode .flavor-button {
  background-color: #3c3c3c;
  border-color: #444;
  color: var(--text-color);
}

.dark-mode .milk-button.selected,
.dark-mode .flavor-button.selected {
  background-color: var(--primary-color);
  color: white;
}

.dark-mode .quantity-button {
  color: black;
}

.dark-mode .remove-item {
  color: #ff6b6b;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .pos-container {
    padding: 10px;
  }

  .pos-main {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .pos-header {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-container {
    width: 100%;
  }

  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-controls {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .category-filters {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 10px;
  }

  .category-button {
    flex-shrink: 0;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
    padding: 15px;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .modal-button {
    width: 100%;
  }

  .quick-note-chips {
    max-height: 120px;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .menu-item {
    padding: 0.75rem;
  }

  .item-name {
    font-size: 14px;
  }

  .modal-content {
    padding: 15px;
  }

  .notification {
    width: 90%;
    left: 5%;
    right: 5%;
  }
}

/* Print Styles */
@media print {
  .pos-container {
    background: white;
  }

  .pos-header,
  .menu-section,
  .mode-button,
  .search-container,
  .category-filters,
  .place-order-button,
  .view-orders-button {
    display: none;
  }

  .cart-section {
    width: 100%;
    box-shadow: none;
  }

  .cart-items {
    border: 1px solid #ddd;
  }

  .notification {
    display: none;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: more) {
  :root {
    --primary-color: #0056b3;
    --secondary-color: #006644;
    --accent-color: #cc7700;
    --text-color: #000000;
    --background-color: #ffffff;
    --border-color: #000000;
  }

  .dark-mode {
    --text-color: #ffffff;
    --background-color: #000000;
    --border-color: #ffffff;
  }

  .button,
  .modal-button,
  .quick-note-button {
    border: 2px solid currentColor;
  }
}

/* Focus Styles */
.button:focus,
.modal-button:focus,
.menu-item:focus,
.quick-note-button:focus,
.quick-note-chip:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.search-input:focus,
.notes-input:focus,
.modal-input:focus,
.modal-textarea:focus {
  outline: 2px solid var(--primary-color);
  border-color: var(--primary-color);
}

/* Touch Device Optimizations */
@media (hover: none) {
  .button:hover,
  .modal-button:hover,
  .menu-item:hover,
  .quick-note-button:hover,
  .quick-note-chip:hover {
    transform: none;
  }

  .menu-item,
  .cart-item,
  .modal-button {
    cursor: default;
  }

  .quantity-button,
  .remove-item {
    padding: 8px;
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/[id]/error.tsx
// src/app/(app)/qr/[id]/error.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function Error() {
  return (
    <div className="flex-1 p-8">
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="mt-2 text-muted-foreground">
            Failed to load QR code
          </p>
          <Link href="/qr" className="mt-4 inline-block">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to QR Codes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/[id]/loading.tsx
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/[id]/not-found.tsx
// src/app/(app)/qr/[id]/not-found.tsx
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex-1 p-8">
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">QR Code Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The QR code you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/qr" className="mt-4 inline-block">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to QR Codes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/[id]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { QRForm } from "@/components/dashboard/qr/qr-form"
import { getQRCodeById } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

// @ts-ignore
export default async function QRCodePage({ params }) {
  let qrCode = null
  
  try {
    qrCode = await getQRCodeById(params.id)
  } catch {
    if (process.env.NODE_ENV === 'production') {
      console.error("Error loading QR code:", params.id)
    }
  }

  if (!qrCode) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit QR Code</h2>
          <p className="text-muted-foreground">
            Update your QR code settings and rules
          </p>
        </div>
        <Link href="/qr">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to QR Codes
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <QRForm initialData={qrCode} />
      </Card>
    </div>
  )
}

// @ts-ignore
export async function generateMetadata({ params }): Promise<Metadata> {
  let qrCode = null
  
  try {
    qrCode = await getQRCodeById(params.id)
  } catch {
    return {
      title: "QR Code Not Found | Chain Works",
      description: "The requested QR code could not be found.",
    }
  }

  if (!qrCode) {
    return {
      title: "QR Code Not Found | Chain Works",
      description: "The requested QR code could not be found.",
    }
  }

  return {
    title: `Edit ${qrCode.name} | Chain Works`,
    description: `Update settings and rules for QR code: ${qrCode.name}`,
    openGraph: {
      title: `Edit ${qrCode.name} | Chain Works`,
      description: `Update settings and rules for QR code: ${qrCode.name}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Edit ${qrCode.name} | Chain Works`,
      description: `Update settings and rules for QR code: ${qrCode.name}`,
    },
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/new/error.tsx
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          Failed to create QR code. Please try again.
        </p>
        <Link href="/dashboard/qr">
          <Button>Back to QR Codes</Button>
        </Link>
      </div>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/new/loading.tsx
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/new/page.tsx
import { Metadata } from "next"
import { QRForm } from "@/components/dashboard/qr/qr-form"

export const metadata: Metadata = {
  title: "Create QR Code | Chain Works",
  description: "Create a new QR code",
}

export default function NewQRCodePage() {
  return (
    <div className="flex-1">
      <QRForm />
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/qr/page.tsx
// src/app/(app)/qr/page.tsx
"use client"

import { useState } from "react"
import { FolderList } from "@/components/dashboard/qr/folder-list"
import { QRView } from "@/components/dashboard/qr/qr-view"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"

export default function QRCodesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  return (
       <PageContainer>

    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">QR Codes</h2>
          <p className="text-muted-foreground">
            Create and manage your dynamic QR codes
          </p>
        </div>
        <Link href="/qr/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Button>
        </Link>
      </div>

      <div className="flex gap-8">
        <div className="w-64">
          <FolderList
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
          />
        </div>
        <div className="flex-1">
          <QRView folderId={selectedFolderId} />
        </div>
      </div>
    </div>
  </PageContainer>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/sales/page.tsx
"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  eachDayOfInterval,
} from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts'
import {
  Download,
  DollarSign,
  TrendingUp,
  Coffee,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader,
  Users,
  ShoppingCart,
  Percent,
  Award,
} from 'lucide-react'
import { PageContainer } from "@/components/layout/page-container"
import './styles.css'

interface Order {
  id: number
  customerName: string
  total: number
  status: string
  timestamp: string
  items: Array<{
    name: string
    quantity: number
    price: number
    category: string
  }>
  isComplimentary: boolean
  preparationTime?: number
  queueTime: number
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
  }
}

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom'

interface TrendMetrics {
  date: string
  sales: number
  orders: number
  movingAverageSales: number
  movingAverageOrders: number
  salesGrowth: number
  ordersGrowth: number
  trend: 'up' | 'down' | 'stable'
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82ca9d',
  '#ffc658'
]

const Reports: React.FC = () => {
  // State declarations
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders'>(
    'sales'
  )

  // Memoized helper functions
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const calculateMovingAverage = useCallback((data: number[], periods: number) => {
    return data.map((_, index) => {
      const start = Math.max(0, index - periods + 1)
      const values = data.slice(start, index + 1)
      return values.reduce((sum, val) => sum + val, 0) / values.length
    })
  }, [])

  // Data fetching
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const storedOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      ) as Order[]
      setOrders(storedOrders)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch orders. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Date range handling
  const getDateRange = useCallback(() => {
    const now = new Date()
    switch (timeRange) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return {
          start: customStartDate
            ? startOfDay(customStartDate)
            : startOfDay(now),
          end: customEndDate ? endOfDay(customEndDate) : endOfDay(now)
        }
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) }
    }
  }, [timeRange, customStartDate, customEndDate])

  // Filtered data
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange()
    return orders.filter((order) => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= start && orderDate <= end
    })
  }, [orders, getDateRange])

  // Sales data calculations
  const salesData = useMemo(() => {
    const { start, end } = getDateRange()
    const days = eachDayOfInterval({ start, end })
    const data: { [key: string]: { sales: number; orders: number } } = {}

    days.forEach((day) => {
      const date = format(day, 'yyyy-MM-dd')
      data[date] = { sales: 0, orders: 0 }
    })

    filteredOrders.forEach((order) => {
      const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
      if (!data[date]) {
        data[date] = { sales: 0, orders: 0 }
      }
      data[date].sales += order.isComplimentary ? 0 : order.total
      data[date].orders += 1
    })
    return Object.entries(data)
      .map(([date, values]) => ({
        date,
        sales: values.sales,
        orders: values.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredOrders, getDateRange])

  // Enhanced sales trend calculation
  const enhancedSalesTrend = useMemo((): TrendMetrics[] => {
    const baseData = salesData.map((item) => ({
      date: item.date,
      sales: item.sales,
      orders: item.orders
    }))

    const salesValues = baseData.map((item) => item.sales)
    const ordersValues = baseData.map((item) => item.orders)

    const movingAverageSales = calculateMovingAverage(salesValues, 7)
    const movingAverageOrders = calculateMovingAverage(ordersValues, 7)

    return baseData.map((item, index) => {
      const previousSales = salesValues[index - 1] || salesValues[index]
      const previousOrders = ordersValues[index - 1] || ordersValues[index]

      const salesGrowth = ((item.sales - previousSales) / previousSales) * 100
      const ordersGrowth =
        ((item.orders - previousOrders) / previousOrders) * 100

      const trend =
        salesGrowth > 1 ? 'up' : salesGrowth < -1 ? 'down' : 'stable'

      return {
        date: item.date,
        sales: item.sales,
        orders: item.orders,
        movingAverageSales: movingAverageSales[index],
        movingAverageOrders: movingAverageOrders[index],
        salesGrowth,
        ordersGrowth,
        trend
      }
    })
  }, [salesData, calculateMovingAverage])

  // Additional metrics calculations
  const totalSales = useMemo(() => {
    return filteredOrders.reduce(
      (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
      0
    )
  }, [filteredOrders])

  const totalOrders = useMemo(() => filteredOrders.length, [filteredOrders])

  const averageOrderValue = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) => !order.isComplimentary)
    return paidOrders.length > 0 ? totalSales / paidOrders.length : 0
  }, [filteredOrders, totalSales])

// Average preparation time calculation
const averagePreparationTime = useMemo(() => {
  const ordersWithPrepTime = filteredOrders.filter(
    (order) => order.preparationTime !== undefined
  )
  if (ordersWithPrepTime.length === 0) {
    return 0
  }
  return Math.round(
    ordersWithPrepTime.reduce(
      (sum, order) => sum + (order.preparationTime || 0),
      0
    ) / ordersWithPrepTime.length
  )
}, [filteredOrders])

// Sales by category calculation
const salesByCategory = useMemo(() => {
  const categorySales: { [key: string]: number } = {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      categorySales[item.category] =
        (categorySales[item.category] || 0) + item.price * item.quantity
    })
  })
  return Object.entries(categorySales).map(([name, value]) => ({
    name,
    value
  }))
}, [filteredOrders])

// Top selling items calculation
const topSellingItems = useMemo(() => {
  const itemCounts: { [key: string]: { quantity: number; revenue: number } } =
    {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { quantity: 0, revenue: 0 }
      }
      itemCounts[item.name].quantity += item.quantity
      itemCounts[item.name].revenue += item.price * item.quantity
    })
  })
  return Object.entries(itemCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
}, [filteredOrders])

// Orders by hour calculation
const ordersByHour = useMemo(() => {
  const hourlyOrders: { [key: number]: number } = {}
  filteredOrders.forEach((order) => {
    const hour = new Date(order.timestamp).getHours()
    hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
  })
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: hourlyOrders[i] || 0
  }))
}, [filteredOrders])

// Preparation time vs order value calculation
const preparationTimeVsOrderValue = useMemo(() => {
  return filteredOrders
    .filter((order) => order.preparationTime !== undefined)
    .map((order) => ({
      preparationTime: order.preparationTime || 0,
      orderValue: order.total
    }))
}, [filteredOrders])

// Customer metrics calculations
const uniqueCustomers = useMemo(() => {
  return new Set(filteredOrders.map((order) => order.customerName)).size
}, [filteredOrders])

const repeatCustomerRate = useMemo(() => {
  const customerOrderCounts = filteredOrders.reduce((acc, order) => {
    acc[order.customerName] = (acc[order.customerName] || 0) + 1
    return acc
  }, {} as { [key: string]: number })
  const repeatCustomers = Object.values(customerOrderCounts).filter(
    (count) => count > 1
  ).length
  return uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
}, [filteredOrders, uniqueCustomers])

// Average items per order calculation
const averageItemsPerOrder = useMemo(() => {
  const totalItems = filteredOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )
  return totalOrders > 0 ? totalItems / totalOrders : 0
}, [filteredOrders, totalOrders])

// Sales trend calculation
const salesTrend = useMemo(() => {
  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start, end })
  const salesByDay: { [key: string]: number } = {}

  days.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd')
    salesByDay[date] = 0
  })

  filteredOrders.forEach((order) => {
    const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
    salesByDay[date] += order.isComplimentary ? 0 : order.total
  })

  return Object.entries(salesByDay)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date))
}, [filteredOrders, getDateRange])

// Customer retention rate calculation
const customerRetentionRate = useMemo(() => {
  const { start } = getDateRange()
  const previousPeriodStart = subDays(
    start,
    getDateRange().end.getTime() - start.getTime()
  )

  const currentCustomers = new Set(
    filteredOrders.map((order) => order.customerName)
  )
  const previousCustomers = new Set(
    orders
      .filter((order) => {
        const orderDate = new Date(order.timestamp)
        return orderDate >= previousPeriodStart && orderDate < start
      })
      .map((order) => order.customerName)
  )

  const retainedCustomers = [...currentCustomers].filter((customer) =>
    previousCustomers.has(customer)
  ).length
  return previousCustomers.size > 0
    ? (retainedCustomers / previousCustomers.size) * 100
    : 0
}, [filteredOrders, orders, getDateRange])

// Peak hour sales calculation
const peakHourSales = useMemo(() => {
  const hourlyData = filteredOrders.reduce((acc, order) => {
    const hour = new Date(order.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + (order.isComplimentary ? 0 : order.total)
    return acc
  }, {} as { [key: number]: number })

  if (Object.keys(hourlyData).length === 0) {
    return { hour: 'N/A', sales: 0 }
  }

  const peakHour = Object.entries(hourlyData).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )
  return { hour: peakHour[0], sales: peakHour[1] }
}, [filteredOrders])

// Sales growth rate calculation
const salesGrowthRate = useMemo(() => {
  const { start, end } = getDateRange()
  const periodLength = end.getTime() - start.getTime()
  const previousPeriodStart = new Date(start.getTime() - periodLength)

  const currentPeriodSales = filteredOrders.reduce(
    (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
    0
  )
  const previousPeriodSales = orders
    .filter((order) => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= previousPeriodStart && orderDate < start
    })
    .reduce(
      (sum, order) => sum + (order.isComplimentary ? 0 : order.total),
      0
    )

  return previousPeriodSales !== 0
    ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100
    : 100
}, [filteredOrders, orders, getDateRange])

// Category performance calculation
const categoryPerformance = useMemo(() => {
  const categoryData: { [key: string]: { sales: number; orders: number } } =
    {}
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = { sales: 0, orders: 0 }
      }
      categoryData[item.category].sales += item.price * item.quantity
      categoryData[item.category].orders += item.quantity
    })
  })
  return Object.entries(categoryData).map(([category, data]) => ({
    category,
    sales: data.sales,
    orders: data.orders
  }))
}, [filteredOrders])

// Daily sales and orders calculation
const dailySalesAndOrders = useMemo(() => {
  const { start, end } = getDateRange()
  const days = eachDayOfInterval({ start, end })
  const dailyData: {
    [key: string]: { date: string; sales: number; orders: number }
  } = {}

  days.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd')
    dailyData[date] = { date, sales: 0, orders: 0 }
  })

  filteredOrders.forEach((order) => {
    const date = format(new Date(order.timestamp), 'yyyy-MM-dd')
    dailyData[date].sales += order.isComplimentary ? 0 : order.total
    dailyData[date].orders += 1
  })

  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
}, [filteredOrders, getDateRange])

// CSV generation
const generateCSV = useCallback(() => {
  import('jspdf').then((module) => {
    const { jsPDF } = module
    const doc = new jsPDF()
    doc.autoTable({
      head: [['Date', 'Sales', 'Orders']],
      body: dailySalesAndOrders.map((data) => [
        data.date,
        data.sales.toFixed(2),
        data.orders
      ])
    })
    doc.save('sales-report.pdf')
  })
}, [
  dailySalesAndOrders,
  filteredOrders,
  totalSales,
  totalOrders,
  averageOrderValue,
  uniqueCustomers,
  customerRetentionRate,
  averagePreparationTime,
  repeatCustomerRate,
  salesGrowthRate,
  topSellingItems,
  salesByCategory,
  getDateRange,
  formatTime
])

// Loading state
if (isLoading) {
  return (
    <div className="loading-container">
      <Loader size={48} className="spin" />
      <p>Loading report data...</p>
    </div>
  )
}

// Error state
if (error) {
  return (
    <div className="error-container">
      <AlertTriangle size={48} />
      <p>{error}</p>
      <button onClick={fetchOrders} className="retry-button">
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  )
}

return (
  <PageContainer>
    <div className="reports-container">
      <h1 className="page-title">Sales Reports</h1>

      <div className="controls">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="time-range-select"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {timeRange === 'custom' && (
          <div className="custom-date-range">
            <DatePicker
              selected={customStartDate}
              onChange={(date) => setCustomStartDate(date)}
              selectsStart
              startDate={customStartDate as Date | undefined}
              endDate={customEndDate as Date | undefined}
              maxDate={new Date()}
              placeholderText="Start Date"
              className="custom-date-input"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              selectsEnd
              startDate={customStartDate as Date | undefined}
              endDate={customEndDate as Date | undefined}
              minDate={customStartDate as Date | undefined}
              maxDate={new Date()}
              placeholderText="End Date"
              className="custom-date-input"
            />
          </div>
        )}
        <button onClick={fetchOrders} className="refresh-button">
          <RefreshCw size={16} /> Refresh Data
        </button>
        <button onClick={generateCSV} className="download-button">
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Sales</h3>
            <p className="metric-value">${totalSales.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Coffee size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{totalOrders}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Average Order Value</h3>
            <p className="metric-value">${averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>Avg Preparation Time</h3>
            <p className="metric-value">{formatTime(averagePreparationTime)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <h3>Unique Customers</h3>
            <p className="metric-value">{uniqueCustomers}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Percent size={24} />
          </div>
          <div className="metric-content">
            <h3>Repeat Customer Rate</h3>
            <p className="metric-value">{repeatCustomerRate.toFixed(2)}%</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="metric-content">
            <h3>Avg Items Per Order</h3>
            <p className="metric-value">{averageItemsPerOrder.toFixed(2)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <h3>Peak Hour Sales</h3>
            <p className="metric-value">
              Hour {peakHourSales.hour}, ${peakHourSales.sales.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card advanced">
          <h3>Sales and Orders Trend Analysis</h3>
          <div className="chart-controls">
            <button
              onClick={() => setSelectedMetric('sales')}
              className={`chart-control-button ${
                selectedMetric === 'sales' ? 'active' : ''
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setSelectedMetric('orders')}
              className={`chart-control-button ${
                selectedMetric === 'orders' ? 'active' : ''
              }`}
            >
              Orders
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={enhancedSalesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (typeof name === 'string' && name.includes('Growth')) {
                    return [`${Number(value).toFixed(2)}%`, name]
                  }
                  return [value, name]
                }}
              />
              <Legend />
              {selectedMetric === 'sales' ? (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    fill="#8884d8"
                    name="Sales"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="movingAverageSales"
                    stroke="#82ca9d"
                    name="7-day Moving Average"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="salesGrowth"
                    stroke="#ff7300"
                    name="Growth Rate %"
                  />
                </>
              ) : (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    fill="#82ca9d"
                    name="Orders"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="movingAverageOrders"
                    stroke="#8884d8"
                    name="7-day Moving Average"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ordersGrowth"
                    stroke="#ff7300"
                    name="Growth Rate %"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="trend-indicators">
            <div className="trend-summary">
              <h4>Trend Analysis</h4>
              <p>
                7-day Moving Average:{' '}
                {selectedMetric === 'sales'
                  ? `$${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.movingAverageSales.toFixed(2)}`
                  : enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.movingAverageOrders.toFixed(1)}
              </p>
              <p>
                Growth Rate:{' '}
                {selectedMetric === 'sales'
                  ? `${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.salesGrowth.toFixed(2)}%`
                  : `${enhancedSalesTrend[
                      enhancedSalesTrend.length - 1
                    ]?.ordersGrowth.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </div>
        <div className="chart-card">
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Top Selling Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" name="Quantity" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Orders by Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Preparation Time vs Order Value</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="preparationTime"
                  name="Preparation Time"
                  tickFormatter={(value) => formatTime(value)}
                />
                <YAxis
                  type="number"
                  dataKey="orderValue"
                  name="Order Value"
                  unit="$"
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'preparationTime') {
                      return [formatTime(value as number), name]
                    }
                    return [value, name]
                  }}
                />
                <Scatter
                  name="Orders"
                  data={preparationTimeVsOrderValue}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={categoryPerformance}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar
                  name="Sales"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Orders"
                  dataKey="orders"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Daily Sales and Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailySalesAndOrders}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="date" scale="band" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  barSize={20}
                  fill="#413ea0"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  stroke="#ff7300"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Reports
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/sales/styles.css

    /* Base Variables */
    :root {
    --primary-color: #4a90e2;
    --secondary-color: #50e3c2;
    --accent-color: #f5a623;
    --background-color: #f8f9fa;
    --text-color: #333333;
    --border-color: #e1e4e8;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    }

    .nav-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    }
    .nav-button {
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    text-decoration: none;
    width: 100%;
    }
    .reports-container {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--background-color);

    }

    .page-title {
    font-size: 28px;
    color: #4a90e2;
    margin-bottom: 20px;
    text-align: center;
    }

    .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    }

    .time-range-select,
    .refresh-button,
    .download-button,
    .custom-date-input {
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    }

    .custom-date-range {
    display: flex;
    align-items: center;
    gap: 10px;
    }

    .refresh-button,
    .download-button {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: #4a90e2;
    color: white;
    border: none;
    transition: background-color 0.3s ease;
    }

    .refresh-button:hover,
    .download-button:hover {
    background-color: #357abd;
    }

    .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    }

    /* Add responsive breakpoint for mobile */
    @media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    }

    @media (max-width: 480px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }
    }

    .metric-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .metric-icon {
    background-color: #f0f0f0;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    }

    .metric-content h3 {
    font-size: 14px;
    color: #666;
    margin: 0;
    }

    .metric-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin: 5px 0 0;
    }

    .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    }

    .chart-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .chart-card h3 {
    font-size: 18px;
    color: #333;
    margin-top: 0;
    margin-bottom: 15px;
    }

    .chart-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    }

    .chart-control-button {
    padding: 5px 10px;
    font-size: 14px;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
    }

    .chart-control-button.active {
    background-color: #4a90e2;
    color: white;
    }

    .loading-container,
    .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    }

    .loading-container p,
    .error-container p {
    margin-top: 20px;
    font-size: 18px;
    color: #666;
    }

    .spin {
    animation: spin 1s linear infinite;
    }

    @keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    }
    .chart-card.advanced {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    }

    .trend-indicators {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    }

    .trend-summary {
    display: flex;
    flex-direction: column;
    gap: 8px;
    }

    .trend-summary h4 {
    margin: 0;
    color: #333;
    font-size: 16px;
    }

    .trend-summary p {
    margin: 0;
    color: #666;
    font-size: 14px;
    }
    .quick-actions {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    }

    .action-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    flex: 1;
    min-width: 150px;
    justify-content: center;
    }

    .action-button:hover {
    background-color: #357abd;
    }

    @media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
    }

    .action-button {
        width: 100%;
        min-width: unset;
    }
    }

    .retry-button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    }


    @media (max-width: 768px) {
    .controls {
        flex-direction: column;
    }

    .chart-grid {
        grid-template-columns: 1fr;
    }
    }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/settings/page.tsx
import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/settings/profile-form";
import { AccountForm } from "@/components/settings/account-form";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Settings | BUF BARISTA CRM",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <PageContainer>
    <h1 className="page-title">Settings</h1>
    <div className="space-y-6">
      <div>
        
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          <AccountForm />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm />
        </TabsContent>
      </Tabs>
    </div>
    </PageContainer>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/waste/page.tsx
"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Trash2,
  Plus,
  Coffee,
  Package,
  Save,
  AlertTriangle,
  Minus,
  Search,
  X,
  Check,
  Moon,
  Sun,
  Clock,
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

interface WasteItem {
  id: string
  itemName: string
  category: string
  quantity: number
  timestamp: string
  cost: number
  notes: string
}

interface WasteCategory {
  name: string
  items: string[]
  unit: string
  averageCost: number
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface WasteLogItem {
  itemName: string
  category: string
  quantity: number
  cost: number
  unit: string
}

const wasteCategories: WasteCategory[] = [
  {
    name: 'Drinks',
    items: ['Hot Coffee', 'Iced Coffee', 'Latte', 'Espresso', 'Tea'],
    unit: 'cups',
    averageCost: 3.5
  },
  {
    name: 'Milk',
    items: ['Whole Milk', '2% Milk', 'Almond Milk', 'Oat Milk', 'Soy Milk'],
    unit: 'oz',
    averageCost: 0.25
  },
  {
    name: 'Food',
    items: ['Pastries', 'Sandwiches', 'Cookies', 'Muffins'],
    unit: 'pieces',
    averageCost: 4
  },
  {
    name: 'Supplies',
    items: ['Cups', 'Lids', 'Straws', 'Napkins', 'Sleeves'],
    unit: 'pieces',
    averageCost: 0.15
  },
  {
    name: 'Syrups',
    items: ['Vanilla', 'Caramel', 'Hazelnut', 'Chocolate'],
    unit: 'pumps',
    averageCost: 0.3
  }
]

const WasteManagement: React.FC = () => {
  const [wasteLog, setWasteLog] = useState<WasteItem[]>([])
  const [currentLog, setCurrentLog] = useState<WasteLogItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [notes, setNotes] = useState('')

  // Load initial data
  useEffect(() => {
    const savedWasteLog = localStorage.getItem('wasteLog')
    if (savedWasteLog) {
      setWasteLog(JSON.parse(savedWasteLog))
    }

    const savedDarkMode = localStorage.getItem('wasteDarkMode')
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('wasteDarkMode', JSON.stringify(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  // Save waste log
  const saveWasteLog = useCallback((newLog: WasteItem[]) => {
    localStorage.setItem('wasteLog', JSON.stringify(newLog))
    setWasteLog(newLog)
  }, [])

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return wasteCategories
    }
    return wasteCategories.filter(
      (category) => category.name === selectedCategory
    )
  }, [selectedCategory])

  // Add item to current log
  const addToLog = useCallback((item: string, category: WasteCategory) => {
    setCurrentLog((prev) => {
      const existingItem = prev.find(
        (logItem) =>
          logItem.itemName === item && logItem.category === category.name
      )

      if (existingItem) {
        return prev.map((logItem) =>
          logItem.itemName === item && logItem.category === category.name
            ? { ...logItem, quantity: logItem.quantity + 1 }
            : logItem
        )
      }

      return [
        ...prev,
        {
          itemName: item,
          category: category.name,
          quantity: 1,
          cost: category.averageCost,
          unit: category.unit
        }
      ]
    })
  }, [])
  // Remove item from log
  const removeFromLog = useCallback((index: number) => {
    setCurrentLog((prev) => {
      const newLog = [...prev]
      const item = newLog[index]

      if (item.quantity > 1) {
        newLog[index] = { ...item, quantity: item.quantity - 1 }
        return newLog
      }

      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // Increase item quantity
  const increaseQuantity = useCallback((index: number) => {
    setCurrentLog((prev) => {
      const newLog = [...prev]
      const item = newLog[index]
      newLog[index] = { ...item, quantity: item.quantity + 1 }
      return newLog
    })
  }, [])

  // Show notification message
  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  // Calculate total cost
  const calculateTotalCost = useMemo(() => {
    return currentLog.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  }, [currentLog])

  // Handle log submission
  const handleLogSubmit = useCallback(() => {
    if (currentLog.length === 0) {
      showMessage('Please add items to log', 'error')
      return
    }

    const timestamp = new Date().toISOString()
    const newWasteItems: WasteItem[] = currentLog.map((item) => ({
      id: `${Date.now()}-${Math.random()}`,
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      timestamp,
      cost: item.cost * item.quantity,
      notes
    }))

    const updatedLog = [...newWasteItems, ...wasteLog]
    saveWasteLog(updatedLog)

    setCurrentLog([])
    setNotes('')
    showMessage('Waste items logged successfully', 'success')
  }, [currentLog, notes, wasteLog, saveWasteLog, showMessage])

  return (
    <PageContainer>
    <div className={`waste-container ${isDarkMode ? 'dark-mode' : ''}`}>
          <h1 className="page-title">Waste Management</h1>
      <header className="waste-header">
        <div className="header-left">
          <button className="mode-button">
            <Trash2 size={16} /> Total Cost: ${calculateTotalCost.toFixed(2)}
          </button>
        </div>

        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search waste items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="header-right">
          <span className="current-time">
            <Clock size={16} />
            {format(new Date(), 'HH:mm')}
          </span>
          <span className="current-date">
            <CalendarDays size={16} />
            {format(new Date(), 'MMM dd, yyyy')}
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="mode-button"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="waste-main">
        <section className="waste-log-section">
          <h2 className="section-title">Current Waste Log</h2>

          {!currentLog || currentLog.length === 0 ? (
            <p className="empty-log">No items added to waste log</p>
          ) : (
            <ul className="waste-items">
              {currentLog.map((item, index) => (
                <li key={index} className="waste-item">
                  <span className="item-name">
                    {item.itemName}
                    <span className="item-category">({item.category})</span>
                  </span>
                  <div className="item-controls">
                    <button
                      onClick={() => removeFromLog(index)}
                      className="quantity-button"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="item-quantity">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => increaseQuantity(index)}
                      className="quantity-button"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="item-cost">
                      ${(item.cost * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromLog(index)}
                      className="remove-button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="log-details">
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="log-total">
            <span>Total Cost:</span>
            <span>${calculateTotalCost.toFixed(2)}</span>
          </div>

          <button
            onClick={handleLogSubmit}
            disabled={!currentLog || currentLog.length === 0}
            className="submit-log-button"
          >
            <Save size={16} /> Submit Waste Log
          </button>

          <Link href="/log" passHref>
            <button className="nav-button">
              <Coffee size={16} /> View Waste Log History
            </button>
          </Link>

          <Link href="/pos" passHref>
            <button className="nav-button">
              <Coffee size={16} /> Return to POS
            </button>
          </Link>
        </section>
        <section className="waste-menu-section">
          <div className="category-filters">
            {['All', ...wasteCategories.map((cat) => cat.name)].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-button ${
                    category === selectedCategory ? 'active' : ''
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          <div className="menu-grid">
            {filteredCategories.map((category) => (
              <div key={category.name} className="category-section">
                <h3 className="category-title">{category.name}</h3>
                <div className="items-grid">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => addToLog(item, category)}
                      className="waste-menu-item"
                    >
                      <Package className="item-icon" />
                      <h3 className="item-name">{item}</h3>
                      <p className="item-details">
                        ${category.averageCost.toFixed(2)} per {category.unit}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {message && (
        <div className={`notification ${message.type}`}>
          {message.type === 'success' ? (
            <Check size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {message.text}
        </div>
      )}

     
    </div>

  </PageContainer>
  )
}

export default WasteManagement

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/waste/styles.css
/* Base Variables */
:root {
--primary-color: #4a90e2;
--secondary-color: #50e3c2;
--accent-color: #f5a623;
--background-color: #f8f9fa;
--text-color: #333333;
--border-color: #e1e4e8;
--success-color: #28a745;
--warning-color: #ffc107;
--danger-color: #dc3545;
}
.waste-container {
max-width: 1200px;
margin: 0 auto;
padding: 20px;
background-color: var(--background-color);
min-height: 100vh;
}

.waste-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
padding: 15px;
background-color: white;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
margin-top: 40px;
}

.header-left,
.header-right {
display: flex;
align-items: center;
gap: 10px;
}

.page-title {
font-size: 24px;
color: #4a90e2;
margin: 0;
}

.current-time,
.current-date {
display: flex;
align-items: center;
gap: 0.5rem;
color: #495057;
font-size: 14px;
}

.mode-button {
display: flex;
align-items: center;
gap: 5px;
padding: 8px 16px;
border: none;
border-radius: 20px;
font-size: 14px;
cursor: pointer;
background-color: #4a90e2;
color: white;
transition: background-color 0.3s ease;
}

.mode-button:hover {
background-color: #357abd;
}

.search-container {
display: flex;
align-items: center;
gap: 8px;
padding: 8px 12px;
border: 1px solid #ddd;
border-radius: 6px;
background-color: white;
width: 300px;
}

.search-input {
border: none;
outline: none;
width: 100%;
font-size: 14px;
}

.waste-main {
display: grid;
grid-template-columns: 1fr 2fr;
gap: 20px;
}

.waste-log-section {
background-color: white;
border-radius: 8px;
padding: 20px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
font-size: 20px;
color: #4a90e2;
margin-bottom: 20px;
padding-bottom: 10px;
border-bottom: 2px solid #f0f0f0;
}

.empty-log {
text-align: center;
color: #666;
font-style: italic;
margin: 20px 0;
}

.waste-items {
list-style: none;
padding: 0;
margin: 0;
}

.waste-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 10px 0;
border-bottom: 1px solid #f0f0f0;
}

.item-controls {
display: flex;
align-items: center;
gap: 8px;
}

.quantity-button {
background: none;
border: none;
color: #4a90e2;
cursor: pointer;
padding: 4px;
border-radius: 4px;
display: flex;
align-items: center;
justify-content: center;
}

.remove-button {
background: none;
border: none;
color: #dc3545;
cursor: pointer;
padding: 4px;
border-radius: 4px;
display: flex;
align-items: center;
justify-content: center;
}

.item-quantity {
font-weight: bold;
min-width: 60px;
text-align: center;
}

.item-category {
font-size: 12px;
color: #666;
margin-left: 5px;
}

.log-details {
margin-top: 20px;
padding: 15px;
background-color: #f8f9fa;
border-radius: 8px;
}

.form-group {
margin-bottom: 15px;
}

.form-group label {
display: block;
margin-bottom: 5px;
font-size: 14px;
color: #495057;
}

.form-textarea {
width: 100%;
padding: 8px;
border: 1px solid #ddd;
border-radius: 4px;
font-size: 14px;
resize: vertical;
min-height: 80px;
font-family: inherit;
}

.log-total {
display: flex;
justify-content: space-between;
font-weight: bold;
margin: 20px 0;
padding: 15px;
background-color: #f8f9fa;
border-radius: 8px;
}
.submit-log-button,
.nav-button {
width: 100%;
padding: 12px;
margin-top: 10px;
border: none;
border-radius: 4px;
font-size: 16px;
font-weight: bold;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
transition: background-color 0.3s ease;
}

.submit-log-button {
background-color: #28a745;
color: white;
}

.submit-log-button:hover {
background-color: #218838;
}

.submit-log-button:disabled {
background-color: #ccc;
cursor: not-allowed;
}

.nav-button {
background-color: #4a90e2;
color: white;
text-decoration: none;
}

.nav-button:hover {
background-color: #357abd;
}

.waste-menu-section {
background-color: white;
border-radius: 8px;
padding: 20px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-filters {
display: flex;
flex-wrap: wrap;
gap: 10px;
margin-bottom: 20px;
}

.category-button {
padding: 8px 16px;
border: none;
border-radius: 20px;
background-color: #f0f0f0;
color: #495057;
cursor: pointer;
transition: all 0.3s ease;
}

.category-button:hover {
background-color: #e2e6ea;
}

.category-button.active {
background-color: #4a90e2;
color: white;
}

.category-section {
margin-bottom: 30px;
}

.category-title {
font-size: 18px;
color: #495057;
margin-bottom: 15px;
}

.items-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
gap: 15px;
}

.waste-menu-item {
display: flex;
flex-direction: column;
align-items: center;
padding: 15px;
border: 1px solid #ddd;
border-radius: 8px;
background-color: white;
cursor: pointer;
transition: all 0.3s ease;
}

.waste-menu-item:hover {
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-icon {
color: #4a90e2;
margin-bottom: 10px;
}

.item-name {
font-size: 14px;
font-weight: bold;
text-align: center;
margin: 0;
}

.item-details {
font-size: 12px;
color: #666;
margin: 5px 0 0;
}

.notification {
position: fixed;
bottom: 20px;
right: 20px;
padding: 12px 20px;
border-radius: 4px;
display: flex;
align-items: center;
gap: 10px;
color: white;
animation: slideIn 0.3s ease-out;
z-index: 1000;
}

.notification.success {
background-color: #28a745;
}

.notification.error {
background-color: #dc3545;
}

@keyframes slideIn {
from {
transform: translateY(100%);
opacity: 0;
}
to {
transform: translateY(0);
opacity: 1;
}
}

.dark-mode {
--background-color: #1a1a1a;
--text-color: #f0f0f0;
--border-color: #444;
}

.dark-mode .waste-container {
background-color: var(--background-color);
color: var(--text-color);
}

.dark-mode .waste-header,
.dark-mode .waste-log-section,
.dark-mode .waste-menu-section,
.dark-mode .waste-menu-item {
background-color: #2c2c2c;
border-color: var(--border-color);
}

.dark-mode .search-container {
background-color: #3c3c3c;
border-color: #444;
}

.dark-mode .search-input {
background-color: #3c3c3c;
color: var(--text-color);
}

.dark-mode .category-button {
background-color: #3c3c3c;
color: var(--text-color);
}

.dark-mode .category-button.active {
background-color: #4a90e2;
color: white;
}

.dark-mode .log-details {
background-color: #3c3c3c;
}

.dark-mode .form-textarea {
background-color: #2c2c2c;
border-color: #444;
color: var(--text-color);
}

.dark-mode .item-category {
color: #aaa;
}

.dark-mode .item-details {
color: #aaa;
}

.dark-mode .waste-item {
border-color: #444;
}

.dark-mode .quantity-button {
color: #4a90e2;
}

.dark-mode .remove-button {
color: #ff6b6b;
}

.dark-mode .log-total {
background-color: #3c3c3c;
}

@media (max-width: 1024px) {
.waste-container {
padding: 10px;
}

.waste-main {
grid-template-columns: 1fr;
}
}

@media (max-width: 768px) {
.waste-header {
flex-direction: column;
gap: 10px;
}

.header-left,
.header-right {
width: 100%;
justify-content: space-between;
}

.search-container {
width: 100%;
}

.waste-menu-section {
margin-top: 20px;
}

.items-grid {
grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.category-filters {
overflow-x: auto;
padding-bottom: 10px;
-webkit-overflow-scrolling: touch;
}

.category-button {
white-space: nowrap;
}
}

@media (max-width: 480px) {
.items-grid {
grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.waste-menu-item {
padding: 10px;
}

.item-name {
font-size: 12px;
}

.notification {
width: 90%;
left: 5%;
right: 5%;
}
}

@media print {
.waste-container {
background: white;
}

.waste-header,
.waste-menu-section,
.submit-log-button,
.nav-button {
display: none;
}

.waste-log-section {
width: 100%;
box-shadow: none;
}

.notification {
display: none;
}
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
.pb-safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Mobile viewport height fix for iOS */
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}

/* Prevent content shift when scrollbar appears */
html {
  width: 100vw;
  overflow-x: hidden;
}

/* Smooth scrolling for iOS */
body {
  -webkit-overflow-scrolling: touch;
}

.pb-safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Mobile viewport height fix for iOS */
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}

/* Prevent content shift when scrollbar appears */
html {
  width: 100vw;
  overflow-x: hidden;
}

/* Smooth scrolling for iOS */
body {
  -webkit-overflow-scrolling: touch;
}



.page-title {
  font-size: 28px;
  color: #4a90e2;
  margin-bottom: 20px;
  text-align: center;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";

 
export const metadata: Metadata = {
  title: "BUF BARISTA CRM",
  description: "A CRM solution for managing contacts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/page.tsx
import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"

export default function LandingPage() {
  return (
    <>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">Buf Barista CRM</span>
            </Link>
          </div>
          <nav className="hidden gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Pricing Section */}
        <Pricing />

        {/* CTA Section */}
        <section className="border-t bg-muted/50">
          <div className="container py-20 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to transform your coffee shop?</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground">
              Join thousands of coffee shops already using our platform to grow their business.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/register">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              <span className="text-lg font-bold">Buf Barista</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Making coffee shop management easier and more efficient.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About</Link></li>
              <li><Link href="#" className="hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Buf Barista. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/auth/auth-provider.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Define form schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      // Handling the error, but not capturing it in a variable.
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/auth/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      toast({
        title: "Success",
        description: "Registration successful. Please sign in.",
      });

      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  disabled={isLoading}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  type="email"
                  disabled={isLoading}
                  placeholder="john@example.com"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  type="password"
                  disabled={isLoading}
                  placeholder="********"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  type="password"
                  disabled={isLoading}
                  placeholder="********"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/auth/user-button.tsx
"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/activity/activity-feed.tsx
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ActivityIcon } from "./activity-icon";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityMetadata {
  [key: string]: unknown; // You can be more specific about the key-value pairs as your app grows
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata: ActivityMetadata; // Updated metadata type
}

interface ActivityFeedProps {
  contactId: string;
}

export function ActivityFeed({ contactId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(`/api/contacts/${contactId}/activities`);
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [contactId]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 text-sm">
            <ActivityIcon type={activity.type} />
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500">No activity yet</p>
        )}
      </div>
    </ScrollArea>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/activity/activity-icon.tsx
import { MessageSquare, Mail, Star, AlertCircle, Edit, Trash } from "lucide-react";

const iconMap = {
  NOTE_ADDED: MessageSquare,
  EMAIL_SENT: Mail,
  STATUS_CHANGE: Star,
  CONTACT_CREATED: Edit,
  CONTACT_UPDATED: Edit,
  CONTACT_DELETED: Trash,
  DEFAULT: AlertCircle,
};

interface ActivityIconProps {
  type: keyof typeof iconMap | string;
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const Icon = iconMap[type as keyof typeof iconMap] || iconMap.DEFAULT;
  return <Icon className={className || "h-5 w-5 text-gray-400"} />;
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/bulk-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkActionsProps {
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkActions({ selectedIds, onSuccess }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} contacts`,
      });
      onSuccess();
    } catch (error: unknown) { // Capture error and handle it if necessary
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
      console.error("Failed to update contacts:", error); // Logging the error
    } finally {
      setLoading(false);
    }
  };

  const deleteContacts = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: "DELETE",
          })
        )
      );

      toast({
        title: "Success",
        description: `Deleted ${selectedIds.length} contacts`,
      });
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error: unknown) { // Capture error and handle it if necessary
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
      console.error("Failed to delete contacts:", error); // Logging the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => updateStatus("active")}>
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus("inactive")}>
            Deactivate
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contacts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} contacts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteContacts} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/contact-details.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Contact } from "@/types/contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusSelect } from "@/components/contacts/status-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash } from "lucide-react";

interface ContactDetailsProps {
  initialData: Contact;
}

export function ContactDetails({ initialData }: ContactDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/contacts/${initialData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Contact status updated",
      });

      router.refresh();
    } catch (error) {
      console.error(error); // Log the error for debugging
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/contacts/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      toast({
        title: "Success",
        description: "Contact deleted",
      });

      router.push("/dashboard/contacts");
      router.refresh();
    } catch (error) {
      console.error(error); // Log the error for debugging
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {initialData.firstName} {initialData.lastName}
          </h1>
          <p className="text-muted-foreground">{initialData.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusSelect value={initialData.status} onChange={onStatusChange} />
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Contact</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this contact? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Company</h3>
              <p className="text-muted-foreground">{initialData.company || "Not specified"}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-muted-foreground">{initialData.phone || "Not specified"}</p>
            </div>
            <div>
              <h3 className="font-medium">Notes</h3>
              <p className="text-muted-foreground">{initialData.notes || "No notes"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">No recent activity</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/contact-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContactFormData } from "@/types/contacts";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export function ContactForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/login');
    },
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    },
  });

  async function onSubmit(data: ContactFormData) {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to create contacts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create contact");
      }

      toast({
        title: "Success",
        description: "Contact created successfully",
      });

      router.push("/dashboard/contacts");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contact",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/contacts"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to contacts
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Contact</CardTitle>
          <CardDescription>
            Add a new contact to your CRM. Fill in the required information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field} 
                          disabled={loading} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (555) 000-0000" 
                          {...field} 
                          disabled={loading} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Company name" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional - Enter the company name if applicable
                    </FormDescription>
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
                        rows={4} 
                        placeholder="Add any additional notes about this contact..."
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional - Add any relevant information about this contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => router.push('/dashboard/contacts')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Contact'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/contact-list.tsx
"use client";

import { useEffect, useState } from "react";
import { Contact } from "@/types/contacts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Mail,
  Pencil,
  Trash2,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ContactListProps {
  searchQuery?: string;
  statusFilter?: string;
  sortOrder?: string;
  page?: number;
}

const statusColors = {
  NEW: "blue",
  CONTACTED: "yellow",
  QUALIFIED: "green",
  CONVERTED: "purple",
  LOST: "red",
};

export function ContactList({
  searchQuery,
  statusFilter,
  sortOrder,
}: ContactListProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact;
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    async function fetchContacts() {
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("search", searchQuery);
        if (statusFilter) queryParams.set("status", statusFilter);
        if (sortOrder) queryParams.set("sort", sortOrder);

        const response = await fetch(`/api/contacts?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch contacts");

        const data: Contact[] = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [searchQuery, statusFilter, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((contact) => contact.id!));
    }
  };

  const toggleSelectContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSort = (key: keyof Contact) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getSortedContacts = () => {
    return [...contacts].sort((a, b) => {
      if (sortConfig.key && a[sortConfig.key] && b[sortConfig.key]) {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  };

  const handleDeleteContact = async (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      setContacts(contacts.filter(contact => contact.id !== contactToDelete));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedContacts.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
          <p className="text-sm">{selectedContacts.length} contact(s) selected</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Selected
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedContacts.length === contacts.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortConfig.key === "firstName" && (
                    sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {sortConfig.key === "createdAt" && (
                    sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedContacts().map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id!)}
                    onCheckedChange={() => toggleSelectContact(contact.id!)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {contact.firstName} {contact.lastName}
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.company || "-"}</TableCell>
                <TableCell>
                  <Badge color={statusColors[contact.status as keyof typeof statusColors]}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(contact.createdAt!), "MMM d, yyyy")}
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
                        <Link href={`/dashboard/contacts/${contact.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteContact(contact.id!)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No contacts found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first contact.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/contacts/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {contacts.length} of {contacts.length} contacts
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={true}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={true}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/data-export.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Contact } from "@/types/contacts";

interface DataExportProps {
  contacts: Contact[];
}

export function DataExport({ contacts }: DataExportProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    try {
      // Create CSV headers
      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Company",
        "Status",
        "Notes",
        "Created At",
      ].join(",");

      // Create CSV rows
      const rows = contacts.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone || "",
        contact.company || "",
        contact.status,
        (contact.notes || "").replace(/,/g, ";"), // Replace commas in notes
        new Date(contact.createdAt!).toISOString(),
      ].join(","));

      // Combine headers and rows
      const csv = [headers, ...rows].join("\n");

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCSV}
      disabled={exporting || contacts.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? "Exporting..." : "Export"}
    </Button>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/data-table-loading.tsx
export function DataTableLoading() {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 rounded-md border p-4"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-[250px] animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-[200px] animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/search.tsx
// src/components/contacts/search.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debouncedValue = useDebounce(value, 500);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const queryString = createQueryString({
      search: debouncedValue || null,
    });

    router.push(`${pathname}?${queryString}`);
  }, [debouncedValue, router, pathname, createQueryString]);

  return (
    <div className="relative w-full md:w-[300px]">
      <SearchIcon
        className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
      />
      <Input
        placeholder="Search contacts..."
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="pl-8 pr-8"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 py-0"
          onClick={() => setValue("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/contacts/status-select.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/analytics/contact-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/contacts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ContactChartProps {
  contacts: Contact[];
}

export function ContactChart({ contacts }: ContactChartProps) {
  const statusCounts = contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Contact Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/analytics/overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types/contacts";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface AnalyticsOverviewProps {
  contacts: Contact[];
}

export function AnalyticsOverview({ contacts }: AnalyticsOverviewProps) {
  const totalContacts = contacts.length;
  const qualifiedContacts = contacts.filter(c => c.status === 'QUALIFIED').length;
  const convertedContacts = contacts.filter(c => c.status === 'CONVERTED').length;
  const conversionRate = totalContacts ? ((convertedContacts / totalContacts) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: "Total Contacts",
      value: totalContacts,
      icon: Users,
      description: "Total contacts in database",
    },
    {
      title: "Qualified Leads",
      value: qualifiedContacts,
      icon: UserCheck,
      description: "Contacts marked as qualified",
    },
    {
      title: "Converted",
      value: convertedContacts,
      icon: UserX,
      description: "Successfully converted contacts",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      description: "Overall conversion rate",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/date-range.tsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 20),
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/navigation/mobile-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/dashboard/contacts",
    color: "text-violet-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-pink-500",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="w-full pt-10">
        <nav className="flex flex-col gap-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                pathname === route.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/navigation/side-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Settings,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Coffee,
} from "lucide-react";

import { 
  FaChartLine as SalesIcon,
  FaCashRegister as PosIcon,
  FaClipboardList as OrdersIcon,
  FaTrash as WasteIcon,
  FaBoxes as InventoryIcon,
} from "react-icons/fa"; 

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500"
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/dashboard/contacts",
    color: "text-violet-500"
  },
  {
    label: "Reports",
    icon: SalesIcon,
    href: "/dashboard/sales",
    color: "text-red-500"
  },
  {
    label: "POS",
    icon: PosIcon,
    href: "/dashboard/pos",
    color: "text-blue-500"
  },
  {
    label: "Orders",
    icon: OrdersIcon,
    href: "/dashboard/order",
    color: "text-green-500"
  },
  {
    label: "Waste",
    icon: WasteIcon,
    href: "/dashboard/waste",
    color: "text-yellow-500"
  },
  {
    label: "Inventory",
    icon: InventoryIcon,
    href: "/dashboard/inventory",
    color: "text-purple-500"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-orange-500"
  }
];

export function SideNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 z-50 flex h-full flex-col bg-background border-r",
        isCollapsed ? "w-[50px]" : "w-48",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex h-14 items-center justify-between px-2 border-b">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <span className="font-bold text-sm">BUF BARISTA</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn("", isCollapsed ? "ml-0" : "ml-auto")}
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <div className="p-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/contacts/new">
                  <Button size="icon" className="w-full">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                New Contact
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/dashboard/contacts/new">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              isCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <route.icon className={cn("h-4 w-4", route.color)} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {route.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                  {route.label}
                </Link>
              )
            ))}
          </div>
        </ScrollArea>
      </TooltipProvider>
    </aside>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/navigation/top-nav.tsx
"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { UserButton } from "@/components/auth/user-button";

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/dashboard" className="flex items-center gap-2">
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </div>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/overview.tsx
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Jan",
    total: 0,
  },
  {
    name: "Feb",
    total: 0,
  },
  {
    name: "Mar",
    total: 0,
  },
  {
    name: "Apr",
    total: 0,
  },
  {
    name: "May",
    total: 0,
  },
  {
    name: "Jun",
    total: 0,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/download-utils.ts
import html2canvas from 'html2canvas';
import { generateUUID } from '@/lib/generate-uuid';

export const downloadQRCode = async (
  qrRef: HTMLDivElement | null,
  format: 'svg' | 'png',
  filename: string = 'qr-code'
) => {
  return new Promise(async (resolve, reject) => {
    if (!qrRef) {
      reject(new Error('QR code reference not found'));
      return;
    }

    try {
      const uuid = generateUUID();
      const fullFilename = `${filename}-${uuid}`;
      
      // Get the container with all styles
      const container = qrRef;
      
      if (format === 'png') {
        // For PNG, capture the entire styled container
        const canvas = await html2canvas(container as HTMLElement, {
          scale: 3,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: () => {
            // Any additional processing of cloned document if needed
            console.log('Cloned document ready for capture');
          }
        });

        const link = document.createElement('a');
        link.download = `${fullFilename}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve(true);
      } else {
        // For SVG, create a new SVG containing both QR code and styling
        const canvas = container.querySelector('canvas');
        if (!canvas) {
          throw new Error('Canvas element not found');
        }

        // Get the canvas data
        const canvasData = canvas.toDataURL('image/png');
        
        // Create a new SVG
        let svgString = `
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="${canvas.width}" 
            height="${canvas.height}"
            viewBox="0 0 ${canvas.width} ${canvas.height}"
          >
            <style>
              .qr-wrapper {
                width: 100%;
                height: 100%;
              }
              .qr-image {
                width: 100%;
                height: 100%;
                image-rendering: pixelated;
              }
            </style>
            <g class="qr-wrapper">
              <image 
                class="qr-image"
                width="100%" 
                height="100%" 
                href="${canvasData}"
                preserveAspectRatio="none"
              />
            </g>
        `;

        // Add logo if available
        const logoImg = container.querySelector('.logo-wrapper img') as HTMLImageElement;
        if (logoImg) {
          const logoStyles = window.getComputedStyle(logoImg);
          const logoWrapper = logoImg.parentElement;
          const wrapperStyles = logoWrapper ? window.getComputedStyle(logoWrapper) : null;

          svgString += `
            <g class="logo-wrapper" transform="${wrapperStyles?.transform || ''}">
              <image
                x="${wrapperStyles?.left || '0'}"
                y="${wrapperStyles?.top || '0'}"
                width="${logoStyles.width}"
                height="${logoStyles.height}"
                style="
                  opacity: ${logoStyles.opacity};
                  mix-blend-mode: ${logoStyles.mixBlendMode};
                  filter: ${logoStyles.filter};
                  border-radius: ${logoStyles.borderRadius};
                  ${logoStyles.backgroundColor !== 'transparent' ? `background-color: ${logoStyles.backgroundColor};` : ''}
                "
                href="${logoImg.src}"
              />
            </g>
          `;
        }

        svgString += '</svg>';

        // Create and download the SVG file
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = `${fullFilename}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
        resolve(true);
      }
    } catch (error) {
      console.error('Download processing error:', error);
      reject(error);
    }
  });
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/index.ts
export * from './qr-designer'
export * from './types'

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/logo-controls.tsx
"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ChromePicker } from 'react-color'
import { LogoControlsProps, LogoPosition, BlendMode } from './types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
]

const BLEND_MODES: BlendMode[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion'
]

export function LogoControls({
  value,
  onChange,
  logoWidth,
  logoHeight,
  onLogoSizeChange,
  maintainAspectRatio,
  onAspectRatioChange,
  originalAspectRatio,
}: LogoControlsProps) {
  const [showBorderColor, setShowBorderColor] = useState(false)
  const [showShadowColor, setShowShadowColor] = useState(false)

  const updateStyle = (updates: Partial<typeof value>) => {
    onChange({
      ...value,
      ...updates,
      // Ensure numeric values are properly converted
      rotation: typeof updates.rotation === 'number' ? updates.rotation : value.rotation,
      blurRadius: typeof updates.blurRadius === 'number' ? updates.blurRadius : value.blurRadius,
      brightness: typeof updates.brightness === 'number' ? updates.brightness : value.brightness,
      contrast: typeof updates.contrast === 'number' ? updates.contrast : value.contrast,
      opacity: typeof updates.opacity === 'number' ? updates.opacity : value.opacity,
      borderWidth: typeof updates.borderWidth === 'number' ? updates.borderWidth : value.borderWidth,
      borderRadius: typeof updates.borderRadius === 'number' ? updates.borderRadius : value.borderRadius,
      shadowBlur: typeof updates.shadowBlur === 'number' ? updates.shadowBlur : value.shadowBlur,
      shadowOffsetX: typeof updates.shadowOffsetX === 'number' ? updates.shadowOffsetX : value.shadowOffsetX,
      shadowOffsetY: typeof updates.shadowOffsetY === 'number' ? updates.shadowOffsetY : value.shadowOffsetY,
    })
  }

  return (
    <Accordion type="single" collapsible defaultValue="size" className="w-full">
      <AccordionItem value="size">
        <AccordionTrigger>Size & Position</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Maintain Aspect Ratio</Label>
              <Switch
                checked={maintainAspectRatio}
                onCheckedChange={onAspectRatioChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Width: {logoWidth}px</Label>
              <Slider
                value={[logoWidth]}
                min={20}
                max={300}
                step={1}
                onValueChange={([width]) => {
                  if (maintainAspectRatio) {
                    const height = Math.round(width / originalAspectRatio)
                    onLogoSizeChange(width, height)
                  } else {
                    onLogoSizeChange(width, logoHeight)
                  }
                }}
              />
            </div>

            {!maintainAspectRatio && (
              <div className="space-y-2">
                <Label>Height: {logoHeight}px</Label>
                <Slider
                  value={[logoHeight]}
                  min={20}
                  max={300}
                  step={1}
                  onValueChange={([height]) => onLogoSizeChange(logoWidth, height)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Position</Label>
              <Select 
                value={value.position}
                onValueChange={(v) => updateStyle({ position: v as LogoPosition })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOGO_POSITIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rotation: {value.rotation}°</Label>
              <Slider
                value={[value.rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => updateStyle({ rotation: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="effects">
        <AccordionTrigger>Effects</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opacity: {value.opacity}%</Label>
              <Slider
                value={[value.opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateStyle({ opacity: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Blur: {value.blurRadius}px</Label>
              <Slider
                value={[value.blurRadius]}
                min={0}
                max={20}
                step={0.5}
                onValueChange={([v]) => updateStyle({ blurRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Brightness: {value.brightness}%</Label>
              <Slider
                value={[value.brightness]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ brightness: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Contrast: {value.contrast}%</Label>
              <Slider
                value={[value.contrast]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ contrast: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="border">
        <AccordionTrigger>Border</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Border Width: {value.borderWidth}px</Label>
              <Slider
                value={[value.borderWidth]}
                min={0}
                max={20}
                step={1}
                onValueChange={([v]) => updateStyle({ borderWidth: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Radius: {value.borderRadius}px</Label>
              <Slider
                value={[value.borderRadius]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ borderRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Color</Label>
              <div className="relative">
                <div
                  className="w-full h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.borderColor }}
                  onClick={() => setShowBorderColor(!showBorderColor)}
                />
                {showBorderColor && (
                  <div className="absolute z-10">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowBorderColor(false)} 
                    />
                    <ChromePicker
                      color={value.borderColor}
                      onChange={(color) => updateStyle({ borderColor: color.hex })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shadow">
        <AccordionTrigger>Shadow</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shadow Color</Label>
              <div className="relative">
                <div
                  className="w-full h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.shadowColor }}
                  onClick={() => setShowShadowColor(!showShadowColor)}
                />
                {showShadowColor && (
                  <div className="absolute z-10">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowShadowColor(false)} 
                    />
                    <ChromePicker
                      color={value.shadowColor}
                      onChange={(color) => updateStyle({ shadowColor: color.hex })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shadow Blur: {value.shadowBlur}px</Label>
              <Slider
                value={[value.shadowBlur]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowBlur: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Shadow Offset X: {value.shadowOffsetX}px</Label>
              <Slider
                value={[value.shadowOffsetX]}
                min={-50}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowOffsetX: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Shadow Offset Y: {value.shadowOffsetY}px</Label>
              <Slider
                value={[value.shadowOffsetY]}
                min={-50}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowOffsetY: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="blend">
        <AccordionTrigger>Blend Mode</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Blending</Label>
              <Switch
                checked={value.blend}
                onCheckedChange={(checked) => updateStyle({ blend: checked })}
              />
            </div>

            {value.blend && (
              <div className="space-y-2">
                <Label>Blend Mode</Label>
                <Select
                  value={value.blendMode}
                  onValueChange={(v) => updateStyle({ blendMode: v as BlendMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLEND_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/qr-designer.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { QRCode } from './qr-wrapper'
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ChromePicker } from 'react-color'
import { StyleControls } from './style-controls'
import { LogoControls } from './logo-controls'
import { QRDownloadButton } from './qr-download-button'
import { 
  QRDesignerProps, 
  QRDotType, 
  DEFAULT_CONFIG,
  QRDesignerConfig
} from './types'
import { toast } from '@/components/ui/use-toast'
import {  Grid } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import styles from './styles.module.css'

export function QRDesigner({ 
  value, 
  onConfigChange, 
  defaultConfig, 
  className 
}: QRDesignerProps) {
  const [config, setConfig] = useState<QRDesignerConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...defaultConfig,
  }))
  const [showFgPicker, setShowFgPicker] = useState(false)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [showLogoBgPicker, setShowLogoBgPicker] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onConfigChange?.(config)
  }, [config, onConfigChange])

  // Initialize logo style when a logo is added
  useEffect(() => {
    if (config.logoImage && !config.logoStyle) {
      setConfig(prev => ({
        ...prev,
        logoStyle: {
          ...DEFAULT_CONFIG.logoStyle,
          rotation: 0,
          blurRadius: 0,
          brightness: 100,
          contrast: 100,
          opacity: 100,
          borderWidth: 0,
          borderRadius: 0,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          backgroundColor: 'transparent',
          removeBackground: true,
          blend: false,
          blendMode: 'normal',
          position: 'center',
          scale: 1,
        }
      }))
    }
  }, [config.logoImage])

  const generateFilterString = () => {
    const filters = []
    if (config.style.blurRadius) filters.push(`blur(${config.style.blurRadius}px)`)
    if (config.style.brightness !== 100) filters.push(`brightness(${config.style.brightness}%)`)
    if (config.style.contrast !== 100) filters.push(`contrast(${config.style.contrast}%)`)
    if (config.style.opacity !== 100) filters.push(`opacity(${config.style.opacity}%)`)
    return filters.join(' ')
  } 

  const generateBackground = () => {
    if (config.style.gradientType === 'linear') {
      return `linear-gradient(${config.style.gradientRotation}deg, ${config.style.gradientStart}, ${config.style.gradientEnd})`
    }
    if (config.style.gradientType === 'radial') {
      return `radial-gradient(circle, ${config.style.gradientStart}, ${config.style.gradientEnd})`
    }
    return config.backgroundColor
  }

  const getQrStyles = () => ({
    filter: generateFilterString(),
    background: generateBackground(),
    borderRadius: `${config.style.borderRadius}px`,
    border: config.style.borderWidth ? `${config.style.borderWidth}px solid ${config.style.borderColor}` : undefined,
    boxShadow: config.style.shadowBlur ? 
      `${config.style.shadowOffsetX}px ${config.style.shadowOffsetY}px ${config.style.shadowBlur}px ${config.style.shadowColor}` : 
      undefined,
    mixBlendMode: config.style.blend ? config.style.blendMode : undefined,
    padding: `${config.style.padding}px`,
    transform: `scale(${previewScale})`,
    transformOrigin: 'center',
    transition: 'all 0.3s ease',
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Logo image must be smaller than 2MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.width / img.height
          setOriginalAspectRatio(aspectRatio)
          const defaultSize = 100
          setConfig(prev => ({
            ...prev,
            logoImage: reader.result as string,
            logoWidth: defaultSize,
            logoHeight: maintainAspectRatio ? Math.round(defaultSize / aspectRatio) : defaultSize,
          }))
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className={styles.preview} style={{ background: config.backgroundColor }}>
                {showGrid && <div className={styles.grid} />}
                <div ref={qrRef} className={styles.wrapper} style={getQrStyles()}>
                <QRCode
                  value={value}
                  size={config.size}
                  bgColor={config.backgroundColor}
                  fgColor={config.foregroundColor}
                  level={config.errorCorrectionLevel}
                  logoImage={config.logoImage}
                  logoWidth={config.logoWidth}
                  logoHeight={config.logoHeight}
                  logoStyle={config.logoStyle}
                  imageStyle={{ display: "block" }}
/>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <QRDownloadButton qrRef={qrRef} format="svg" />
            <QRDownloadButton qrRef={qrRef} format="png" />
            <Button variant="outline" onClick={() => setShowGrid(!showGrid)}>
              <Grid className="mr-2 h-4 w-4" />
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview Scale: {Math.round(previewScale * 100)}%</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewScale(1)}
              >
                Reset
              </Button>
            </div>
            <Slider
              value={[previewScale]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={([value]) => setPreviewScale(value)}
            />
          </div>
        </div>

        <Tabs defaultValue="style" className="space-y-4">
          <TabsList>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="style">
            <StyleControls
              value={config.style}
              onChange={(style) => {
                setConfig(prev => ({ ...prev, style }))
              }}
            />
          </TabsContent>

          <TabsContent value="logo">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {config.logoImage && (
                    <Button 
                      variant="outline"
                      onClick={() => setConfig(prev => ({ ...prev, logoImage: undefined }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {config.logoImage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Remove Background</Label>
                    <Switch
                      checked={config.logoStyle?.removeBackground}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({
                          ...prev,
                          logoStyle: {
                            ...prev.logoStyle,
                            removeBackground: checked,
                          }
                        }))
                      }}
                    />
                  </div>

                  {!config.logoStyle?.removeBackground && (
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="relative">
                        <div
                          className="h-10 rounded-md border cursor-pointer"
                          style={{ backgroundColor: config.logoStyle?.backgroundColor }}
                          onClick={() => setShowLogoBgPicker(!showLogoBgPicker)}
                        />
                        {showLogoBgPicker && (
                          <div className="absolute z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowLogoBgPicker(false)}
                            />
                            <ChromePicker
                              color={config.logoStyle?.backgroundColor}
                              onChange={color => {
                                setConfig(prev => ({
                                  ...prev,
                                  logoStyle: {
                                    ...prev.logoStyle,
                                    backgroundColor: color.hex,
                                  }
                                }))
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <LogoControls
                    value={config.logoStyle}
                    onChange={(logoStyle) => {
                      setConfig(prev => ({ ...prev, logoStyle }))
                    }}
                    logoWidth={config.logoWidth}
                    logoHeight={config.logoHeight}
                    onLogoSizeChange={(width, height) => {
                      setConfig(prev => ({
                        ...prev,
                        logoWidth: width,
                        logoHeight: height
                      }))
                    }}
                    maintainAspectRatio={maintainAspectRatio}
                    onAspectRatioChange={setMaintainAspectRatio}
                    originalAspectRatio={originalAspectRatio}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Foreground Color</Label>
                <div className="relative">
                  <div
                    className="h-10 rounded-md border cursor-pointer"
                    style={{ backgroundColor: config.foregroundColor }}
                    onClick={() => setShowFgPicker(!showFgPicker)}
                  />
                  {showFgPicker && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowFgPicker(false)}
                      />
                      <div className="absolute z-10">
                        <ChromePicker
                          color={config.foregroundColor}
                          onChange={color => 
                            setConfig(prev => ({ 
                              ...prev, 
                              foregroundColor: color.hex 
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="relative">
                  <div
                    className="h-10 rounded-md border cursor-pointer"
                    style={{ backgroundColor: config.backgroundColor }}
                    onClick={() => setShowBgPicker(!showBgPicker)}
                  />
                  {showBgPicker && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowBgPicker(false)}
                      />
                      <div className="absolute z-10">
                        <ChromePicker
                          color={config.backgroundColor}
                          onChange={color => 
                            setConfig(prev => ({ 
                              ...prev, 
                              backgroundColor: color.hex 
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>QR Code Size: {config.size}px</Label>
                <Slider
                  value={[config.size]}
                  min={100}
                  max={1000}
                  step={10}
                  onValueChange={([value]) => 
                    setConfig(prev => ({ ...prev, size: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Error Correction Level</Label>
                <Select
                  value={config.errorCorrectionLevel}
                  onValueChange={(value: QRDesignerConfig["errorCorrectionLevel"]) =>
                    setConfig(prev => ({ 
                      ...prev, 
                      errorCorrectionLevel: value 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
              <Label>Margin: {config.style.padding}px</Label>
                <Slider
                  value={[config.style.padding]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([value]) => 
                    setConfig(prev => ({
                      ...prev,
                      style: { ...prev.style, padding: value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Quality</Label>
                <Select
                  value={config.dotStyle}
                  onValueChange={(value: QRDotType) => 
                    setConfig(prev => ({ 
                      ...prev, 
                      dotStyle: value 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="squares">Squares</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="classy">Classy</SelectItem>
                    <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                    <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/qr-download-button.tsx
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from 'html2canvas'
import { toast } from "@/components/ui/use-toast"

interface QRDownloadButtonProps {
  qrRef: React.RefObject<HTMLDivElement>
  format: 'svg' | 'png'
}

export function QRDownloadButton({ qrRef, format }: QRDownloadButtonProps) {
  const downloadQRCode = async () => {
    if (!qrRef.current) return

    try {
      if (format === 'svg') {
        // Download as SVG
        const svg = qrRef.current.querySelector('svg')
        if (!svg) throw new Error('SVG element not found')

        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)

        const link = document.createElement('a')
        link.href = svgUrl
        link.download = `qr-code-${Date.now()}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(svgUrl)
      } else {
        // Download as PNG
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: null,
          scale: 4,
          logging: false,
          useCORS: true,
          allowTaint: true,
        })

        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `qr-code-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast({
        title: 'Success',
        description: `QR code downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button variant="outline" onClick={downloadQRCode}>
      <Download className="mr-2 h-4 w-4" />
      Download {format.toUpperCase()}
    </Button>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/qr-wrapper.tsx
"use client"

import { QRCodeCanvas } from 'qrcode.react'
import { forwardRef } from 'react'
import { cn } from "@/lib/utils"
import { QRWrapperProps } from './types'
import Image from 'next/image'
export const QRCode = forwardRef<HTMLDivElement, QRWrapperProps>((props, ref) => {
  const {
    className,
    containerStyle,
    imageStyle,
    logoImage,
    logoWidth,
    logoHeight,
    logoStyle,
    ...qrProps
  } = props
  
  const getLogoFilterString = () => {
    const filters = []
    if (logoStyle?.blurRadius) filters.push(`blur(${logoStyle.blurRadius}px)`)
    if (logoStyle?.brightness !== 100) filters.push(`brightness(${logoStyle.brightness}%)`)
    if (logoStyle?.contrast !== 100) filters.push(`contrast(${logoStyle.contrast}%)`)
    return filters.join(' ')
  }

  const getLogoShadow = () => {
    if (logoStyle?.shadowBlur) {
      return `${logoStyle.shadowOffsetX}px ${logoStyle.shadowOffsetY}px ${logoStyle.shadowBlur}px ${logoStyle.shadowColor}`
    }
    return 'none'
  }
  
  return (
    <div 
      ref={ref}
      className={cn("relative", className)}
      style={{
        width: props.size,
        height: props.size,
        ...containerStyle
      }}
    >
      <QRCodeCanvas
        {...qrProps}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          ...imageStyle
        }}
      />
      {logoImage && (
        <div
          className="logo-wrapper absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${logoStyle?.rotation || 0}deg)`,
            width: logoWidth,
            height: logoHeight,
            zIndex: logoStyle?.blend ? 1 : 2,
          }}
        >
          <Image
            src={logoImage}
            alt="Logo"
            className="w-full h-full object-contain"
            style={{
              borderRadius: `${logoStyle?.borderRadius || 0}px`,
              border: logoStyle?.borderWidth ? 
                `${logoStyle.borderWidth}px solid ${logoStyle.borderColor}` : 
                undefined,
              boxShadow: getLogoShadow(),
              filter: getLogoFilterString(),
              opacity: (logoStyle?.opacity || 100) / 100,
              mixBlendMode: logoStyle?.blend ? logoStyle.blendMode : 'normal',
              backgroundColor: logoStyle?.removeBackground ? 
                'transparent' : 
                logoStyle?.backgroundColor,
            }}
          />
        </div>
      )}
    </div>
  )
})

QRCode.displayName = 'QRCode'
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/style-controls.tsx
"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ChromePicker } from 'react-color'
import { StyleControlsProps, BlendMode } from './types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BLEND_MODES: BlendMode[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion'
]

export function StyleControls({ value, onChange }: StyleControlsProps) {
  const [showGradientStartPicker, setShowGradientStartPicker] = useState(false)
  const [showGradientEndPicker, setShowGradientEndPicker] = useState(false)
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false)
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false)

  const updateStyle = (updates: Partial<StyleControlsProps['value']>) => {
    onChange({ ...value, ...updates })
  }

  const handleClickOutside = () => {
    setShowGradientStartPicker(false)
    setShowGradientEndPicker(false)
    setShowShadowColorPicker(false)
    setShowBorderColorPicker(false)
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="basic">
        <AccordionTrigger>Basic Effects</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opacity: {value.opacity}%</Label>
              <Slider
                value={[value.opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateStyle({ opacity: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Blur: {value.blurRadius}px</Label>
              <Slider
                value={[value.blurRadius]}
                min={0}
                max={20}
                step={0.5}
                onValueChange={([v]) => updateStyle({ blurRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Brightness: {value.brightness}%</Label>
              <Slider
                value={[value.brightness]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ brightness: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Contrast: {value.contrast}%</Label>
              <Slider
                value={[value.contrast]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ contrast: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shadow">
        <AccordionTrigger>Shadow</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shadow Color</Label>
              <div className="relative">
                <div
                  className="h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.shadowColor }}
                  onClick={() => setShowShadowColorPicker(true)}
                />
                {showShadowColorPicker && (
                  <>
                    <div className="fixed inset-0" onClick={handleClickOutside} />
                    <div className="absolute z-10">
                      <ChromePicker
                        color={value.shadowColor}
                        onChange={color => updateStyle({ shadowColor: color.hex })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blur: {value.shadowBlur}px</Label>
              <Slider
                value={[value.shadowBlur]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowBlur: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offset X: {value.shadowOffsetX}px</Label>
                <Slider
                  value={[value.shadowOffsetX]}
                  min={-50}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateStyle({ shadowOffsetX: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>Offset Y: {value.shadowOffsetY}px</Label>
                <Slider
                  value={[value.shadowOffsetY]}
                  min={-50}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateStyle({ shadowOffsetY: v })}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="gradient">
        <AccordionTrigger>Gradient</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={value.gradientType}
                onValueChange={(v) => 
                  updateStyle({ 
                    gradientType: v as 'none' | 'linear' | 'radial' 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value.gradientType !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label>Start Color</Label>
                  <div className="relative">
                    <div
                      className="h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: value.gradientStart }}
                      onClick={() => setShowGradientStartPicker(true)}
                    />
                    {showGradientStartPicker && (
                      <>
                        <div className="fixed inset-0" onClick={handleClickOutside} />
                        <div className="absolute z-10">
                          <ChromePicker
                            color={value.gradientStart}
                            onChange={color => 
                              updateStyle({ gradientStart: color.hex })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Color</Label>
                  <div className="relative">
                    <div
                      className="h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: value.gradientEnd }}
                      onClick={() => setShowGradientEndPicker(true)}
                    />
                    {showGradientEndPicker && (
                      <>
                        <div className="fixed inset-0" onClick={handleClickOutside} />
                        <div className="absolute z-10">
                          <ChromePicker
                            color={value.gradientEnd}
                            onChange={color => 
                              updateStyle({ gradientEnd: color.hex })
                            }
                                                      />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {value.gradientType === 'linear' && (
                  <div className="space-y-2">
                    <Label>Angle: {value.gradientRotation}°</Label>
                    <Slider
                      value={[value.gradientRotation]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={([v]) => updateStyle({ gradientRotation: v })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="border">
        <AccordionTrigger>Border</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Width: {value.borderWidth}px</Label>
              <Slider
                value={[value.borderWidth]}
                min={0}
                max={20}
                step={1}
                onValueChange={([v]) => updateStyle({ borderWidth: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Radius: {value.borderRadius}px</Label>
              <Slider
                value={[value.borderRadius]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ borderRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="relative">
                <div
                  className="h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.borderColor }}
                  onClick={() => setShowBorderColorPicker(true)}
                />
                {showBorderColorPicker && (
                  <>
                    <div className="fixed inset-0" onClick={handleClickOutside} />
                    <div className="absolute z-10">
                      <ChromePicker
                        color={value.borderColor}
                        onChange={color => updateStyle({ borderColor: color.hex })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="blend">
        <AccordionTrigger>Blend Mode</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Blending</Label>
              <Switch
                checked={value.blend}
                onCheckedChange={(checked) => updateStyle({ blend: checked })}
              />
            </div>

            {value.blend && (
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select
                  value={value.blendMode}
                  onValueChange={(v) => updateStyle({ blendMode: v as BlendMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLEND_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/styles.module.css
.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  width: 100%;
  height: 100%;
}

.wrapper {
  position: relative;
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrCodeWrapper {
  position: relative;
  z-index: 1;
}

.qrCode {
  position: relative;
  z-index: 2;
  mix-blend-mode: multiply;
}

.logoWrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  pointer-events: none;
}

.logoImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
}

.previewGrid {
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.preview {
  position: relative;
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.controls {
  position: relative;
  z-index: 10;
}

.colorPicker {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;
  margin-top: 8px;
}

.colorPickerOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 19;
}

.blendPreview {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.blendPreview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, #eee 25%, transparent 25%),
    linear-gradient(-45deg, #eee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eee 75%),
    linear-gradient(-45deg, transparent 75%, #eee 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* Position variants for logo */
.logoPosition-center {
  top: 50%;
  left: 50%;
}

.logoPosition-topLeft {
  top: 0;
  left: 0;
  transform: translate(var(--logo-padding), var(--logo-padding));
}

.logoPosition-topRight {
  top: 0;
  right: 0;
  transform: translate(calc(-1 * var(--logo-padding)), var(--logo-padding));
}

.logoPosition-bottomLeft {
  bottom: 0;
  left: 0;
  transform: translate(var(--logo-padding), calc(-1 * var(--logo-padding)));
}

.logoPosition-bottomRight {
  bottom: 0;
  right: 0;
  transform: translate(calc(-1 * var(--logo-padding)), calc(-1 * var(--logo-padding)));
}

/* Animation classes */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.fadeIn {
  animation: fade-in 0.2s ease-out forwards;
}

.scaleIn {
  animation: scale-in 0.2s ease-out forwards;
}

/* Style control sections */
.styleSection {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--background);
  border: 1px solid var(--border);
  margin-bottom: 16px;
}

.styleSection:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .preview {
    min-height: 300px;
  }
  
  .controls {
    margin-top: 16px;
  }
}

/* Accessibility improvements */
.focusRing {
  outline: none;
  transition: box-shadow 0.2s ease;
}

.focusRing:focus-visible {
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}

/* Dark mode adjustments */
:global(.dark) .previewGrid {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
}

.logoWrapper {
  position: absolute;
  transition: all 0.3s ease;
}

.logoWrapper.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logoWrapper.top-left {
  top: 10%;
  left: 10%;
  transform: translate(-50%, -50%);
}

.logoWrapper.top-right {
  top: 10%;
  right: 10%;
  transform: translate(50%, -50%);
}

.logoWrapper.bottom-left {
  bottom: 10%;
  left: 10%;
  transform: translate(-50%, 50%);
}

.logoWrapper.bottom-right {
  bottom: 10%;
  right: 10%;
  transform: translate(50%, 50%);
}

.logoImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/designer/types.ts
export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten' 
  | 'color-dodge' 
  | 'color-burn' 
  | 'hard-light' 
  | 'soft-light' 
  | 'difference' 
  | 'exclusion'

export type LogoPosition = 
  | 'center' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right'

export interface QRStyleOptions {
  opacity: number
  blurRadius: number
  brightness: number
  contrast: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  gradientType: 'none' | 'linear' | 'radial'
  gradientStart: string
  gradientEnd: string
  gradientRotation: number
  padding: number
  blend: boolean
  blendMode: BlendMode
}

export interface LogoStyleOptions {
  opacity: number
  blurRadius: number
  brightness: number
  contrast: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  padding: number
  backgroundColor: string
  removeBackground: boolean
  position: LogoPosition
  rotation: number
  blend: boolean
  blendMode: BlendMode
  scale: number
}

export type QRDotType = 'squares' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRDesignerConfig {
  size: number
  backgroundColor: string
  foregroundColor: string
  logoImage?: string
  logoWidth: number
  logoHeight: number
  dotStyle: QRDotType
  margin: number
  errorCorrectionLevel: ErrorCorrectionLevel
  style: QRStyleOptions
  logoStyle: LogoStyleOptions
  imageRendering: 'auto' | 'crisp-edges' | 'pixelated'
}

export interface QRDesignerProps {
  value: string
  onConfigChange?: (config: QRDesignerConfig) => void
  defaultConfig?: Partial<QRDesignerConfig>
  className?: string
}

export interface StyleControlsProps {
  value: QRStyleOptions
  onChange: (value: QRStyleOptions) => void
  title?: string
}

export interface LogoControlsProps {
  value: LogoStyleOptions
  onChange: (value: LogoStyleOptions) => void
  logoWidth: number
  logoHeight: number
  onLogoSizeChange: (width: number, height: number) => void
  maintainAspectRatio: boolean
  onAspectRatioChange: (maintain: boolean) => void
  originalAspectRatio: number
}

export interface QRWrapperProps {
  value: string
  size: number
  bgColor: string
  fgColor: string
  level: ErrorCorrectionLevel
  logoImage?: string
  logoWidth?: number
  logoHeight?: number
  logoStyle?: LogoStyleOptions
  className?: string
  containerStyle?: React.CSSProperties
  imageStyle?: React.CSSProperties
}

export const DEFAULT_CONFIG: QRDesignerConfig = {
  size: 300,
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000',
  logoWidth: 100,
  logoHeight: 100,
  dotStyle: 'squares',
  margin: 20,
  errorCorrectionLevel: 'M',
  imageRendering: 'auto',
  style: {
    opacity: 100,
    blurRadius: 0,
    brightness: 100,
    contrast: 100,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    gradientType: 'none',
    gradientStart: '#000000',
    gradientEnd: '#FFFFFF',
    gradientRotation: 0,
    padding: 0,
    blend: false,
    blendMode: 'normal'
  },
  logoStyle: {
    opacity: 100,
    blurRadius: 0,
    brightness: 100,
    contrast: 100,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    padding: 0,
    backgroundColor: '#FFFFFF',
    removeBackground: false,
    position: 'center',
    rotation: 0,
    blend: false,
    blendMode: 'normal',
    scale: 1
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/device-rule-form.tsx
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"

// Define interfaces for our types
interface DeviceRule {
  id?: string
  deviceType: 'ALL' | 'MOBILE' | 'TABLET' | 'DESKTOP'
  targetUrl: string
  priority: number
  browsers: string[]
  os: string[]
}

interface DeviceRuleFormProps {
  qrCodeId?: string
  initialRules?: DeviceRule[]
  onChange?: (rules: DeviceRule[]) => void
}

export function DeviceRuleForm({ qrCodeId, initialRules, onChange }: DeviceRuleFormProps) {
  const [rules, setRules] = useState<DeviceRule[]>(initialRules || [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (qrCodeId) {
      fetchRules()
    } else {
      setLoading(false)
    }
  }, [qrCodeId])

  const fetchRules = async () => {
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/device-rules`)
      if (!response.ok) throw new Error('Failed to fetch rules')
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast({
        title: "Error",
        description: "Failed to load device rules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addRule = () => {
    const newRule: DeviceRule = {
      deviceType: "ALL",
      targetUrl: "",
      priority: rules.length + 1,
      browsers: [],
      os: [],
    }
    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index)
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const updateRule = (index: number, updates: Partial<DeviceRule>) => {
    const updatedRules = [...rules]
    updatedRules[index] = { ...updatedRules[index], ...updates }
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const validateRules = (rules: DeviceRule[]): boolean => {
    for (const rule of rules) {
      if (!rule.targetUrl) {
        toast({
          title: "Validation Error",
          description: "Target URL is required for all rules",
          variant: "destructive",
        })
        return false
      }

      try {
        new URL(rule.targetUrl)
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter valid URLs",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const saveRules = async () => {
    if (!qrCodeId) return
    if (!validateRules(rules)) return

    setSaving(true)
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/device-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast({
        title: "Success",
        description: "Device rules saved successfully",
      })
    } catch (error) {
      console.error('Error saving rules:', error)
      toast({
        title: "Error",
        description: "Failed to save device rules",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Device Rules</CardTitle>
          <CardDescription>
            Redirect users based on their device type. Rules are processed in order of priority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="space-y-4 pt-4 first:pt-0">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Select
                    value={rule.deviceType}
                    onValueChange={(value: DeviceRule['deviceType']) => {
                      updateRule(index, { deviceType: value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Devices</SelectItem>
                      <SelectItem value="MOBILE">Mobile</SelectItem>
                      <SelectItem value="TABLET">Tablet</SelectItem>
                      <SelectItem value="DESKTOP">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2] space-y-2">
                  <Input
                    placeholder="Target URL"
                    value={rule.targetUrl}
                    onChange={(e) => updateRule(index, { targetUrl: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
          {rules.length > 0 && (
            <Button 
              onClick={saveRules}
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rules"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/folder-list.tsx
"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Folder, Plus, Loader2 } from "lucide-react"

interface Folder {
  id: string
  name: string
  _count: {
    qrCodes: number
  }
}

interface FolderListProps {
  className?: string
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderList({ className, selectedFolderId, onFolderSelect }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  async function fetchFolders() {
    try {1
      const response = await fetch('/api/folders')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch folders')
      }
      const data = await response.json()
      setFolders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch folders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  async function createFolder() {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    setCreateLoading(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }

      const folder = await response.json()
      setFolders(prev => [folder, ...prev])
      setIsCreating(false)
      setNewFolderName("")
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      })
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Folders</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your QR codes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                />
              </div>
   
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={createFolder}
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            !selectedFolderId && "bg-accent"
          )}
          onClick={() => onFolderSelect(null)}
        >
          <Folder className="mr-2 h-4 w-4" />
          All QR Codes
        </Button>
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              selectedFolderId === folder.id && "bg-accent"
            )}
            onClick={() => onFolderSelect(folder.id)}
          >
    
            {folder.name}
            <span className="ml-auto text-xs text-muted-foreground">
              {folder._count.qrCodes}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/folder-menu.tsx
"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "@/components/ui/use-toast"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface FolderMenuProps {
  folder: {
    id: string
    name: string
  }
  onFolderDeleted: () => void
  onFolderUpdated: () => void
}

export function FolderMenu({ folder, onFolderDeleted, onFolderUpdated }: FolderMenuProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [name, setName] = useState(folder.name)

  async function updateFolder() {
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) throw new Error('Failed to update folder')

      toast({
        title: "Success",
        description: "Folder updated successfully",
      })

      setIsEditing(false)
      onFolderUpdated()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      })
    }
  }

  async function deleteFolder() {
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete folder')

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })

      setIsDeleting(false)
      onFolderDeleted()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setIsDeleting(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder name
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
    
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={updateFolder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this folder? QR codes in this folder will be moved to &quot;All QR Codes&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteFolder}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface QRAnalyticsProps {
  qrCodeId: string
}

// Mock data - replace with real data fetch
const mockData = [
  { date: "2024-01-01", scans: 45 },
  { date: "2024-01-02", scans: 67 },
  { date: "2024-01-03", scans: 32 },
  { date: "2024-01-04", scans: 89 },
  { date: "2024-01-05", scans: 102 },
  { date: "2024-01-06", scans: 78 },
  { date: "2024-01-07", scans: 56 },
]

export function QRAnalytics({  }: QRAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-card.tsx
// QRCard.tsx
import { useState } from "react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  FileDown, 
  ExternalLink, 
  Trash2, 
  MoreHorizontal,
  Loader2 
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface QRCodeData {
  id: string
  name: string
  shortCode: string
  defaultUrl: string
  scans: number
  isActive: boolean
  createdAt: Date
}

interface QRCardProps {
  qrCode: QRCodeData
  onDelete?: (qrCode: QRCodeData) => Promise<void>
  selected?: boolean
  onSelect?: () => void
  className?: string
}

export function QRCard({ 
  qrCode, 
  onDelete, 
  selected,
  onSelect,
  className 
}: QRCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${qrCode.shortCode}`

  const downloadQRAsImage = async () => {
    try {
      setDownloadLoading(true)
      const svg = document.getElementById(`qr-${qrCode.id}`) as unknown as SVGElement | null
      if (!svg) throw new Error('QR code element not found')

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error('Could not get canvas context')
      
      const multiplier = 4
      canvas.width = 150 * multiplier
      canvas.height = 150 * multiplier
      
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      
      img.onload = () => {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const pngFile = canvas.toDataURL("image/png")
        
        const downloadLink = document.createElement("a")
        downloadLink.download = `${qrCode.name}-qr.png`
        downloadLink.href = pngFile
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        setDownloadLoading(false)
        
        toast({
          title: "Success",
          description: "QR code downloaded as PNG",
        })
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
      setDownloadLoading(false)
    }
  }

  const downloadQRAsSVG = async () => {
    try {
      setDownloadLoading(true)
      const svg = document.getElementById(`qr-${qrCode.id}`) as unknown as SVGElement | null
      if (!svg) throw new Error('QR code element not found')

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = `${qrCode.name}-qr.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
      setDownloadLoading(false)

      toast({
        title: "Success",
        description: "QR code downloaded as SVG",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
      setDownloadLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleteLoading(true)
    try {
      await onDelete(qrCode)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting QR code:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-200",
          selected && "ring-2 ring-primary",
          "cursor-pointer hover:shadow-md",
          className
        )}
        onClick={(e) => {
          // Don't trigger selection when clicking interactive elements
          if (
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('a')
          ) {
            return;
          }
          onSelect?.();
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{qrCode.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={qrCode.isActive ? "default" : "secondary"}>
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/qr/${qrCode.id}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/r/${qrCode.shortCode}`} 
                      target="_blank"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View live
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={downloadQRAsImage}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Download PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={downloadQRAsSVG}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Download SVG
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <QRCode
              id={`qr-${qrCode.id}`}
              value={qrUrl}
              level="M"
              size={150}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Short Code</span>
              <span className="font-medium">{qrCode.shortCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scans</span>
              <span className="font-medium">{qrCode.scans || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this QR code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-codes-table.tsx
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Pencil, 
  Save, 
  X,
  FolderEdit,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface QRCode {
  id: string
  name: string
  shortCode: string
  defaultUrl: string
  isActive: boolean
  createdAt: string
  folderId: string | null
  folder?: {
    id: string
    name: string
  }
}

interface Folder {
  id: string
  name: string
}

interface QRCodesTableProps {
  folderId?: string | null
}

export function QRCodesTable({ folderId }: QRCodesTableProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set())
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  const [editedValues, setEditedValues] = useState<Record<string, Partial<QRCode>>>({})
  const [bulkEditDialog, setBulkEditDialog] = useState(false)
  const [bulkEditValues, setBulkEditValues] = useState<{
    defaultUrl?: string
    folderId?: string | null
  }>({})
  const [savingBulk, setSavingBulk] = useState(false)

  // Fetch QR codes and folders
  useEffect(() => {
    async function fetchData() {
      try {
        const [qrResponse, folderResponse] = await Promise.all([
          fetch('/api/qr'),
          fetch('/api/folders')
        ])

        if (!qrResponse.ok || !folderResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const qrData = await qrResponse.json()
        const folderData = await folderResponse.json()

        const filteredQRs = folderId
          ? qrData.filter((qr: QRCode) => qr.folderId === folderId)
          : qrData

        setQrCodes(filteredQRs)
        setFolders(folderData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [folderId])

  const toggleQRSelection = (id: string) => {
    const newSelected = new Set(selectedQRs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedQRs(newSelected)
  }

  const toggleAllQRs = () => {
    if (selectedQRs.size === qrCodes.length) {
      setSelectedQRs(new Set())
    } else {
      setSelectedQRs(new Set(qrCodes.map(qr => qr.id)))
    }
  }

  const startEditing = (id: string) => {
    setEditingRows(new Set([...editingRows, id]))
    const qr = qrCodes.find(q => q.id === id)
    if (qr) {
      setEditedValues(prev => ({
        ...prev,
        [id]: {
          defaultUrl: qr.defaultUrl,
          folderId: qr.folderId
        }
      }))
    }
  }

  const stopEditing = (id: string) => {
    const newEditingRows = new Set(editingRows)
    newEditingRows.delete(id)
    setEditingRows(newEditingRows)
    setEditedValues(prev => {
      const newValues = { ...prev }
      delete newValues[id]
      return newValues
    })
  }

  const updateEditedValue = (id: string, field: keyof QRCode, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const saveRow = async (id: string) => {
    const values = editedValues[id]
    if (!values) return

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) throw new Error('Failed to update QR code')

      const updatedQR = await response.json()
      setQrCodes(prev => prev.map(qr => qr.id === id ? updatedQR : qr))
      stopEditing(id)
      toast({
        title: "Success",
        description: "QR code updated successfully"
      })
    } catch (error) {
      console.error('Error updating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to update QR code",
        variant: "destructive"
      })
    }
  }

  const saveBulkEdit = async () => {
    if (!selectedQRs.size || !Object.keys(bulkEditValues).length) return

    setSavingBulk(true)
    try {
      const updatePromises = Array.from(selectedQRs).map(id =>
        fetch(`/api/qr/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bulkEditValues)
        })
      )

      const results = await Promise.allSettled(updatePromises)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length

      const response = await fetch('/api/qr')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(folderId ? data.filter((qr: QRCode) => qr.folderId === folderId) : data)
      }

      setBulkEditDialog(false)
      setSelectedQRs(new Set())
      setBulkEditValues({})

      if (failCount === 0) {
        toast({
          title: "Success",
          description: `Updated ${successCount} QR codes successfully`
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Updated ${successCount} QR codes, failed to update ${failCount}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk update:', error)
      toast({
        title: "Error",
        description: "Failed to update QR codes",
        variant: "destructive"
      })
    } finally {
      setSavingBulk(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background/95 sticky top-0 z-10 py-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={selectedQRs.size === qrCodes.length && qrCodes.length > 0}
              onCheckedChange={toggleAllQRs}
              aria-label="Select all QR codes"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground select-none"
            >
              {selectedQRs.size === 0 
                ? "Select items" 
                : `${selectedQRs.size} selected`}
            </label>
          </div>
          {selectedQRs.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setBulkEditDialog(true)}
            >
              <FolderEdit className="h-4 w-4 mr-2" />
              Bulk Edit
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <span className="sr-only">Selection</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Default URL</TableHead>
                <TableHead>Folder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map(qr => (
                <TableRow key={qr.id}>
                  <TableCell className="p-0 text-center">
                    <Checkbox
                      checked={selectedQRs.has(qr.id)}
                      onCheckedChange={() => toggleQRSelection(qr.id)}
                      aria-label={`Select QR code ${qr.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{qr.name}</span>
                    <br />
                    <Badge className="mt-0.5">
                      /{qr.shortCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingRows.has(qr.id) ? (
                      <Input
                        type="url"
                        value={editedValues[qr.id]?.defaultUrl || ""}
                        onChange={(e) =>
                          updateEditedValue(qr.id, "defaultUrl", e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    ) : (
                      qr.defaultUrl
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRows.has(qr.id) ? (
                      <Select
                        onValueChange={(value) =>
                          updateEditedValue(
                            qr.id,
                            "folderId",
                            value === "none" ? null : value
                          )
                        }
                        value={
                          editedValues[qr.id]?.folderId || qr.folderId || "none"
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No folder</SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      qr.folder?.name || <span className="italic">No folder</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? "outline" : "secondary"}>
                      {qr.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(qr.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="p-0 text-center">
                    {editingRows.has(qr.id) ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveRow(qr.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => stopEditing(qr.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(qr.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={bulkEditDialog} onOpenChange={setBulkEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit QR Codes</DialogTitle>
            <DialogDescription>
              Apply changes to the selected QR codes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default URL</label>
              <Input
                type="url"
                value={bulkEditValues.defaultUrl || ""}
                onChange={(e) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    defaultUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select
                onValueChange={(value) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    folderId: value === "none" ? null : value,
                  }))
                }
                value={bulkEditValues.folderId || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveBulkEdit} disabled={savingBulk}>
              {savingBulk && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-empty-state.tsx
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Plus } from "lucide-react"
import Link from "next/link"

export function QRCodeEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <QrCode className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardTitle className="mb-2">No QR Codes Yet</CardTitle>
      <CardDescription className="mb-4 max-w-sm">
        Create your first QR code to get started with dynamic redirects and analytics.
      </CardDescription>
      <Link href="/qr/new">
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First QR Code
        </Button>
      </Link>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-form.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeviceRuleForm } from "./device-rule-form"
import { ScheduleRuleForm } from "./schedule-rule-form"
import { QRDesigner } from "./designer/qr-designer"
import { QRDesignerConfig } from "./designer/types"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Folder {
  id: string
  name: string
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  defaultUrl: z.string()
    .min(1, "URL is required")
    .transform(val => {
      let url = val.trim()
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`
      }
      return url
    })
    .refine(
      (val) => {
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      "Please enter a valid URL"
    ),
  folderId: z.string().nullable(),
})

interface QRFormProps {
  initialData?: {

    name: string
    defaultUrl: string
    folderId: string | null
    id?: string
  }
}

export function QRForm({ initialData }: QRFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [qrConfig, setQRConfig] = useState<QRDesignerConfig | null>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [createFolderLoading, setCreateFolderLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      defaultUrl: initialData?.defaultUrl || "",
      folderId: initialData?.folderId || null,
    },
  })

  const watchUrl = form.watch("defaultUrl")

  useEffect(() => {
    async function loadFolders() {
      try {
        const response = await fetch('/api/folders')
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to fetch folders')
        }
        const data = await response.json()
        setFolders(data)
      } catch (error) {
        console.error('Error loading folders:', error)
        toast({
          title: "Error",
          description: "Failed to load folders",
          variant: "destructive",
        })
      } finally {
        setFoldersLoading(false)
      }
    }

    loadFolders()
  }, [])

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    setCreateFolderLoading(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }

      const newFolder = await response.json()
      
      // Update folders list with new folder
      setFolders(prev => [...prev, newFolder])
      
      // Update form's folder selection
      form.setValue('folderId', newFolder.id)
      
      // Close dialog and reset state
      setCreateFolderOpen(false)
      setNewFolderName("")
      
      toast({
        title: "Success",
        description: "Folder created and selected",
      })
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      })
    } finally {
      setCreateFolderLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      const payload = {
        name: values.name,
        defaultUrl: values.defaultUrl,
        folderId: values.folderId,
        design: qrConfig
      }

      console.log('Submitting payload:', payload)

      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create QR code')
      }

      toast({
        title: "Success!",
        description: "QR code created successfully.",
      })

      router.push('/qr')
      router.refresh()
    } catch (error) {
      console.error("Error creating QR code:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create QR code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">Create QR Code</h3>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create your QR code.
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="device">Device Rules</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My QR Code" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      A name to help you identify this QR code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="example.com" 
                        {...field} 
                        disabled={isLoading}
                        onChange={(e) => {
                          let value = e.target.value.trim()
                          if (!/^[a-zA-Z]+:\/\//i.test(value) && value.includes('://')) {
                            value = value.split('://')[1]
                          }
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a website URL (e.g., example.com or https://example.com)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder (Optional)</FormLabel>
                    <Select
                      disabled={foldersLoading}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setCreateFolderOpen(true)
                          return;
                        }
                        field.onChange(value === "none" ? null : value)
                      }}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a folder">
                            {field.value === null
                              ? "No folder"
                              : folders.find(f => f.id === field.value)?.name || "Select a folder"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No folder</SelectItem>
                        <Separator className="my-2" />
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                        <Separator className="my-2" />
                        <Button
                          variant="ghost"
                          className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={(e) => {
                            e.preventDefault()
                            setCreateFolderOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Folder
                        </Button>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Organize your QR code in a folder
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create QR Code"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="design">
          <QRDesigner
            value={watchUrl || "https://example.com"}
            onConfigChange={setQRConfig}
            defaultConfig={{
              size: 300,
              backgroundColor: '#ffffff',
              foregroundColor: '#000000',
              dotStyle: 'squares',
              margin: 10,
              errorCorrectionLevel: 'M',
            }}
          />
        </TabsContent>

        <TabsContent value="device">
          <DeviceRuleForm qrCodeId={initialData?.id} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleRuleForm qrCodeId={initialData?.id} />
        </TabsContent>
      </Tabs>

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    createFolder()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateFolderOpen(false)
                setNewFolderName("")
              }}
              disabled={createFolderLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={createFolder}
              disabled={createFolderLoading || !newFolderName.trim()}
            >
              {createFolderLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCard } from "./qr-card"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2, Plus } from "lucide-react"
import Link from "next/link"

// Update interface to match QRCard's QRCodeData interface
interface QRCode {
  id: string
  name: string
  shortCode: string
  defaultUrl: string
  isActive: boolean
  createdAt: Date
  folderId: string | null
  scans: number
}

interface QRCodeListProps {
  folderId?: string | null
  className?: string
}

export function QRCodeList({ folderId }: QRCodeListProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set())
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchQRCodes() {
      try {
        const response = await fetch('/api/qr')
        if (!response.ok) {
          throw new Error('Failed to fetch QR codes')
        }

        const data = await response.json()
        
        // Transform the data to match our interface
        const transformedData = data.map((qr: any) => ({
          ...qr,
          createdAt: new Date(qr.createdAt), // Ensure createdAt is a Date object
          scans: qr.scans || 0 // Ensure scans has a default value
        }))
        
        const filteredData = folderId
          ? transformedData.filter((qr: QRCode) => qr.folderId === folderId)
          : transformedData

        setQrCodes(filteredData)
      } catch (error) {
        console.error('Error fetching QR codes:', error)
        toast({
          title: "Error",
          description: "Failed to fetch QR codes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchQRCodes()
  }, [folderId])

  const toggleQRSelection = (id: string) => {
    const newSelected = new Set(selectedQRs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedQRs(newSelected)
  }

  const toggleAllQRs = () => {
    if (selectedQRs.size === qrCodes.length) {
      setSelectedQRs(new Set())
    } else {
      setSelectedQRs(new Set(qrCodes.map(qr => qr.id)))
    }
  }

  const deleteQRCode = async (qrCode: QRCode) => {
    try {
      const response = await fetch(`/api/qr/${qrCode.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete QR code')

      setQrCodes(prev => prev.filter(qr => qr.id !== qrCode.id))
      setSelectedQRs(prev => {
        const newSet = new Set(prev)
        newSet.delete(qrCode.id)
        return newSet
      })

      toast({
        title: "Success",
        description: "QR code deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting QR code:', error)
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      })
    }
  }

  const bulkDeleteQRCodes = async () => {
    setBulkDeleteLoading(true)
    try {
      const deletePromises = Array.from(selectedQRs).map(id =>
        fetch(`/api/qr/${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.allSettled(deletePromises)
      
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failCount = results.filter(result => result.status === 'rejected').length

      setQrCodes(prevCodes => prevCodes.filter(qr => !selectedQRs.has(qr.id)))
      setSelectedQRs(new Set())
      setBulkDeleteDialog(false)

      if (failCount === 0) {
        toast({
          title: "Success",
          description: `Successfully deleted ${successCount} QR code${successCount !== 1 ? 's' : ''}`
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${successCount} QR codes, but failed to delete ${failCount}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast({
        title: "Error",
        description: "Failed to delete QR codes",
        variant: "destructive"
      })
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <Card>
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            {folderId 
              ? "Add QR codes to this folder to see them here."
              : "Create your first QR code to get started with dynamic redirects and analytics."}
          </p>
          <Link href="/qr/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create {folderId ? "a" : "your first"} QR code
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background/95 sticky top-0 z-10 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={selectedQRs.size === qrCodes.length && qrCodes.length > 0}
              onCheckedChange={toggleAllQRs}
              aria-label="Select all QR codes"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground select-none"
            >
              {selectedQRs.size === 0 
                ? "Select items" 
                : `${selectedQRs.size} selected`}
            </label>
          </div>
          <div className="flex items-center gap-2">
            {selectedQRs.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="relative group">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  id={`select-${qrCode.id}`}
                  checked={selectedQRs.has(qrCode.id)}
                  onCheckedChange={() => toggleQRSelection(qrCode.id)}
                  aria-label={`Select ${qrCode.name}`}
                />
              </div>
              <QRCard
                qrCode={qrCode}
                onDelete={deleteQRCode}
                selected={selectedQRs.has(qrCode.id)}
                onSelect={() => toggleQRSelection(qrCode.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Codes</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedQRs.size} QR code{selectedQRs.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
              disabled={bulkDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={bulkDeleteQRCodes}
              disabled={bulkDeleteLoading}
            >
              {bulkDeleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Selected"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-preview.tsx
"use client"

import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRPreviewProps {
  url: string
  name: string
}

export function QRPreview({ url, name }: QRPreviewProps) {
  const downloadQR = () => {
    const svg = document.getElementById("qr-preview")
    const svgData = new XMLSerializer().serializeToString(svg!)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const link = document.createElement("a")
    link.href = svgUrl
    link.download = `${name}-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(svgUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              id="qr-preview"
              value={url}
              level="M"
              size={200}
            />
          </div>
          <Button variant="outline" onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function QRCodeSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="flex justify-end space-x-2 pt-2">
            <div className="h-8 w-8 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/qr-view.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QRCodeList } from "./qr-list"
import { QRCodesTable } from "./qr-codes-table"
import { LayoutGrid, Table2 } from "lucide-react"

interface QRViewProps {
  folderId?: string | null
}

export function QRView({ folderId }: QRViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex items-center rounded-lg border bg-background p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-2"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="px-2"
          >
            <Table2 className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <QRCodeList folderId={folderId} />
      ) : (
        <QRCodesTable folderId={folderId} />
      )}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/qr/schedule-rule-form.tsx
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"

interface ScheduleRule {
  id?: string
  startDate: string
  endDate: string | null
  timeZone: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  targetUrl: string
  priority: number
}

interface ScheduleRuleFormProps {
  qrCodeId?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
]

export function ScheduleRuleForm({ qrCodeId }: ScheduleRuleFormProps) {
  const [rules, setRules] = useState<ScheduleRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchRules = useCallback(async () => {
    if (!qrCodeId) return
    
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/schedule-rules`)
      if (!response.ok) throw new Error('Failed to fetch rules')
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast({
        title: "Error",
        description: "Failed to load schedule rules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [qrCodeId])

  useEffect(() => {
    if (qrCodeId) {
      fetchRules()
    } else {
      setLoading(false)
    }
  }, [fetchRules, qrCodeId])

  const addRule = () => {
    const newRule: ScheduleRule = {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: null,
      timeZone: "UTC",
      daysOfWeek: [],
      startTime: null,
      endTime: null,
      targetUrl: "",
      priority: rules.length + 1,
    }
    setRules([...rules, newRule])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, updates: Partial<ScheduleRule>) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], ...updates }
    setRules(newRules)
  }

  const toggleDayOfWeek = (index: number, day: number) => {
    const rule = rules[index]
    const daysOfWeek = rule.daysOfWeek.includes(day)
      ? rule.daysOfWeek.filter(d => d !== day)
      : [...rule.daysOfWeek, day]
    updateRule(index, { daysOfWeek })
  }

  const validateRules = (rules: ScheduleRule[]): boolean => {
    for (const rule of rules) {
      if (!rule.targetUrl) {
        toast({
          title: "Validation Error",
          description: "Target URL is required for all rules",
          variant: "destructive",
        })
        return false
      }

      if (!rule.startDate) {
        toast({
          title: "Validation Error",
          description: "Start date is required for all rules",
          variant: "destructive",
        })
        return false
      }

      try {
        new URL(rule.targetUrl)
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter valid URLs",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const saveRules = async () => {
    if (!qrCodeId) return
    if (!validateRules(rules)) return

    setSaving(true)
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/schedule-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast({
        title: "Success",
        description: "Schedule rules saved successfully",
      })
    } catch (error) {
      console.error('Error saving rules:', error)
      toast({
        title: "Error",
        description: "Failed to save schedule rules",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Rules</CardTitle>
          <CardDescription>
            Redirect users based on date and time. Rules are processed in order of priority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="space-y-4 pt-4 first:pt-0">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={rule.startDate}
                      onChange={(e) => updateRule(index, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date (Optional)</label>
                    <Input
                      type="date"
                      value={rule.endDate || ""}
                      onChange={(e) => updateRule(index, { endDate: e.target.value || null })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time (Optional)</label>
                    <Input
                      type="time"
                      value={rule.startTime || ""}
                      onChange={(e) => updateRule(index, { startTime: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time (Optional)</label>
                    <Input
                      type="time"
                      value={rule.endTime || ""}
                      onChange={(e) => updateRule(index, { endTime: e.target.value || null })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Zone</label>
                  <Select
                    value={rule.timeZone}
                    onValueChange={(value) => updateRule(index, { timeZone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}-${day.value}`}
                          checked={rule.daysOfWeek.includes(day.value)}
                          onCheckedChange={() => toggleDayOfWeek(index, day.value)}
                        />
                        <label
                          htmlFor={`day-${index}-${day.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={rule.targetUrl}
                      onChange={(e) => updateRule(index, { targetUrl: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule Rule
          </Button>

          {rules.length > 0 && (
            <Button 
              onClick={saveRules}
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rules"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/recent-activities.tsx
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityIcon } from "@/components/contacts/activity/activity-icon";

export function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivities() {
      try {
        const response = await fetch("/api/activities/recent");
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivities();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: { id: string; type: string; description: string; createdAt: string }) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 text-sm"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/recent-sales.tsx
export function RecentSales() {
    return (
      <div className="space-y-8">
        {/* Example recent contacts */}
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-sm text-muted-foreground">john@example.com</p>
          </div>
          <div className="ml-auto font-medium">New</div>
        </div>
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Alice Smith</p>
            <p className="text-sm text-muted-foreground">alice@example.com</p>
          </div>
          <div className="ml-auto font-medium">Qualified</div>
        </div>
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Bob Johnson</p>
            <p className="text-sm text-muted-foreground">bob@example.com</p>
          </div>
          <div className="ml-auto font-medium">Converted</div>
        </div>
        {/* Add more recent contacts as needed */}
      </div>
    );
  }
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/dashboard/upcoming-tasks.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function UpcomingTasks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Tasks</CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">No upcoming tasks</div>
      </CardContent>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/forms/ContactForm.tsx
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      leadSource: '',
      notes: '',
    },
  })

  async function onSubmit(data: ContactFormData) {
    setLoading(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to submit form')
      
      form.reset()
      // Add success message
    } catch (error) {
      console.error('Submission error:', error)
      // Add error message
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <input
            {...form.register('name')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            {...form.register('email')}
            type="email"
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone *</label>
          <input
            {...form.register('phone')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
          {form.formState.errors.phone && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company</label>
          <input
            {...form.register('company')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            {...form.register('jobTitle')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lead Source</label>
          <select
            {...form.register('leadSource')}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          >
            <option value="">Select Source</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="SOCIAL">Social Media</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            {...form.register('notes')}
            className="w-full p-2 border rounded-md"
            rows={4}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/landing/features.tsx
import { Check, Coffee, LineChart, Users, Star, Clock } from "lucide-react"

const features = [
  {
    name: "Customer Management",
    description: "Keep track of customer preferences, orders, and loyalty points all in one place.",
    icon: Users,
  },
  {
    name: "Order Tracking",
    description: "Monitor orders in real-time and streamline your order fulfillment process.",
    icon: Coffee,
  },
  {
    name: "Analytics & Insights",
    description: "Get detailed insights into your business performance with advanced analytics.",
    icon: LineChart,
  },
  {
    name: "Loyalty Programs",
    description: "Create and manage customer loyalty programs to increase retention.",
    icon: Star,
  },
  {
    name: "Real-time Updates",
    description: "Stay up-to-date with instant notifications and real-time data updates.",
    icon: Clock,
  },
  {
    name: "Performance Tracking",
    description: "Monitor staff performance and optimize your operations.",
    icon: Check,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Run Your Coffee Shop
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful features designed specifically for coffee shop owners and managers.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative bg-background rounded-lg p-8 shadow-sm">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/landing/hero.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative px-6 py-24 md:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Streamline Your Coffee Shop Management
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              The all-in-one CRM solution designed specifically for coffee shops. 
              Manage customers, track orders, and grow your business with ease.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[50%] top-0 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 blur-3xl" />
      </div>
    </section>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/landing/pricing.tsx
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: "Basic",
    id: "basic",
    price: "$29",
    description: "Perfect for small coffee shops just getting started.",
    features: [
      "Up to 500 customer profiles",
      "Basic order tracking",
      "Email support",
      "Basic analytics",
      "1 staff account",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$79",
    description: "Ideal for growing coffee shops with multiple staff members.",
    features: [
      "Unlimited customer profiles",
      "Advanced order tracking",
      "Priority support",
      "Advanced analytics",
      "Up to 10 staff accounts",
      "Loyalty program",
      "Custom branding",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    description: "For large coffee shop chains with custom requirements.",
    features: [
      "Everything in Pro",
      "Unlimited staff accounts",
      "24/7 phone support",
      "Custom integrations",
      "Dedicated account manager",
      "Custom analytics",
      "Multi-location support",
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that best fits your coffee shop&apos;s needs.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "flex flex-col justify-between rounded-3xl bg-background p-8 shadow-sm ring-1 ring-muted xl:p-10",
                tier.featured && "ring-2 ring-primary"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8">{tier.name}</h3>
                  {tier.featured && (
                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most popular
                    </p>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.id !== "enterprise" && (
                    <span className="text-sm font-semibold leading-6">/month</span>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={tier.featured ? "default" : "outline"}
                className="mt-8"
                size="lg"
              >
                {tier.id === "enterprise" ? "Contact sales" : "Get started"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/landing/testimonials.tsx
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, The Daily Grind",
    content: "This CRM has transformed how we manage our coffee shop. The customer tracking and loyalty features are invaluable.",
    image: "/avatars/sarah.jpg",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Manager, Coffee Haven",
    content: "The analytics tools have helped us make better business decisions. Our customer satisfaction has improved significantly.",
    image: "/avatars/mike.jpg",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Owner, The Coffee Corner",
    content: "Easy to use and fantastic customer support. It's exactly what our growing coffee shop needed.",
    image: "/avatars/emily.jpg",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Coffee Shop Owners
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Hear what our customers have to say about their experience.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl bg-background p-8 shadow-sm"
            >
              <div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-6 text-base leading-7">{testimonial.content}</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-semibold leading-7">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/layout/page-container.tsx
"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-[70px]" : "ml-[170px]",
        className
      )}
    >
      <div className="mx-auto max-w-screen-2xl">
        {children}
      </div>
    </div>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/settings/account-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const accountFormSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit() {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      form.reset();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
        <CardDescription>
          Update your password and manage account security settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter current password" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter new password" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Confirm new password" 
                      type="password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/settings/notifications-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  monthlyNewsletter: z.boolean(),
  marketingEmails: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function NotificationsForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      monthlyNewsletter: true,
      marketingEmails: false,
    },
  });

  async function onSubmit() {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications about your account activity via email.
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
            <FormField
              control={form.control}
              name="pushNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Push Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive push notifications in your browser.
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
            <FormField
              control={form.control}
              name="monthlyNewsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Monthly Newsletter
                    </FormLabel>
                    <FormDescription>
                      Receive our monthly newsletter with updates and tips.
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
            <FormField
              control={form.control}
              name="marketingEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Marketing Emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about new features and special offers.
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/settings/preferences-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  dateFormat: z.string(),
  timeZone: z.string(),
  language: z.string(),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export function PreferencesForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: "system",
      dateFormat: "MM/DD/YYYY",
      timeZone: "UTC",
      language: "en",
    },
  });

  // We don't need error if we're not handling it, hence it's removed.
  async function onSubmit() {
    
    setLoading(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your application experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your preferred color theme.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose how dates should be displayed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Zone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your preferred time zone.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your preferred language.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/settings/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  bio: z.string().max(160).optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      phoneNumber: "",
    },
  });

  async function onSubmit() {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center gap-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile picture" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, GIF or PNG. Max size of 3MB.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" />
                    </FormControl>
                    <FormDescription>
                      Your email address for communications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description for your profile. Maximum 160 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your contact phone number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Updating..." : "Update profile"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/accordion.tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = AccordionPrimitive.Item.displayName || "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName || "AccordionTrigger"

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName || "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/alert.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Define alert variants using `cva`
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Alert component with variant support
const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

// AlertTitle component
const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

// AlertDescription component
const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/avatar.tsx
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        glass: "bg-background/80 backdrop-blur-sm border hover:bg-background/90",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation }), className)}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}
      >
        {loading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/calendar.tsx
"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
 
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/card.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        ghost: "border-none shadow-none hover:bg-accent/50",
        elevated: "shadow-md hover:shadow-lg hover:-translate-y-0.5",
        interactive: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/checkbox.tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/color-picker.tsx
"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChromePicker, ColorResult } from 'react-color'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleChange = (color: ColorResult) => {
    onChange(color.hex)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="h-10 rounded-md border cursor-pointer"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none">
        <ChromePicker
          color={color}
          onChange={handleChange}
          disableAlpha
        />
      </PopoverContent>
    </Popover>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/container.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const containerVariants = cva(
  "mx-auto px-4 sm:px-6 lg:px-8",
  {
    variants: {
      maxWidth: {
        default: "max-w-7xl",
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        full: "max-w-full",
      },
      padding: {
        default: "py-4",
        none: "py-0",
        sm: "py-2",
        lg: "py-8",
        xl: "py-12",
      }
    },
    defaultVariants: {
      maxWidth: "default",
      padding: "default",
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({
  className,
  maxWidth,
  padding,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        containerVariants({ maxWidth, padding }),
        className
      )}
      {...props}
    />
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/dialog.tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/dropdown-menu.tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/form.tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/label.tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/page-header.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const pageHeaderVariants = cva(
  "flex flex-col gap-1",
  {
    variants: {
      spacing: {
        default: "mb-6",
        sm: "mb-4",
        lg: "mb-8",
      },
    },
    defaultVariants: {
      spacing: "default",
    },
  }
)

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({
  className,
  title,
  description,
  spacing,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        pageHeaderVariants({ spacing }),
        "flex items-center justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/popover.tsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <PopoverPrimitive.Content
      ref={ref}
      className={cn("z-10 p-4 bg-white border rounded shadow-sm", className)}
      {...rest}
    />
  );
});

// Add displayName for debugging purposes
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/scroll-area.tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/select.tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 bg-white",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/separator.tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/sheet.tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/slider.tsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

type SliderProps = {
  className?: string
} & SliderPrimitive.SliderProps

const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
        >
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {props.value?.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:border-primary"
          />
        ))}
      </SliderPrimitive.Root>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/status-badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success text-success-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        outline: "text-foreground border border-input",
      },
      dotColor: {
        none: "",
        default: "before:bg-primary",
        success: "before:bg-success",
        destructive: "before:bg-destructive",
        warning: "before:bg-warning",
        info: "before:bg-info",
      },
    },
    defaultVariants: {
      variant: "default",
      dotColor: "none",
    },
    compoundVariants: [
      {
        dotColor: ["default", "success", "destructive", "warning", "info"],
        className: "pl-3 before:absolute before:left-1 before:h-1.5 before:w-1.5 before:rounded-full relative",
      },
    ],
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  pulse?: boolean
}

function StatusBadge({
  className,
  variant,
  dotColor,
  pulse = false,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        statusBadgeVariants({ variant, dotColor }),
        pulse && dotColor !== "none" && "before:animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/switch.tsx
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentProps<typeof SwitchPrimitives.Root> & {
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
)

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/table.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TableProps = HTMLAttributes<HTMLTableElement>;
const Table = forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;
const TableHeader = forwardRef<HTMLTableSectionElement, TableSectionProps>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<HTMLTableSectionElement, TableSectionProps>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

type TableRowProps = HTMLAttributes<HTMLTableRowElement>;
const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

type TableHeadProps = HTMLAttributes<HTMLTableCellElement>;
const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

type TableCellProps = HTMLAttributes<HTMLTableCellElement>;
const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;
const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/tabs.tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/toast.tsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/toaster.tsx
"use client"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/tooltip.tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className = "", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/components/ui/use-toast.ts
"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: ToasterToast["id"]
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id))
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      }
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/constants/pos-data.ts
import { MenuItem, MilkOption } from '@/types/pos';

export const INITIAL_MENU_ITEMS: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
 { name: 'Espresso', price: 2.5, category: 'Coffee', popular: true, active: true },
 { name: 'Americano', price: 3.0, category: 'Coffee', popular: false, active: true },
 { name: 'Latte', price: 3.5, category: 'Coffee', popular: true, active: true },
 { name: 'Cappuccino', price: 3.5, category: 'Coffee', popular: true, active: true },
 { name: 'Flat White', price: 3.5, category: 'Coffee', popular: false, active: true },
 { name: 'Cortado', price: 3.5, category: 'Coffee', popular: false, active: true },
 { name: 'Caramel Crunch Crusher', price: 4.5, category: 'Specialty', popular: true, active: true },
 { name: 'Vanilla Dream Latte', price: 4.5, category: 'Specialty', popular: false, active: true },
 { name: 'Hazelnut Heaven Cappuccino', price: 4.5, category: 'Specialty', popular: false, active: true }
];

export const FLAVOR_OPTIONS = [
 'No Flavoring',
 'Vanilla',
 'Caramel',
 'Hazelnut',
 'Raspberry',
 'Pumpkin Spice'
] as const;

export const MILK_OPTIONS: MilkOption[] = [
 { name: 'No Milk', price: 0 },
 { name: 'Whole Milk', price: 0 },
 { name: 'Oat Milk', price: 0 }
];

export const CATEGORIES = [
 'Coffee',
 'Specialty',
 'Tea',
 'Cold Drinks',
 'Food'
] as const;

export type Category = typeof CATEGORIES[number];
export type FlavorOption = typeof FLAVOR_OPTIONS[number];

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/hooks/use-media-query.ts
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
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/activity/logger.ts
// import { prisma } from "@/lib/db/prisma";

// export type ActivityType = 
//   | "STATUS_CHANGE"
//   | "NOTE_ADDED"
//   | "EMAIL_SENT"
//   | "CONTACT_CREATED"
//   | "CONTACT_UPDATED"
//   | "CONTACT_DELETED";

// export async function logActivity({
//   contactId,
//   userId,
//   type,
//   description,
//   metadata = {}
// }: {
//   contactId: string;
//   userId: string;
//   type: ActivityType;
//   description: string;
//   metadata?: Record<string, any>;
// }) {
//   try {
//     const activity = await prisma.activity.create({
//       data: {
//         contactId: contactId,
//         userId,
//         type,
//         description,
//         metadata,
//       },
//     });
//     return activity;
//   } catch (error) {
//     console.error("Failed to log activity:", error);
//     return null;
//   }
// }

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/auth/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
  },
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/contacts.ts
import { prisma } from "./db/prisma";
import { Contact, ContactStats } from "@/types/contacts";

export async function getContacts(): Promise<Contact[]> {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return contacts as Contact[]; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });
    return contact as Contact | null; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contact:", error);
    return null;
  }
}

export async function getContactStats(): Promise<ContactStats> {
  try {
    // Get total contacts
    const totalContacts = await prisma.contact.count();

    // Get contacts created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get contacts created last month for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setMilliseconds(-1);

    const lastMonthContacts = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Calculate percentage change
    const percentageChange = lastMonthContacts === 0
      ? newThisMonth === 0 ? "0.0" : "100.0"
      : ((newThisMonth - lastMonthContacts) / lastMonthContacts * 100).toFixed(1);

    // Get contacts by status
    const statusCounts = await prisma.contact.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Convert status counts to record
    const byStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status as keyof typeof acc] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalContacts,
      newThisMonth,
      percentageChange,
      byStatus,
    };
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return {
      total: 0,
      newThisMonth: 0,
      percentageChange: "0.0",
      byStatus: {},
    };
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/db/db-utils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "./prisma";

export const dbUtils = {
  async createOrder(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.order.create({
      data
    });
  },

  async getOrders() {
    return await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getMenuItems() {
    return await prisma.menuItem.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async createQuickNote(content: string, userId: string) {
    return await prisma.quickNote.create({
      data: {
        content,
        userId
      }
    });
  },

  async getQuickNotes(userId: string) {
    return await prisma.quickNote.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async updateMenuItem(id: string, data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.menuItem.update({
      where: { id },
      data
    });
  },

  async deleteMenuItem(id: string) {
    return await prisma.menuItem.update({
      where: { id },
      data: { active: false }
    });
  }
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


export async function getQRCodeById(id: string) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        folder: true,
        deviceRules: true,
        scheduleRules: true,
      },
    })
    
    if (!qrCode) {
      return null
    }

    return qrCode
  } catch (error) {
    console.error("Error fetching QR code:", error)
    throw new Error("Failed to fetch QR code")
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;

}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/pos/services.ts
import { prisma } from "@/lib/db/prisma";
import { Order, MenuItem, QuickNote } from "@/types/pos";

export async function createOrder(orderData: Omit<Order, "id">): Promise<Order> {
  const order = await prisma.order.create({
    data: orderData
  });
  return order as Order;
}

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    orderBy: { timestamp: 'desc' }
  });
  return orders as Order[];
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { name: 'asc' }
  });
  return menuItems as MenuItem[];
}

export async function getQuickNotes(): Promise<QuickNote[]> {
  const quickNotes = await prisma.quickNote.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return quickNotes as QuickNote[];
}

export async function createQuickNote(content: string): Promise<QuickNote> {
  const quickNote = await prisma.quickNote.create({
    data: { content }
  });
  return quickNote as QuickNote;
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/services/db-service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/db/prisma";
import { Order, MenuItem, QuickNote } from "@/types/pos";

interface CreateOrderData {
  orderNumber: number;
  customerName: string;
  customerInfo: Record<string, any>; // Ignoring eslint error for 'any'
  items: any[]; // Ignoring eslint error for 'any'
  notes?: string;
  status: string;
  total: number;
  isComplimentary: boolean;
  queueTime?: number;
  startTime: Date;
  userId: string;
}

export const dbService = {
  // Order Operations
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerInfo: data.customerInfo,
          items: data.items,
          notes: data.notes,
          status: data.status as any, // Ignoring eslint error for 'any'
          total: data.total,
          isComplimentary: data.isComplimentary,
          queueTime: data.queueTime || 0, // Fix: Provide a default value of 0 if queueTime is undefined
          startTime: data.startTime,
          userId: data.userId
        }
      });
      return order as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return orders as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // MenuItem Operations
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await prisma.menuItem.findMany({
        where: {
          active: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      return items as MenuItem[];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const item = await prisma.menuItem.create({
        data: {
          name: data.name,
          price: data.price,
          category: data.category,
          popular: data.popular,
          active: true
        }
      });
      return item as MenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // QuickNote Operations
  async getQuickNotes(userId: string): Promise<QuickNote[]> {
    try {
      const notes = await prisma.quickNote.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notes as QuickNote[];
    } catch (error) {
      console.error('Error fetching quick notes:', error);
      throw error;
    }
  },

  async createQuickNote(content: string, userId: string): Promise<QuickNote> {
    try {
      const note = await prisma.quickNote.create({
        data: {
          content,
          userId
        }
      });
      return note as QuickNote;
    } catch (error) {
      console.error('Error creating quick note:', error);
      throw error;
    }
  }
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/services/order-service.ts
import { Order } from '@/types/pos';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch('/api/pos/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const orders = await response.json();
      
      // Update localStorage
      localStorage.setItem('orders', JSON.stringify(orders));
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('orders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    }
  },

  async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { ...orderData, id: Date.now().toString() };
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return newOrder as Order;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const response = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      const updatedOrder = await response.json();
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.map((order: Order) =>
        order.id === orderId ? updatedOrder : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.map((order: Order) =>
        order.id === orderId ? { ...order, ...updates } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return updatedOrders.find((order: Order) => order.id === orderId) as Order;
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.filter((order: Order) => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error deleting order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.filter((order: Order) => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }
  },

  async clearAllOrders(): Promise<void> {
    try {
      const existingOrders = await this.getOrders();
      await Promise.all(
        existingOrders.map(order => this.updateOrder(order.id, { status: 'CANCELLED' }))
      );
      localStorage.setItem('orders', JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing orders:', error);
      localStorage.setItem('orders', JSON.stringify([]));
    }
  },
 
  async exportOrders(): Promise<string> {
    try {
      const orders = await this.getOrders();
      const data = {
        orders,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting orders:', error);
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('orders');
      return savedOrders || '[]';
    }
  },
 
  async importOrders(data: string): Promise<void> {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData.orders)) {
        await Promise.all(
          parsedData.orders.map((order: Order) => this.createOrder(order))
        );
      }
    } catch (error) {
      console.error('Error importing orders:', error);
      throw new Error('Invalid import data format');
    }
  },

  async updateLeadInterest(orderId: string, interested: boolean): Promise<Order> {
    return this.updateOrder(orderId, { interested });
  },
 
  async updateOrderStatus(orderId: string, status: string, preparationTime?: number): Promise<Order> {
    return this.updateOrder(orderId, {
      status,
      preparationTime,
      ...(status === 'IN_PROGRESS' && { startTime: new Date() })
    });
  },
 
  async updateOrderNotes(orderId: string, notes: string): Promise<Order> {
    return this.updateOrder(orderId, { notes });
  },

  async resetAllData(): Promise<void> {
    try {
      localStorage.setItem('orders', JSON.stringify([]));
    } catch (error) {
      console.error('Error resetting data:', error);
      localStorage.setItem('orders', JSON.stringify([]));
    }
  }
 
 };
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/services/pos-service.ts
import { MenuItem, Order, QuickNote } from '@/types/pos';

interface PreferenceStore {
  [key: string]: unknown;
}

class PosService {
  private preferences: PreferenceStore = {};

  // Menu Item Operations
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await fetch('/api/pos/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fallback to localStorage
      const items = localStorage.getItem('menuItems');
      return items ? JSON.parse(items) : [];
    }
  }

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const response = await fetch('/api/pos/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create menu item');
      return await response.json();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const response = await fetch(`/api/pos/menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update menu item');
      return await response.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/pos/menu/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete menu item');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Order Operations
  async createOrder(orderData: Order): Promise<Order> {
    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      
      // Store in localStorage as backup
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('lastOrderNumber', orderData.orderNumber.toString());
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [orderData, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('lastOrderNumber', orderData.orderNumber.toString());
      return orderData;
    }
  }

  // Quick Note Operations
  async getQuickNotes(): Promise<QuickNote[]> {
    try {
      const response = await fetch('/api/pos/notes');
      if (!response.ok) throw new Error('Failed to fetch quick notes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quick notes:', error);
      // Fallback to localStorage
      const notes = localStorage.getItem('quickNotes');
      return notes ? JSON.parse(notes) : [];
    }
  }

  async createQuickNote(content: string): Promise<QuickNote> {
    try {
      const response = await fetch('/api/pos/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to create quick note');
      
      const note = await response.json();
      
      // Update localStorage
      const existingNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
      const updatedNotes = [...existingNotes, note];
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      
      return note;
    } catch (error) {
      console.error('Error creating quick note:', error);
      // Fallback to localStorage only
      const existingNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
      const newNote: QuickNote = { content, id: Date.now().toString(), userId: '' };
      const updatedNotes = [...existingNotes, newNote];
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      return newNote;
    }
  }

  // Preference Operations
  savePreference(key: string, value: unknown): void {
    this.preferences[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getPreference<T>(key: string, defaultValue: T | null = null): T | null {
    if (this.preferences[key] === undefined) {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        this.preferences[key] = JSON.parse(stored);
      } else {
        this.preferences[key] = defaultValue;
      }
    }
    return this.preferences[key] as T | null;
  }

  getAllPreferences(): PreferenceStore {
    return this.preferences;
  }
}

export const posService = new PosService();

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Get the token with explicit typing
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
      console.log(`[Middleware] Token exists: ${!!token}`);
    }

    // API route protection
    if (request.nextUrl.pathname.startsWith('/api')) {
      // Skip auth check for auth-related API routes
      if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
      }

      if (!token) {
        console.error('[Middleware] API Route - Unauthorized access attempt');
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access" }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.sub || '');
      requestHeaders.set('x-user-email', token.email as string || '');

      return NextResponse.next({
        headers: requestHeaders,
      });
    }

    // Auth page protection
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (token) {
        console.log('[Middleware] Auth Page - Redirecting authenticated user to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Dashboard protection
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!token) {
        console.log('[Middleware] Dashboard - Redirecting unauthenticated user to login');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Contact page protection
    if (request.nextUrl.pathname.startsWith('/contacts')) {
      if (!token) {
        console.log('[Middleware] Contacts - Redirecting unauthenticated user to login');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Public routes
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    
    // Handle errors gracefully
    if (request.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ error: "Internal server error" }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Redirect to error page for non-API routes
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    // Protected API routes
    '/api/:path*',
    // Auth pages
    '/auth/:path*',
    // Dashboard pages
    '/dashboard/:path*',
    // Contact pages
    "/api/contacts/:path*",

  ],
};
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/store/use-sidebar.ts
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
### /Users/mohameddiomande/Desktop/code/buf-crm/src/types/avatar.ts
import { AvatarProps as RadixAvatarProps } from "@radix-ui/react-avatar"

export interface AvatarProps extends RadixAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  status?: 'online' | 'offline' | 'busy' | 'away'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/types/contacts/index.ts
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type ContactStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface ContactListProps {
  searchQuery?: string;
  statusFilter?: string;
  sortOrder?: string;
  page?: number;
}

export interface ContactStats {
  total: number;
  newThisMonth: number;
  percentageChange: string;
  byStatus: {
    [key in ContactStatus]?: number;
  };
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/src/types/pos/index.ts
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  popular: boolean;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MilkOption {
  name: string;
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  flavor?: string;
  milk?: MilkOption;
}

export interface CustomerInfo {
  firstName: string;
  lastInitial: string;
  organization: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  notes?: string;
  status: string;
  total: number;
  interested?: boolean;
  isComplimentary: boolean;
  queueTime?: number;
  startTime: Date;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  preparationTime?: number;
}

export interface QuickNote {
  id: string;
  content: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}



________________________________________________________________________________
