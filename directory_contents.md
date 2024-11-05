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
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  email     String     @unique
  name      String?
  password  String
  role      Role       @default(USER)
  contacts  Contact[]
  bio          String?
  phoneNumber  String?
  preferences  Json?
  notifications Json?
  activities   Activity[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId  // Add contactId field here
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/code/buf-crm/setup-buf-crm.sh
#!/bin/bash

cat > "src/app/dashboard/contacts/page.tsx" << 'EOF'
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
      <div className="space-y-4 px-2 md:space-y-6 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">Contacts</h1>
            <p className="text-xs text-muted-foreground md:text-base">
              Manage your contacts and leads effectively
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/contacts/new" className="flex-1 md:flex-none">
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">New Contact</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-2 md:my-4" />

        {/* Filters - Single column on mobile */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 p-4">
            <CardTitle className="text-base">Filter Contacts</CardTitle>
            <CardDescription className="text-xs">
              Refine your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Status</label>
                <Select value={params.status ?? "all"}>
                  <SelectTrigger className="h-8 text-xs">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Sort By</label>
                <Select value={params.sort}>
                  <SelectTrigger className="h-8 text-xs">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Search</label>
                <Search className="h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Single column on mobile */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{stats.total.toLocaleString()}</div>
              <div className="flex items-center space-x-1">
                {parseFloat(stats.percentageChange) > 0 ? (
                  <ArrowUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <p className={cn(
                  "text-[10px]",
                  parseFloat(stats.percentageChange) > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {stats.percentageChange}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">New</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{stats.newThisMonth.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Qualified</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">
                {(stats.byStatus?.QUALIFIED || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground">Active leads</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Conversion</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">
                {stats.total > 0
                  ? ((stats.byStatus?.CONVERTED || 0) / stats.total * 100).toFixed(1)
                  : "0.0"}%
              </div>
              <p className="text-[10px] text-muted-foreground">Overall rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact List */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 p-4">
            <CardTitle className="text-base">All Contacts</CardTitle>
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
EOF

echo "Updated contacts page with improved mobile responsiveness!"
echo "Key changes:"
echo "1. Stats cards now single column on mobile"
echo "2. Filters section optimized for mobile width"
echo "3. Reduced padding and margins to prevent horizontal scroll"
echo "4. Improved typography scaling"
echo "5. Better compact layout for mobile view"
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
      <div className="space-y-4 max-w-[500px] mx-auto px-2 md:max-w-full md:space-y-6 md:p-6">
        {/* Header remains the same */}
        {/* Header Section */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">Contacts</h1>
            <p className="text-xs text-muted-foreground md:text-base">
              Manage your contacts and leads effectively
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/contacts/new" className="flex-1 md:flex-none">
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">New Contact</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Selected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        
        <Separator className="my-2 md:my-4" />

        {/* Filters - More compact */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 p-3">
            <CardTitle className="text-base">Filter Contacts</CardTitle>
            <CardDescription className="text-xs">
              Refine your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-3">
            <div className="flex flex-col space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Status</label>
                <Select value={params.status ?? "all"}>
                  <SelectTrigger className="h-8 text-xs">
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

              <div className="space-y-1">
                <label className="text-xs font-medium">Sort By</label>
                <Select value={params.sort}>
                  <SelectTrigger className="h-8 text-xs">
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

              <div className="space-y-1">
                <label className="text-xs font-medium">Search</label>
                <Search/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Square layout */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="flex items-center space-x-1 mt-1">
                {parseFloat(stats.percentageChange) > 0 ? (
                  <ArrowUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <p className={cn(
                  "text-[10px]",
                  parseFloat(stats.percentageChange) > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {stats.percentageChange}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">New</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{stats.newThisMonth.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Qualified</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">
                {(stats.byStatus?.QUALIFIED || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Active leads</p>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium">Conversion</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">
                {stats.total > 0
                  ? ((stats.byStatus?.CONVERTED || 0) / stats.total * 100).toFixed(1)
                  : "0.0"}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Overall rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact List */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 p-3">
            <CardTitle className="text-base">All Contacts</CardTitle>
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
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Package,
  Search,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  Save,
  Coffee
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minThreshold: number
  maxThreshold: number
  unitCost: number
  lastRestocked: string
  supplier: string
  location: string
  notes: string
}

interface SortConfig {
  key: keyof InventoryItem
  direction: 'asc' | 'desc'
}

const InventoryManagement: React.FC = () => {
  // State Management
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  )
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Form state for new/edit item
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minThreshold: 0,
    maxThreshold: 0,
    unitCost: 0,
    supplier: '',
    location: '',
    notes: ''
  })

  // Categories derived from inventory items
  const categories = useMemo(() => {
    const uniqueCategories = new Set(inventory.map((item) => item.category))
    return ['All', ...Array.from(uniqueCategories)]
  }, [inventory])

  // Message helper - moved to the top before use
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Load inventory from localStorage
  const loadInventory = useCallback(() => {
    setIsLoading(true)
    try {
      const savedInventory = JSON.parse(
        localStorage.getItem('inventory') || '[]'
      ) as InventoryItem[]
      setInventory(savedInventory)
      setFilteredInventory(savedInventory)
      setError(null)
    } catch (err) {
      setError('Failed to load inventory data')
      console.error('Error loading inventory:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save inventory to localStorage
  const saveInventory = useCallback((items: InventoryItem[]) => {
    try {
      localStorage.setItem('inventory', JSON.stringify(items))
      setInventory(items)
      showMessage('Inventory saved successfully', 'success')
    } catch (err) {
      showMessage('Failed to save inventory', 'error')
      console.error('Error saving inventory:', err)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Filter and sort inventory
  useEffect(() => {
    let filtered = [...inventory]

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      return 0
    })

    setFilteredInventory(filtered)
  }, [inventory, selectedCategory, searchTerm, sortConfig])

  // Handle sort
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Add new item
  const handleAddItem = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minThreshold: 0,
      maxThreshold: 0,
      unitCost: 0,
      supplier: '',
      location: '',
      notes: '',
      lastRestocked: new Date().toISOString()
    })
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  // Edit item
  const handleEditItem = (item: InventoryItem) => {
    setFormData(item)
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // Delete item
  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (selectedItem) {
      const updatedInventory = inventory.filter(
        (item) => item.id !== selectedItem.id
      )
      saveInventory(updatedInventory)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
      showMessage('Item deleted successfully', 'success')
    }
  }

  // Save item (create/update)
  const handleSaveItem = () => {
    if (!formData.name || !formData.category) {
      showMessage('Name and category are required', 'error')
      return
    }

    const newItem: InventoryItem = {
      id: selectedItem?.id || Date.now().toString(),
      name: formData.name || '',
      category: formData.category || '',
      quantity: formData.quantity || 0,
      unit: formData.unit || '',
      minThreshold: formData.minThreshold || 0,
      maxThreshold: formData.maxThreshold || 0,
      unitCost: formData.unitCost || 0,
      supplier: formData.supplier || '',
      location: formData.location || '',
      notes: formData.notes || '',
      lastRestocked: selectedItem?.lastRestocked || new Date().toISOString()
    }

    const updatedInventory = selectedItem
      ? inventory.map((item) => (item.id === selectedItem.id ? newItem : item))
      : [...inventory, newItem]

    saveInventory(updatedInventory)
    setIsModalOpen(false)
    showMessage(
      `Item ${selectedItem ? 'updated' : 'added'} successfully`,
      'success'
    )
  }

  // Export inventory
  const handleExport = () => {
    const dataStr = JSON.stringify(inventory, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = 'inventory-data.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    showMessage('Inventory exported successfully', 'success')
  }

  // Import inventory
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          saveInventory(importedData)
          showMessage('Inventory imported successfully', 'success')
        } catch (err) {
          showMessage('Failed to import inventory data', 'error')
          console.error('Error importing inventory:', err)
        }
      }
      reader.readAsText(file)
    }
  }

  // Check low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minThreshold)
  }, [inventory])

  return (
    <PageContainer>
    <div className="inventory-container">
        <h1 className="page-title">Inventory Management</h1>
      <header className="header">
        <div className="header-actions">
          <button onClick={handleAddItem} className="add-button">
            <Plus size={16} /> Add Item
          </button>
          <button onClick={handleExport} className="export-button">
            <Download size={16} /> Export
          </button>
          <label className="import-button">
            <Upload size={16} /> Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={loadInventory} className="refresh-button">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {isLoading && <div className="loading">Loading inventory data...</div>}
      {error && (
        <div className="error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="filters">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <AlertCircle size={16} />
          <span>{lowStockItems.length} item(s) are running low on stock</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className="view-all-button"
          >
            View All
          </button>
        </div>
      )}

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('category')}>
                Category{' '}
                {sortConfig.key === 'category' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('quantity')}>
                Quantity{' '}
                {sortConfig.key === 'quantity' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('minThreshold')}>
                Min Threshold{' '}
                {sortConfig.key === 'minThreshold' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('unitCost')}>
                Unit Cost{' '}
                {sortConfig.key === 'unitCost' && <ArrowUpDown size={16} />}
              </th>
              <th onClick={() => handleSort('supplier')}>
                Supplier{' '}
                {sortConfig.key === 'supplier' && <ArrowUpDown size={16} />}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                className={
                  item.quantity <= item.minThreshold ? 'low-stock' : ''
                }
              >
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.minThreshold}</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td>{item.supplier}</td>
                <td className="actions">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="edit-button"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="delete-button"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedItem ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={formData.unit || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., kg, lbs, pcs"
                />
              </div>

              <div className="form-group">
                <label>Min Threshold</label>
                <input
                  type="number"
                  value={formData.minThreshold || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minThreshold: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Max Threshold</label>
                <input
                  type="number"
                  value={formData.maxThreshold || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxThreshold: parseInt(e.target.value)
                    })
                  }
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Unit Cost ($)</label>
                <input
                  type="number"
                  value={formData.unitCost || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitCost: parseFloat(e.target.value)
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setIsModalOpen(false)}
                className="cancel-button"
              >
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSaveItem} className="save-button">
                <Save size={16} /> Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cancel-button"
              >
                <X size={16} /> Cancel
              </button>
              <button onClick={confirmDelete} className="delete-button">
                <Trash2 size={16} /> Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="quick-actions">
        <Link href="/pos" className="action-button">
          <Coffee size={20} /> New Order
        </Link>
      </div>

      
    </div>
    </PageContainer>
  )
}

export default InventoryManagement

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
  AlertTriangle
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import Link from 'next/link'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  customerName: string
  status: string
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
  const [isEditing, setIsEditing] = useState(false)
  const [showEditConfirmation, setShowEditConfirmation] = useState(false)

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

  // Load orders from localStorage
  const loadOrders = useCallback(() => {
    setIsLoading(true)
    setError(null)
    try {
      const loadedOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      ) as Order[]
      setOrders(loadedOrders)
      setAllOrders(loadedOrders)
      setFilteredOrders(loadedOrders)
    } catch (err) {
      setError('Failed to load orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter and sort orders based on search criteria and filters
  const filterAndSortOrders = useCallback(() => {
    let filtered = orders

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply search filters
    if (searchFilters.customerName) {
      filtered = filtered.filter((order) =>
        order.customerName
          .toLowerCase()
          .includes(searchFilters.customerName.toLowerCase())
      )
    }

    if (searchFilters.orderId) {
      filtered = filtered.filter((order) =>
        order.id.toString().includes(searchFilters.orderId)
      )
    }

    if (searchFilters.itemName) {
      filtered = filtered.filter((order) =>
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchFilters.itemName.toLowerCase())
        )
      )
    }

    // Apply date range filter
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

  // Handle order notes
  const updateOrderNotes = (orderId: number, notes: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, notes } : order
    )
    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Order notes updated successfully', 'success')
  }

  // Calculate new total based on items
  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Handle item editing
  const updateOrderItem = (
    orderId: number,
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
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus }
        if (newStatus === 'Completed' && order.startTime) {
          const endTime = new Date()
          const startTime = new Date(order.startTime)
          updatedOrder.preparationTime =
            (endTime.getTime() - startTime.getTime()) / 1000
        }
        return updatedOrder
      }
      return order
    })

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Order status updated successfully', 'success')
  }

  // Lead interest tracking
  const recordLeadInterest = (orderId: number, interested: boolean) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, leadInterest: interested } : order
    )

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    showMessage('Lead interest recorded successfully', 'success')
  }

  // Order cancellation
  const cancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.filter((order) => order.id !== orderId)
      setOrders(updatedOrders)
      const updatedAllOrders = allOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
      setAllOrders(updatedAllOrders)
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      showMessage('Order cancelled successfully', 'success')
    }
  }

  // Order modification
  const modifyOrder = (orderId: number) => {
    const orderToModify = orders.find((order) => order.id === orderId)
    if (orderToModify) {
      setSelectedOrder(orderToModify)
      setEditedItems([...orderToModify.items])
      setOrderNotes(orderToModify.notes || '')
      setIsEditing(true)
      setShowOrderDetails(true)
    }
  }

  // Save modified order
  const saveModifiedOrder = () => {
    if (!selectedOrder) return

    const modifiedOrder = {
      ...selectedOrder,
      items: editedItems,
      notes: orderNotes,
      total: calculateTotal(editedItems)
    }

    const updatedOrders = orders.map((order) =>
      order.id === modifiedOrder.id ? modifiedOrder : order
    )

    setOrders(updatedOrders)
    setAllOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    setShowOrderDetails(false)
    setSelectedOrder(null)
    setIsEditing(false)
    showMessage('Order updated successfully', 'success')
  }

  // Time formatting
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // PDF generation
  const generatePDF = () => {
    // eslint-disable-next-line new-cap
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
        order.id,
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
  const clearAllOrders = () => {
    setShowClearConfirmation(true)
  }

  const confirmClearAllOrders = () => {
    const clearedOrders = allOrders.map((order) =>
      orders.some((activeOrder) => activeOrder.id === order.id)
        ? { ...order, status: 'Cleared' }
        : order
    )
    setAllOrders(clearedOrders)
    setOrders([])
    setFilteredOrders([])
    localStorage.setItem('orders', JSON.stringify([]))
    setShowClearConfirmation(false)
    showMessage('All orders cleared successfully', 'success')
  }

  const cancelClearAllOrders = () => {
    setShowClearConfirmation(false)
  }

  const resetAllData = () => {
    setShowResetConfirmation(true)
  }

  const confirmResetAllData = () => {
    localStorage.clear()
    setOrders([])
    setAllOrders([])
    setFilteredOrders([])
    setShowResetConfirmation(false)
    showMessage('All data reset successfully', 'success')
    window.location.reload()
  }

  const cancelResetAllData = () => {
    setShowResetConfirmation(false)
  }

  const exportData = () => {
    const data = {
      orders: allOrders,
      preferences: JSON.parse(
        localStorage.getItem('systemPreferences') || '{}'
      ),
      inventory: JSON.parse(localStorage.getItem('inventory') || '[]')
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'buf-barista-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showMessage('Data exported successfully', 'success')
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          localStorage.setItem('orders', JSON.stringify(data.orders))
          localStorage.setItem(
            'systemPreferences',
            JSON.stringify(data.preferences)
          )
          localStorage.setItem('inventory', JSON.stringify(data.inventory))
          loadOrders()
          showMessage('Data imported successfully', 'success')
        } catch (error) {
          showMessage(
            'Error importing data. Please check the file format.',
            'error'
          )
        }
      }
      reader.readAsText(file)
    }
  }

  const toggleEditNotes = (orderId: number) => {
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

        {/* <button onClick={loadOrders} className="refresh-button">
          <RefreshCw size={16} />
          Refresh Orders
        </button> */}

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
            {order.status === 'Completed' &&
              order.leadInterest === undefined && (
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
                  setIsEditing(false)
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

      {/* Navigation */}
      <div className="nav-buttons">
        <Link href="/pos" passHref>
          <button className="nav-button">Go to POS</button>
        </Link>
        <Link href="/" passHref>
          <button className="nav-button">Go to Reports</button>
        </Link>

      </div>


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
  ArrowUpRight,
  Users,
  UserPlus,
  UserCheck,
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

  const conversionRate = stats.totalContacts > 0 
    ? ((stats.convertedContacts / stats.totalContacts) * 100).toFixed(1) 
    : "0.0";

  return (
    <PageContainer>
      <div className="space-y-4 max-w-[500px] mx-auto px-2 md:max-w-full md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h2>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium md:text-sm">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-500">+20.1%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium md:text-sm">New</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{stats.newContacts}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-500">+10.5%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium md:text-sm">Qualified</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-500">+12.3%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="aspect-square overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
              <CardTitle className="text-xs font-medium md:text-sm">Conversion</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center h-[calc(100%-48px)] p-3">
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-500">+4.5%</p>
              </div>
            </CardContent>
          </Card>
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
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import {Button} from '../../../components/ui/button'
import { format } from 'date-fns'
import { PageContainer } from "@/components/layout/page-container";
import './styles.css';

// Types
interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  popular: boolean
}

interface MilkOption {
  name: string
  price: number
}

interface CartItem extends MenuItem {
  quantity: number
  flavor?: string
  milk?: MilkOption
}

interface CustomerInfo {
  firstName: string
  lastInitial: string
  organization: string
  email: string
  phone: string
}

// Constants
const menuItems = [
  { id: 1, name: 'Espresso', price: 2.5, category: 'Coffee', popular: true },
  { id: 2, name: 'Americano', price: 3.0, category: 'Coffee', popular: false },
  { id: 3, name: 'Latte', price: 3.5, category: 'Coffee', popular: true },
  { id: 4, name: 'Cappuccino', price: 3.5, category: 'Coffee', popular: true },
  {
    id: 5,
    name: 'Flat White',
    price: 3.5,
    category: 'Coffee',
    popular: false
  },
  { id: 6, name: 'Cortado', price: 3.5, category: 'Coffee', popular: false },
  {
    id: 7,
    name: 'Caramel Crunch Crusher',
    price: 4.5,
    category: 'Specialty',
    popular: true
  },
  {
    id: 8,
    name: 'Vanilla Dream Latte',
    price: 4.5,
    category: 'Specialty',
    popular: false
  },
  {
    id: 9,
    name: 'Hazelnut Heaven Cappuccino',
    price: 4.5,
    category: 'Specialty',
    popular: false
  }
]

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
  const [runningTotal, setRunningTotal] = useState(0)
  const [quickNotes, setQuickNotes] = useState<string[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] =
    useState(false)
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedMilk, setSelectedMilk] = useState(milkOptions[0])
  const [showPopular, setShowPopular] = useState(false)

  // Load saved quick notes
  useEffect(() => {
    const savedQuickNotes = localStorage.getItem('quickNotes')
    if (savedQuickNotes) {
      setQuickNotes(JSON.parse(savedQuickNotes))
    }
  }, [])

  // Save quick notes
  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(quickNotes))
  }, [quickNotes])

  const categories = useMemo(
    () => ['All', ...new Set(menuItems.map((item) => item.category))],
    []
  )

  useEffect(() => {
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

    setQueueStartTime(new Date())
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    document.body.classList.toggle('dark-mode', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem(
      'complimentaryMode',
      JSON.stringify(isComplimentaryMode)
    )
  }, [isComplimentaryMode])

  // Helper functions and callbacks
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

    const itemTotal = selectedItem.price + selectedMilk.price
    setRunningTotal((prev) => prev + itemTotal)

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
      const item = newCart[index]
      const itemTotal = item.price + (item.milk?.price || 0)

      if (item.quantity > 1) {
        newCart[index] = { ...item, quantity: item.quantity - 1 }
      } else {
        newCart.splice(index, 1)
      }

      setRunningTotal((prev) => prev - itemTotal)
      return newCart
    })
  }, [])

  const increaseQuantity = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      const item = newCart[index]
      const itemTotal = item.price + (item.milk?.price || 0)

      newCart[index] = { ...item, quantity: item.quantity + 1 }
      setRunningTotal((prev) => prev + itemTotal)
      return newCart
    })
  }, [])

  const calculateTotal = useCallback(() => {
    return isComplimentaryMode
      ? 0
      : cart
          .reduce(
            (sum, item) =>
              sum + (item.price + (item.milk?.price || 0)) * item.quantity,
            0
          )
          .toFixed(2)
  }, [cart, isComplimentaryMode])

  const handlePlaceOrder = useCallback(() => {
    if (cart.length === 0) return
    setIsModalOpen(true)
  }, [cart])

  const addQuickNote = useCallback((note: string) => {
    setOrderNotes((prev) => (prev ? `${prev}\n${note}` : note))
  }, [])

  const saveQuickNote = useCallback(
    (note: string) => {
      if (note && !quickNotes.includes(note)) {
        setQuickNotes((prev) => [...prev, note])
        showNotification('Quick note saved!')
      }
    },
    [quickNotes, showNotification]
  )

  const confirmOrder = useCallback(() => {
    if (!customerInfo.firstName || !customerInfo.lastInitial) return

    const orderStartTime = new Date()
    const newOrder = {
      id: orderNumber,
      customerName: `${customerInfo.firstName} ${customerInfo.lastInitial}.`,
      customerInfo: { ...customerInfo },
      items: [...cart],
      notes: orderNotes,
      timestamp: orderStartTime.toLocaleString(),
      status: 'Pending',
      total: calculateTotal(),
      isComplimentary: isComplimentaryMode,
      queueTime: queueStartTime
        ? (orderStartTime.getTime() - queueStartTime.getTime()) / 1000
        : 0,
      startTime: orderStartTime
    }

    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = [newOrder, ...existingOrders]
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    localStorage.setItem('lastOrderNumber', orderNumber.toString())

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
    setRunningTotal(0)
    setIsModalOpen(false)
    showNotification('Order placed successfully!')
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
    [selectedCategory, searchTerm, showPopular]
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

      {/* Quick Note Modal */}
      {isQuickNoteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Add Quick Note</h3>
            <textarea
              placeholder="Enter a quick note to save for future use..."
              className="modal-textarea"
              id="quickNoteInput"
            />
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
### /Users/mohameddiomande/Desktop/code/buf-crm/src/app/dashboard/sales/page.tsx
"use client"
import { PageContainer } from "@/components/layout/page-container";

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
  isSameDay
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
import './styles.css';

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

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82ca9d',
  '#ffc658'
]

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

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders'>(
    'sales'
  )

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const storedOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      ) as Order[]
      setOrders(storedOrders)
    } catch (err) {
      setError('Failed to fetch orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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

  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange()
    return orders.filter((order) => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= start && orderDate <= end
    })
  }, [orders, getDateRange])

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

  const calculateMovingAverage = (data: number[], periods: number) => {
    return data.map((_, index) => {
      const start = Math.max(0, index - periods + 1)
      const values = data.slice(start, index + 1)
      return values.reduce((sum, val) => sum + val, 0) / values.length
    })
  }

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
  }, [salesData])
  // Add a helper function to format time in minutes:seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
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

  const preparationTimeVsOrderValue = useMemo(() => {
    return filteredOrders
      .filter((order) => order.preparationTime !== undefined)
      .map((order) => ({
        preparationTime: order.preparationTime || 0,
        orderValue: order.total
      }))
  }, [filteredOrders])

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

  const averageItemsPerOrder = useMemo(() => {
    const totalItems = filteredOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    )
    return totalOrders > 0 ? totalItems / totalOrders : 0
  }, [filteredOrders, totalOrders])

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

  // New metrics
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
      : 100 // If previous period had no sales, consider it 100% growth
  }, [filteredOrders, orders, getDateRange])

  // New charts data
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
  const generateCSV = useCallback(() => {
    // Prepare CSV headers
    const headers = [
      'Date',
      'Total Sales ($)',
      'Orders',
      'Average Order Value ($)',
      'Unique Customers',
      'Preparation Time (min:sec)',
      'Items Sold'
    ]

    // Prepare daily data
    const csvData = dailySalesAndOrders.map((day) => {
      const dayOrders = filteredOrders.filter((order) =>
        isSameDay(new Date(order.timestamp), new Date(day.date))
      )

      const dayUniqueCustomers = new Set(
        dayOrders.map((order) => order.customerName)
      ).size

      const dayAvgOrderValue = day.sales / (day.orders || 1)

      const dayPrepTime = dayOrders
        .filter((order) => order.preparationTime)
        .reduce(
          (avg, order, _, arr) =>
            avg + (order.preparationTime || 0) / (arr.length || 1),
          0
        )

      const dayItemsSold = dayOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      )

      return [
        day.date,
        day.sales.toFixed(2),
        day.orders,
        dayAvgOrderValue.toFixed(2),
        dayUniqueCustomers,
        formatTime(dayPrepTime),
        dayItemsSold
      ]
    })

    // Add summary data
    const summaryData = [
      ['Summary Statistics'],
      ['Total Period Sales ($)', totalSales.toFixed(2)],
      ['Total Orders', totalOrders],
      ['Average Order Value ($)', averageOrderValue.toFixed(2)],
      ['Unique Customers', uniqueCustomers],
      ['Customer Retention Rate (%)', customerRetentionRate.toFixed(2)],
      ['Average Preparation Time', formatTime(averagePreparationTime)],
      ['Repeat Customer Rate (%)', repeatCustomerRate.toFixed(2)],
      ['Sales Growth Rate (%)', salesGrowthRate.toFixed(2)],
      [''],
      ['Top Selling Items'],
      ['Item Name', 'Quantity Sold', 'Revenue ($)'],
      ...topSellingItems.map((item) => [
        item.name,
        item.quantity,
        item.revenue.toFixed(2)
      ]),
      [''],
      ['Sales by Category'],
      ['Category', 'Total Sales ($)'],
      ...salesByCategory.map((category) => [
        category.name,
        category.value.toFixed(2)
      ])
    ]

    // Combine all data
    const allRows = [
      ['Daily Sales Report'],
      [
        `Report Period: ${format(
          getDateRange().start,
          'yyyy-MM-dd'
        )} to ${format(getDateRange().end, 'yyyy-MM-dd')}`
      ],
      [''],
      headers,
      ...csvData,
      [''],
      ...summaryData
    ]

    // Convert to CSV string
    const csvContent = allRows.map((row) => row.join(',')).join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spin" />
        <p>Loading report data...</p>
      </div>
    )
  }

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
              startDate={customStartDate}
              endDate={customEndDate}
              maxDate={new Date()}
              placeholderText="Start Date"
              className="custom-date-input"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              selectsEnd
              startDate={customStartDate}
              endDate={customEndDate}
              minDate={customStartDate}
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
              onClick={() => setSelectedMetric('orders')}
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
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
  ListOrdered,
  ServerCrash,
  Trash,

} from "lucide-react";

