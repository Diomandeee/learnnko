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
        <h1 className="page-title">Contacts</h1>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>

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