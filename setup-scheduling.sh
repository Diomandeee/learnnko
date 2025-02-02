cat > src/components/coffee-shops/table/saved-filters/types.ts << 'EOF'
export interface SavedFilter {
  id: string
  name: string
    filters: Filter[]
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Filter {
  id: string
  field: string
  operator: string
  value: any
  type: string
  label: string
}

export interface SavedFilterInput {
  name: string
  filters: Filter[]
  isDefault?: boolean
}
EOF

# Create index file for saved filters
cat > src/components/coffee-shops/table/saved-filters/index.ts << 'EOF'
export * from './saved-filters-menu';
export * from './types';
EOF

# Create the API route
mkdir -p src/app/api/coffee-shops/filters
cat > src/app/api/coffee-shops/filters/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const filterSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  type: z.string(),
  label: z.string()
})

const savedFilterSchema = z.object({
  name: z.string().min(1, "Filter name is required"),
  filters: z.array(filterSchema),
  isDefault: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedFilters = await prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(savedFilters)
  } catch (error) {
    console.error("[SAVED_FILTERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch saved filters" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const json = await request.json()
    const { name, filters, isDefault } = savedFilterSchema.parse(json)

    // If setting as default, remove existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        filters,
        isDefault: isDefault || false,
        userId: user.id
      }
    })

    return NextResponse.json(savedFilter)
  } catch (error) {
    console.error("[SAVED_FILTERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save filter" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json(
        { error: "Filter ID is required" },
        { status: 400 }
      )
    }

    await prisma.savedFilter.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Filter deleted successfully" })
  } catch (error) {
    console.error("[SAVED_FILTERS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    )
  }
}
EOF

# Update the table-filters component to support saved filters
cat > src/components/coffee-shops/table/table-filters.tsx << 'EOF'
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search } from "lucide-react"
import { FILTER_CONFIGS, OPERATOR_LABELS } from "./filter-configs"
import { FilterValueInput } from "./filter-value-input"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShop } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { SavedFiltersMenu } from "./saved-filters"

interface TableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeFilters: any[]
  onAddFilter: (filter: any) => void
  onRemoveFilter: (id: string) => void
  onClearFilters: () => void
  savedFilters?: any[]
  onSaveFilter?: (name: string, isDefault: boolean) => Promise<void>
  onLoadFilter?: (filters: any[]) => void
}

export function TableFilters({
  searchTerm,
  onSearchChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
}: TableFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coffee shops..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter and Save Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          {onSaveFilter && onLoadFilter && (
            <SavedFiltersMenu
              activeFilters={activeFilters}
              savedFilters={savedFilters}
              onSave={onSaveFilter}
              onLoad={onLoadFilter}
            />
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-2 pl-2 pr-1 py-1"
            >
              <span>{filter.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-transparent"
                onClick={() => onRemoveFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </Card>
  )
}
EOF