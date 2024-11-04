/* eslint-disable */
// @ts-nocheck
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DataTableLoading } from "@/components/contacts/data-table-loading";
import { ContactStats } from "@/types/contacts";

interface ContactsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    sort?: string;
    page?: string;
  };
}

async function getStats(): Promise<ContactStats> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  return getContactStats();
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const stats = await getStats();

  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div> 
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your contacts and leads effectively
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/contacts/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
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

        <Separator />

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Contacts</CardTitle>
            <CardDescription>
              Refine your contact list using the filters below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={searchParams.status ?? "all"}>
                  <SelectTrigger>
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

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium">Sort By</label>
                <Select defaultValue={searchParams.sort ?? "newest"}>
                  <SelectTrigger>
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

              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Search</label>
                <Search />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2">
                {parseFloat(stats.percentageChange) > 0 ? (
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <p className={cn(
                  "text-xs",
                  parseFloat(stats.percentageChange) > 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {stats.percentageChange}% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Contacts</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Added this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.byStatus?.QUALIFIED || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Active qualified leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0
                  ? ((stats.byStatus?.CONVERTED || 0) / stats.total * 100).toFixed(1)
                  : "0.0"}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall conversion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact List */}
        <Card>
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
            <CardDescription>
              A list of all your contacts including their status and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<DataTableLoading />}>
              <ContactList
                searchQuery={searchParams.search}
                statusFilter={searchParams.status}
                sortOrder={searchParams.sort}
                page={searchParams.page ? parseInt(searchParams.page) : 1}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}