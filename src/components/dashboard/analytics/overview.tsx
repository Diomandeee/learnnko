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
