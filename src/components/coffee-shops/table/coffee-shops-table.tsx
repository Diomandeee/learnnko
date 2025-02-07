"use client"

import { useState, useCallback, useEffect } from "react"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { CoffeeShop } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { TableFilters } from "./table-filters"
import { TableHeader as CustomTableHeader } from "./table-header"
import { TableRow as CustomTableRow } from "./table-row"
import { TablePagination } from "./table-pagination"
import { BulkActions } from "./bulk-actions"
import { MobileCardView } from "./mobile-card-view"
import { VisitReport } from "./visit-reports"
import { TableExport } from "./table-export"

const ITEMS_PER_PAGE = 50;

interface CoffeeShopsTableProps {
  shops: CoffeeShop[]
}

export function CoffeeShopsTable({ shops }: CoffeeShopsTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState([])
  const [savedFilters, setSavedFilters] = useState([])
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CoffeeShop | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc'
  })

  // Load saved filters on mount
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)

        const defaultFilter = data.find(filter => filter.isDefault)
        if (defaultFilter && activeFilters.length === 0) {
          setActiveFilters(defaultFilter.filters)
        }
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  const handleSort = useCallback((key: keyof CoffeeShop) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const handleUpdate = useCallback(async (shop: CoffeeShop, field: keyof CoffeeShop, value: any) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })

      if (!response.ok) throw new Error('Failed to update shop')

      toast({
        title: "Success",
        description: "Coffee shop updated successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/coffee-shops/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete shop')

      toast({
        title: "Success",
        description: "Coffee shop deleted successfully"
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coffee shop",
        variant: "destructive"
      })
    }
  }, [toast])

  const filteredShops = shops.filter(shop => {
    if (searchTerm && !shop.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return !activeFilters.some(filter => {
      const value = shop[filter.field]
      switch (filter.operator) {
        case 'equals':
          return value !== filter.value
        case 'contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'greaterThan':
          return Number(value) <= Number(filter.value)
        case 'lessThan':
          return Number(value) >= Number(filter.value)
        case 'between':
          return Number(value) < Number(filter.value.min) || Number(value) > Number(filter.value.max)
        default:
          return false
      }
    })
  })

  const sortedShops = [...filteredShops].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    // Special handling for date fields
    if (['first_visit', 'second_visit', 'third_visit'].includes(sortConfig.key)) {
      // Handle null/undefined values - always put them at the bottom
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move a to the bottom
      if (!bVal) return -1 // Move b to the bottom

      // Compare actual dates
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()

      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1

      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    // Handle numeric fields
    if (['volume', 'rating', 'reviews', 'followers', 'priority'].includes(sortConfig.key)) {
      const aNum = Number(aVal)
      const bNum = Number(bVal)

      // Handle NaN values
      if (isNaN(aNum) && isNaN(bNum)) return 0
      if (isNaN(aNum)) return 1
      if (isNaN(bNum)) return -1

      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
    }

    // Default string comparison
    const aStr = String(aVal || '').toLowerCase()
    const bStr = String(bVal || '').toLowerCase()
    
    if (aStr === bStr) return 0
    if (!aVal) return 1  // Move empty values to the bottom
    if (!bVal) return -1

    const compareResult = aStr > bStr ? 1 : -1
    return sortConfig.direction === 'asc' ? compareResult : -compareResult
  })

  // Apply pagination after sorting
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilters={activeFilters}
          onAddFilter={(filter) => setActiveFilters([...activeFilters, filter])}
          onRemoveFilter={(id) => setActiveFilters(activeFilters.filter(f => f.id !== id))}
          onClearFilters={() => setActiveFilters([])}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BulkActions
            selectedIds={selectedIds}
            onMailSelected={() => {/* Implement mail action */}}
            onDeleteSelected={async () => {
              await Promise.all(selectedIds.map(handleDelete))
              setSelectedIds([])
            }}
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VisitReport />
          <TableExport data={shops} />
        </div>
      </div>

      <div className="block md:hidden">
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p>Showing {paginatedShops.length} of {sortedShops.length} shops</p>
            {selectedIds.length > 0 && (
              <p className="text-muted-foreground">
                {selectedIds.length} selected
              </p>
            )}
          </div>
          
          <MobileCardView 
            shops={paginatedShops}
            onVisitToggle={async (shop) => {
              await handleUpdate(shop, 'visited', !shop.visited)
            }}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      <div className="hidden md:block border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <CustomTableHeader 
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedAll={selectedIds.length === paginatedShops.length}
                onSelectAll={(checked) => {
                  setSelectedIds(
                    checked 
                      ? paginatedShops.map(shop => shop.id)
                      : []
                  )
                }}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShops.map((shop) => (
              <CustomTableRow
                key={shop.id}
                shop={shop}
                isSelected={selectedIds.includes(shop.id)}
                onSelect={(checked) => {
                  setSelectedIds(prev => 
                    checked 
                      ? [...prev, shop.id]
                      : prev.filter(id => id !== shop.id)
                  )
                }}
                onUpdate={(field, value) => handleUpdate(shop, field, value)}
                onDelete={() => handleDelete(shop.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={sortedShops.length}
        />
      </div>
    </div>
  )
}