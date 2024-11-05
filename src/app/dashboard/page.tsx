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
