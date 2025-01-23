"use client"

import { useMemo, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useVisits } from "@/hooks/use-visits"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function VisitedShops() {
  const { shops, loading: shopsLoading } = useShops()
  const { visits, loading: visitsLoading } = useVisits()
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")

  const visitedShops = useMemo(() => {
    if (!shops || !visits) return []

    const visitedShopsMap = shops
      .filter(shop => shop.visited)
      .map(shop => {
        const shopVisits = visits.filter(visit => visit.coffeeShopId === shop.id)
        const lastVisit = shopVisits.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]

        return {
          ...shop,
          visitCount: shopVisits.length,
          lastVisit,
          nextVisit: shopVisits.find(v => v.nextVisitDate && new Date(v.nextVisitDate) > new Date()),
        }
      })

    // Apply filters
    return visitedShopsMap.filter(shop => {
      const matchesSearch = 
        shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.area?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesArea = areaFilter === 'all' || shop.area === areaFilter

      return matchesSearch && matchesArea
    })
  }, [shops, visits, searchTerm, areaFilter])

  const areas = useMemo(() => {
    if (!shops) return []
    return Array.from(new Set(shops.map(shop => shop.area).filter(Boolean)))
  }, [shops])

  if (shopsLoading || visitsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search visited shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={areaFilter} onValueChange={setAreaFilter}>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coffee Shop</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Visit Count</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Scheduled</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitedShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.title}</TableCell>
                <TableCell>{shop.area}</TableCell>
                <TableCell>{shop.visitCount}</TableCell>
                <TableCell>
                  {shop.lastVisit ? (
                    format(new Date(shop.lastVisit.date), 'MMM d, yyyy')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {shop.nextVisit?.nextVisitDate ? (
                    format(new Date(shop.nextVisit.nextVisitDate), 'MMM d, yyyy')
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {shop.parlor_coffee_leads ? (
                    <Badge className="bg-yellow-500">Lead</Badge>
                  ) : (
                    <Badge variant="secondary">Visited</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visitedShops.length === 0 && (
              <TableRow>
                <TableCell colspan={6} className="text-center py-4">
                  No visited shops found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="pt-2 text-sm text-muted-foreground">
        Total visited shops: {visitedShops.length}
      </div>
    </div>
  )
}
