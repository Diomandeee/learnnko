"use client"

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { usePeople } from "@/hooks/use-people"

export function PeopleStats() {
  const { people } = usePeople()

  // Calculate stats
  const stats = {
    total: people?.length || 0,
    professional: people?.filter(p => p.emailType === 'professional').length || 0,
    generic: people?.filter(p => p.emailType === 'generic').length || 0,
    verified: people?.filter(p => p.verificationStatus === 'VALID').length || 0,
    withCompanies: people?.filter(p => !!p.company).length || 0,
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      <Card className="col-span-2 sm:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total People</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Professional Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.professional}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.professional / stats.total) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Generic Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.generic}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.generic / stats.total) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verified}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.verified / stats.total) * 100).toFixed(1)}% verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.withCompanies}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.withCompanies / stats.total) * 100).toFixed(1)}% assigned
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
