#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_colored() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

print_colored $BLUE "Making tables and stats more mobile-friendly..."

# Create mobile card view component
print_colored $BLUE "Creating mobile card view for tables..."
cat > "src/components/coffee-shops/mobile-card-view.tsx" << 'EOL'
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Mail, Phone, Building, Star, ChevronDown, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import Link from "next/link"

interface MobileCardViewProps {
  shops: CoffeeShop[]
  onVisitToggle: (shop: CoffeeShop) => Promise<void>
  onDelete: (id: string) => void
}

export function MobileCardView({ shops, onVisitToggle, onDelete }: MobileCardViewProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  return (
    <div className="space-y-4 md:hidden">
      {shops.map((shop) => (
        <Card key={shop.id} className="p-4">
          <CardContent className="p-0 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{shop.title}</h3>
                <p className="text-sm text-muted-foreground">{shop.area}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleExpand(shop.id)}
                >
                  {expandedCard === shop.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/coffee-shops/${shop.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onVisitToggle(shop)}>
                      <Star className="mr-2 h-4 w-4" />
                      Toggle Visit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete(shop.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={shop.visited ? "success" : "secondary"}>
                {shop.visited ? "Visited" : "Not Visited"}
              </Badge>
              {shop.is_source && <Badge>Partner</Badge>}
              {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
            </div>

            {/* Basic Details */}
            <div className="space-y-2 text-sm">
              {shop.volume && (
                <div>
                  <span className="text-muted-foreground">Volume:</span> {shop.volume}
                  <div className="text-xs text-muted-foreground">
                    ARR: ${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                  </div>
                </div>
              )}
              {shop.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{shop.rating}</span>
                  {shop.reviews && (
                    <span className="text-muted-foreground">
                      ({shop.reviews} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {expandedCard === shop.id && (
              <div className="pt-3 space-y-3 border-t">
                {shop.manager_present && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Manager: {shop.manager_present}</span>
                  </div>
                )}
                {shop.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${shop.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {shop.contact_email}
                    </a>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${shop.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {shop.phone}
                    </a>
                  </div>
                )}
                {/* Visit Dates */}
                <div className="space-y-1 text-sm">
                  {shop.first_visit && (
                    <div>
                      <span className="text-muted-foreground">First Visit:</span>{" "}
                      {format(new Date(shop.first_visit), 'MMM d, yyyy')}
                    </div>
                  )}
                  {shop.second_visit && (
                    <div>
                      <span className="text-muted-foreground">Second Visit:</span>{" "}
                      {format(new Date(shop.second_visit), 'MMM d, yyyy')}
                    </div>
                  )}
                  {shop.third_visit && (
                    <div>
                      <span className="text-muted-foreground">Third Visit:</span>{" "}
                      {format(new Date(shop.third_visit), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                {shop.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1">{shop.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
EOL

# Update coffee shops table component
print_colored $BLUE "Updating table component with mobile cards..."
cat > "src/components/coffee-shops/coffee-shops-table.tsx" << 'EOL'
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MobileCardView } from "./mobile-card-view"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Search,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"

const ITEMS_PER_PAGE = 10

export function CoffeeShopsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'title', direction: 'asc' })
  const { shops, mutate } = useCoffeeShops()

  // Sort and filter shops
  const filteredAndSortedShops = useMemo(() => {
    let result = [...(shops || [])]

    // Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(shop => 
        shop.title.toLowerCase().includes(searchLower) ||
        shop.area?.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1
      
      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

    return result
  }, [shops, searchTerm, sortConfig])

  // Pagination
  const paginatedShops = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedShops.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedShops, currentPage])

  const totalPages = Math.ceil(filteredAndSortedShops.length / ITEMS_PER_PAGE)

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleVisitToggle = async (shop) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visited: !shop.visited })
      })

      if (!response.ok) throw new Error('Failed to update visit status')

      toast({
        title: "Success",
        description: `${shop.title} marked as ${!shop.visited ? 'visited' : 'not visited'}`
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visit status",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/coffee-shops/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete shop')

      toast({
        title: "Success",
        description: "Coffee shop deleted successfully"
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coffee shop",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coffee shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <MobileCardView
        shops={paginatedShops}
        onVisitToggle={handleVisitToggle}
        onDelete={handleDelete}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('area')}
                >
                  Area
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('volume')}
                >
                  Volume
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>ARR</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/coffee-shops/${shop.id}`}
                    className="font-medium hover:underline"
                  >
                    {shop.title}
                  </Link>
                </TableCell>
                <TableCell>{shop.area}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant={shop.visited ? "success" : "secondary"}>
                      {shop.visited ? "Visited" : "Not Visited"}
                    </Badge>
                    {shop.is_source && <Badge>Partner</Badge>}
                    {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
                  </div>
                </TableCell>
                <TableCell>{shop.volume || "-"}</TableCell>
                <TableCell>
                  {shop.volume ? 
                    `$${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}` : 
                    "-"
                  }
                </TableCell>
                <TableCell>
                  {shop.third_visit ? format(new Date(shop.third_visit), 'MMM d, yyyy') :
                   shop.second_visit ? format(new Date(shop.second_visit), 'MMM d, yyyy') :
                   shop.first_visit ? format(new Date(shop.first_visit), 'MMM d, yyyy') :
                   "-"}
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
                        <Link href={`/dashboard/coffee-shops/${shop.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVisitToggle(shop)}>
                        Toggle Visit Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(shop.id)}
                      >
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{paginatedShops.length}</span>{" "}
          of{" "}
          <span className="font-medium">{filteredAndSortedShops.length}</span>{" "}
          results
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
EOL

# Update stats component for better mobile layout
print_colored $BLUE "Updating stats component..."
cat > "src/components/coffee-shops/coffee-shop-stats.tsx" << 'EOL'
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Users, UserCheck, Briefcase, DollarSign } from "lucide-react"

export function CoffeeShopStats() {
  const { shops } = useCoffeeShops()

  const stats = {
    total: shops?.length || 0,
    visited: shops?.filter(shop => shop.visited).length || 0,
    source: shops?.filter(shop => shop.is_source).length || 0,
    leads: shops?.filter(shop => shop.parlor_coffee_leads).length || 0,
    totalVolume: shops?.reduce((sum, shop) => {
      const volume = shop.volume ? parseFloat(shop.volume) : 0
      return sum + volume
    }, 0) || 0,
  }

  const estimatedAnnualRevenue = stats.totalVolume * 52 * 18

  const statCards = [
    {
      title: "Total Shops",
      value: stats.total,
      icon: Users,
      description: "Total locations tracked",
    },
    {
      title: "Visited",
      value: stats.visited,
      icon: UserCheck,
      description: `${((stats.visited / stats.total) * 100).toFixed(1)}% of total`,
    },
    {
      title: "Partners",
      value: stats.source,
      icon: Briefcase,
      description: `${stats.source} partner locations`,
    },
    {
      title: "Weekly Volume",
      value: stats.totalVolume.toFixed(1),
      icon: DollarSign,
      description: `$${estimatedAnnualRevenue.toLocaleString()} ARR`,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
EOL

# Add responsive utility function
print_colored $BLUE "Adding responsive utility..."
cat > "src/lib/hooks/use-media-query.ts" << 'EOL'
import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [query])

  return matches
}
EOL

# Update page layout with proper mobile padding
print_colored $BLUE "Updating page layout..."
cat > "src/app/dashboard/coffee-shops/page.tsx" << 'EOL'
import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"
import { CoffeeShopStats } from "@/components/coffee-shops/coffee-shop-stats"
import { PageContainer } from "@/components/layout/page-container"

export const metadata = {
  title: "Coffee Shops | Milk Man CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <PageContainer>
      <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
        <CoffeeShopHeader />
        <CoffeeShopStats />
        <CoffeeShopsTable />
      </div>
    </PageContainer>
  )
}
EOL

print_colored $GREEN "Mobile-friendly updates complete! 🎉"
print_colored $BLUE "Key improvements made:"
echo "1. Responsive card-based layout for mobile"
echo "2. Optimized stats display for all screen sizes"
echo "3. Improved table functionality with better mobile support"
echo "4. Added mobile-first padding and spacing"
echo "5. Enhanced touch targets for mobile users"
EOL

chmod +x update-mobile.sh