import { 
  FaChartLine as SalesIcon,
  FaCashRegister as PosIcon,
  FaClipboardList as OrdersIcon,
  FaTrash as WasteIcon,
  FaBoxes as InventoryIcon,
  FaFileAlt as ReportsIcon 
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
    icon: SalesIcon, // Replace with the actual icon you want for Sales
    href: "/dashboard/sales",
    color: "text-red-500"
  },
  {
    label: "POS",
    icon: PosIcon, // Replace with the actual icon you want for POS
    href: "/dashboard/pos",
    color: "text-blue-500"
  },
  {
    label: "Orders",
    icon: OrdersIcon, // Replace with the actual icon you want for Orders
    href: "/dashboard/order",
    color: "text-green-500"
  },
  {
    label: "Waste",
    icon: WasteIcon, // Replace with the actual icon you want for Waste
    href: "/dashboard/waste",
    color: "text-yellow-500"
  },

  {
    label: "Inventory",
    icon: InventoryIcon, // Replace with the actual icon you want for Inventory
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
        isCollapsed ? "w-[70px]" : "w-60",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex h-16 items-center justify-between px-3 border-b">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              <span className="font-bold">BUF BARISTA</span>
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

        <div className="p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/contacts/new">
                  <Button size="icon" className="w-full">
                    <PlusCircle className="h-5 w-5" />
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
                <PlusCircle className="mr-2 h-5 w-5" />
                New Contact
              </Button>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-2">
            {routes.map((route) => (
              isCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <route.icon className={cn("h-5 w-5", route.color)} />
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
                    "flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <route.icon className={cn("mr-2 h-5 w-5", route.color)} />
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
    total: 1200,
  },
  {
    name: "Feb",
    total: 1600,
  },
  {
    name: "Mar",
    total: 1400,
  },
  {
    name: "Apr",
    total: 1800,
  },
  {
    name: "May",
    total: 2200,
  },
  {
    name: "Jun",
    total: 2600,
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
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
          "p-1",
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
### /Users/mohameddiomande/Desktop/code/buf-crm/src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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
