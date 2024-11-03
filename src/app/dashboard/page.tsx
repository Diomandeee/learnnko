// src/app/dashboard/page.tsx

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
  BarChart2,
  Download,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { DataExport } from "@/components/contacts/data-export";

export const metadata: Metadata = {
  title: "Dashboard | BUF BARISTA CRM",
  description: "View your CRM analytics and insights",
};

const timeFrames = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "week",
    label: "This Week",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "quarter",
    label: "This Quarter",
  },
  {
    value: "year",
    label: "This Year",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const contacts = await getContacts();

  // Calculate statistics
  const stats = {
    totalContacts: contacts.length,
    newContacts: contacts.filter(c => c.status === 'NEW').length,
    convertedContacts: contacts.filter(c => c.status === 'CONVERTED').length,
    qualifiedLeads: contacts.filter(c => c.status === 'QUALIFIED').length,
  };

  // Calculate conversion rates and growth
  const conversionRate = stats.totalContacts > 0 
    ? ((stats.convertedContacts / stats.totalContacts) * 100).toFixed(1) 
    : "0.0";

  return (
    <PageContainer>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <DataExport contacts={contacts} />

            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>

          </div>
        </div>

        {/* Time Frame Filter */}
        <div className="flex items-center space-x-4">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              {timeFrames.map((timeFrame) => (
                <SelectItem key={timeFrame.value} value={timeFrame.value}>
                  {timeFrame.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </div>
              <div className="mt-4 h-[60px]">
                <BarChart2 className="h-[60px] w-full text-emerald-500/25" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Contacts
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newContacts}</div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  +10.5% from last month
                </p>
              </div>
              <div className="mt-4 h-[60px]">
                <BarChart2 className="h-[60px] w-full text-blue-500/25" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Qualified Leads
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </div>
              <div className="mt-4 h-[60px]">
                <BarChart2 className="h-[60px] w-full text-violet-500/25" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  +4.5% from last month
                </p>
              </div>
              <div className="mt-4 h-[60px]">
                <BarChart2 className="h-[60px] w-full text-orange-500/25" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Contact acquisition and conversion overview for the current period.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Contacts</CardTitle>
              <CardDescription>
                Your most recently added contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>
                Distribution of contact sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {/* Lead source distribution will go here */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Website</p>
                      <p className="text-sm text-muted-foreground">45%</p>
                    </div>
                    <div className="w-[100px] h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  {/* Add more lead sources */}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>
                Current status of all contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {/* Status distribution will go here */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">New</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.newContacts} contacts
                      </p>
                    </div>
                    <div className="w-[100px] h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ 
                          width: `${(stats.newContacts / stats.totalContacts) * 100}%` 
                        }} 
                      />
                    </div>
                  </div>
                  {/* Add more statuses */}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {/* Activity items will go here */}
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        New contact added
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  {/* Add more activity items */}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <ContactChart contacts={contacts} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/contacts/new">
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Contact
                </Button>
              </Link>
              <Link href="/dashboard/contacts">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  View All Contacts
                </Button>
              </Link>
  
            </div>
          </CardContent> 
        </Card>
      </div>
    </PageContainer>
  );
}