// src/components/coffee-shops/coffee-shops-table.tsx
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, XCircle, Calendar as CalendarIcon, ListFilter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CoffeeShop } from "@prisma/client"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/layout/page-container";

const ITEMS_PER_PAGE = 1000
type SortConfig = { key: keyof CoffeeShop | null; direction: 'asc' | 'desc' }

// Advanced filtering types
type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'followers'
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterDataType
  operators: FilterOperator[]
}

interface ActiveFilter {
  id: string
  field: keyof CoffeeShop
  operator: FilterOperator
  value: string | number | boolean | Date | null
  secondValue?: string | number | Date | null
}

// Filter configurations for each field type
const FILTER_CONFIGS: FilterConfig[] = [
  {
    field: 'title',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith']
  },
  {
    field: 'area',
    label: 'Area',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'first_visit',
    label: 'First Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'second_visit',
    label: 'Second Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'third_visit',
    label: 'Third Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'followers',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'visited',
    label: 'Visited Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'parlor_coffee_leads',
    label: 'Lead Status',
    type: 'boolean',
    operators: ['equals']
  }
]

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  between: 'Between',
  startsWith: 'Starts with'
}

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
}

function DateCell({ date, onUpdate }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDateSelect = async (newDate: Date | null) => {
    setIsUpdating(true)
    try {
      await onUpdate(newDate)
      setIsOpen(false)
    } finally {
      setIsUpdating(false)
    }
  }

  return (

    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
          disabled={isUpdating}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Not set</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={handleDateSelect}
          disabled={isUpdating}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Filter value input component based on filter type
function FilterValueInput({ 
  type, 
  value, 
  onChange, 
  operator 
}: { 
  type: FilterDataType
  value: any
  onChange: (value: any) => void
  operator: FilterOperator
}) {
  switch (type) {
    case 'date':
      return (
        <div className="flex flex-col space-y-2">
          <Calendar
            mode={operator === 'between' ? "range" : "single"}
            selected={value}
            onSelect={onChange}
            className="rounded-md border"
          />
        </div>
      )
    
    case 'boolean':
      return (
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="true">Yes</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="false">No</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      )
    
    case 'number':
    case 'rating':
    case 'followers':
      return operator === 'between' ? (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={value?.min ?? ''}
            onChange={e => onChange({ ...value, min: e.target.value })}
            className="w-20"
            placeholder="Min"
          />
          <span>to</span>
          <Input
            type="number"
            value={value?.max ?? ''}
            onChange={e => onChange({ ...value, max: e.target.value })}
            className="w-20"
            placeholder="Max"
          />
        </div>
      ) : (
        <Input
          type="number"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full"
        />
      )
    
    default:
      return (
        <Input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full"
        />
      )
  }
}

export function CoffeeShopsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const { shops, loading, error, mutate } = useCoffeeShops()

  const handleAddFilter = (filter: ActiveFilter) => {
    setActiveFilters(prev => [...prev, { ...filter, id: crypto.randomUUID() }])
  }

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const handleClearFilters = () => {
    setActiveFilters([])
  }

  const filteredShops = useMemo(() => {
    if (!shops) return []

    return shops.filter(shop => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.area?.toLowerCase().includes(searchTerm.toLowerCase())

      // Active filters
      const matchesFilters = activeFilters.every(filter => {
        const value = shop[filter.field]

        switch (filter.operator) {
          case 'equals':
            if (filter.type === 'boolean') {
              return value === (filter.value === 'true')
            }
            return value === filter.value
          
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          
          case 'greaterThan':
            if (filter.type === 'date') {
              return new Date(value) > new Date(filter.value)
            }
            return Number(value) > Number(filter.value)
          
          case 'lessThan':
            if (filter.type === 'date') {
              return new Date(value) < new Date(filter.value)
            }
            return Number(value) < Number(filter.value)
          
          case 'between':
            if (filter.type === 'date') {
              const date = new Date(value)
              return date >= new Date(filter.value.min) && date <= new Date(filter.value.max)
            }
            return Number(value) >= Number(filter.value.min) && Number(value) <= Number(filter.value.max)
          
          default:
            return true
        }
      })

      return matchesSearch && matchesFilters
    })
  }, [shops, searchTerm, activeFilters])

  const sortedShops = useMemo(() => {
    if (!sortConfig.key) return filteredShops

    return [...filteredShops].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Date comparison
      if (sortConfig.key.includes('visit')) {
        const aDate = aValue ? new Date(aValue).getTime() : 0
        const bDate = bValue ? new Date(bValue).getTime() : 0
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
      }

      // Regular comparison
      const comparison = 
        typeof aValue === 'string' 
          ? aValue.localeCompare(String(bValue))
          : Number(aValue) - Number(bValue)

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredShops, sortConfig])

  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)

  const handleDateUpdate = async (
    shop: CoffeeShop, 
    field: 'first_visit' | 'second_visit' | 'third_visit', 
    date: Date | null
  ) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: date?.toISOString(),
          // If setting first visit, also update visited status
          ...(field === 'first_visit' && date && !shop.visited ? { visited: true } : {})
        }),
      })

      if (!response.ok) throw new Error(`Failed to update ${field}`)

      toast({
        title: "Visit date updated",
        description: `${shop.title} has been updated successfully.`,
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visit date. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: keyof CoffeeShop) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading coffee shops</div>

  return (
    <PageContainer>

    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search coffee shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
              {FILTER_CONFIGS.map((config) => (
                <DropdownMenuSub key={config.field}>
                  <DropdownMenuSubTrigger>
                    {config.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {config.operators.map((operator) => (
                      <DropdownMenuSub key={operator}>
                        <DropdownMenuSubTrigger>
                          {OPERATOR_LABELS[operator]}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="p-2">
                          <div className="space-y-2">
                            <FilterValueInput
                              type={config.type}
                              value={null}
                              onChange={(value) => {
                                handleAddFilter({
                                  id: crypto.randomUUID(),
                                  field: config.field,
                                  operator,
                                  value,
                                  type: config.type
                                })
                              }}
                              operator={operator}
                            />
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
              {activeFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleClearFilters}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <span>
                {FILTER_CONFIGS.find(c => c.field === filter.field)?.label} 
                {' '}
                {OPERATOR_LABELS[filter.operator]}
                {' '}
                {filter.operator === 'between' 
                  ? `${filter.value.min} - ${filter.value.max}`
                  : String(filter.value)
                }
              </span>
              <XCircle
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleRemoveFilter(filter.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Checkbox Column */}
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedShops.length === paginatedShops.length}
                  onCheckedChange={(checked) => {
                    setSelectedShops(
                      checked
                        ? paginatedShops.map(shop => shop.id)
                        : []
                    )
                  }}
                />
              </TableHead>

              {/* Name Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('title')}
                  >
                    {sortConfig.key === 'title' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* Area Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  Area
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('area')}
                  >
                    {sortConfig.key === 'area' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* First Visit Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  First Visit
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('first_visit')}
                  >
                    {sortConfig.key === 'first_visit' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* Second Visit Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  Second Visit
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('second_visit')}
                  >
                    {sortConfig.key === 'second_visit' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* Third Visit Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  Third Visit
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('third_visit')}
                  >
                    {sortConfig.key === 'third_visit' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* Status Column */}
              <TableHead>
                <div className="flex items-center gap-2">
                  Status
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('visited')}
                  >
                    {sortConfig.key === 'visited' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </TableHead>

              {/* Other Columns */}
              <TableHead>Rating</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedShops.includes(shop.id)}
                    onCheckedChange={(checked) => {
                      setSelectedShops(
                        checked
                          ? [...selectedShops, shop.id]
                          : selectedShops.filter(id => id !== shop.id)
                      )
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/coffee-shops/${shop.id}`}
                    className="font-medium hover:underline"
                  >
                    {shop.title}
                  </Link>
                </TableCell>
                <TableCell>{shop.area || '-'}</TableCell>
                <TableCell>
                  <DateCell
                    date={shop.first_visit ? new Date(shop.first_visit) : null}
                    onUpdate={(date) => handleDateUpdate(shop, 'first_visit', date)}
                  />
                </TableCell>
                <TableCell>
                  <DateCell
                    date={shop.second_visit ? new Date(shop.second_visit) : null}
                    onUpdate={(date) => handleDateUpdate(shop, 'second_visit', date)}
                  />
                </TableCell>
                <TableCell>
                  <DateCell
                    date={shop.third_visit ? new Date(shop.third_visit) : null}
                    onUpdate={(date) => handleDateUpdate(shop, 'third_visit', date)}
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={shop.visited ? "success" : "default"}
                    className="cursor-pointer"
                  >
                    {shop.visited ? "Visited" : "Not Visited"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {shop.rating ? (
                    <span className="flex items-center">
                      {shop.rating.toFixed(1)}
                      {shop.reviews && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({shop.reviews})
                        </span>
                      )}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {shop.instagram ? (
                    <a
                      href={`https://instagram.com/${shop.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      @{shop.instagram}
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {shop.followers ? shop.followers.toLocaleString() : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={shop.parlor_coffee_leads ? "warning" : "default"}
                    className="cursor-pointer"
                  >
                    {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                  </Badge>
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
                      <DropdownMenuItem 
                        onClick={() => router.push(`/dashboard/coffee-shops/${shop.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeleteId(shop.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Selected Items Actions */}
      {selectedShops.length > 0 && (
        <div className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedShops.length} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await Promise.all(
                        selectedShops.map(id =>
                          fetch(`/api/coffee-shops/${id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ visited: true }),
                          })
                        )
                      )
                      toast({
                        title: "Status updated",
                        description: "Selected shops marked as visited",
                      })
                      mutate()
                      setSelectedShops([])
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update shops",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Mark as Visited
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await Promise.all(
                        selectedShops.map(id =>
                          fetch(`/api/coffee-shops/${id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ parlor_coffee_leads: true }),
                          })
                        )
                      )
                      toast
                      ({
                        title: "Status updated",
                        description: "Selected shops marked as leads",
                      })
                      mutate()
                      setSelectedShops([])
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update shops",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Mark as Lead
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    try {
                      await Promise.all(
                        selectedShops.map(id =>
                          fetch(`/api/coffee-shops/${id}`, {
                            method: "DELETE",
                          })
                        )
                      )
                      toast({
                        title: "Shops deleted",
                        description: `${selectedShops.length} shops have been deleted`,
                      })
                      mutate()
                      setSelectedShops([])
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to delete shops",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coffee shop
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!deleteId) return

                try {
                  await fetch(`/api/coffee-shops/${deleteId}`, {
                    method: "DELETE",
                  })
                  toast({
                    title: "Coffee shop deleted",
                    description: "The coffee shop has been deleted successfully",
                  })
                  mutate()
                  setDeleteId(null)
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete shop",
                    variant: "destructive",
                  })
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
       </PageContainer>
 
  )
}