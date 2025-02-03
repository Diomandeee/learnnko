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
// import { SavedFiltersMenu } from "./saved-filters/saved-filters-menu"

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

        // Apply default filter if exists and no active filters
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

  const handleSaveFilter = async (name: string, isDefault: boolean) => {
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          filters: activeFilters,
          isDefault
        })
      })

      if (!response.ok) throw new Error('Failed to save filter')

      const savedFilter = await response.json()
      setSavedFilters(prev => [savedFilter, ...prev])

      toast({
        title: "Success",
        description: "Filter saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive"
      })
    }
  }

  const handleDeleteFilter = async (id: string) => {
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete filter')

      setSavedFilters(prev => prev.filter(filter => filter.id !== id))

      toast({
        title: "Success",
        description: "Filter deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      })
    }
  }

  const handleLoadFilter = (filters) => {
    setActiveFilters(filters)
    setCurrentPage(1) // Reset to first page when loading new filters
  }

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
    
    if (aVal === bVal) return 0
    
    const compareResult = aVal > bVal ? 1 : -1
    return sortConfig.direction === 'asc' ? compareResult : -compareResult
  })

  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilters={activeFilters}
          onAddFilter={(filter) => setActiveFilters([...activeFilters, filter])}
          onRemoveFilter={(id) => setActiveFilters(activeFilters.filter(f => f.id !== id))}
          onClearFilters={() => setActiveFilters([])}
        />

      </div>

      <div className="flex justify-between items-center">
        <BulkActions
          selectedIds={selectedIds}
          onMailSelected={() => {/* Implement mail action */}}
          onDeleteSelected={async () => {
            await Promise.all(selectedIds.map(handleDelete))
            setSelectedIds([])
          }}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileCardView 
          shops={paginatedShops}
          onVisitToggle={async (shop) => {
            await handleUpdate(shop, 'visited', !shop.visited)
          }}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Desktop View */}
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

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={sortedShops.length}
      />
    </div>
  )
}