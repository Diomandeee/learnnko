"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search, Plus } from "lucide-react"
import { FILTER_CONFIGS, OPERATOR_LABELS } from "./filter-configs"
import { FilterValueInput } from "./filter-value-input"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShop } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { SavedFiltersMenu } from "./saved-filters/saved-filters-menu"

interface TableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeFilters: Array<{
    id: string
    field: keyof CoffeeShop
    operator: string
    value: any
    label: string
    type: string
  }>
  onAddFilter: (filter: any) => void
  onRemoveFilter: (id: string) => void
  onClearFilters: () => void
  onLoadSavedFilters?: (filters: any[]) => void
  filterConfigs?: typeof FILTER_CONFIGS
}

export function TableFilters({
  searchTerm,
  onSearchChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onLoadSavedFilters,
  filterConfigs = FILTER_CONFIGS
}: TableFiltersProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [tempFilterValue, setTempFilterValue] = useState<any>(null)
  const { toast } = useToast()

  const handleAddFilter = (field: keyof CoffeeShop, operator: string, type: string) => {
    if (!tempFilterValue) {
      toast({
        title: "Error",
        description: "Please enter a filter value",
        variant: "destructive"
      })
      return
    }

    const config = filterConfigs.find(c => c.field === field)
    if (!config) return

    const newFilter = {
      id: crypto.randomUUID(),
      field,
      operator,
      value: tempFilterValue,
      type,
      label: `${config.label} ${OPERATOR_LABELS[operator]} ${
        typeof tempFilterValue === 'object'
          ? `${tempFilterValue.min} - ${tempFilterValue.max}`
          : tempFilterValue
      }`
    }

    onAddFilter(newFilter)
    setTempFilterValue(null)
    setFilterMenuOpen(false)
  }

  const handleLoadSavedFilters = (filters: any[]) => {
    onClearFilters()
    filters.forEach(filter => onAddFilter(filter))
    if (onLoadSavedFilters) {
      onLoadSavedFilters(filters)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search and Filters Row */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coffee shops..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
              
              {filterConfigs.map((config) => (
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
                              operator={operator}
                              value={tempFilterValue}
                              onChange={setTempFilterValue}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddFilter(config.field, operator, config.type)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Filter
                              </Button>
                            </div>
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
                    className="text-red-600 focus:text-red-600"
                    onClick={onClearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Saved Filters Menu */}
          <SavedFiltersMenu
            activeFilters={activeFilters}
            onLoadFilter={handleLoadSavedFilters}
          />
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
             className="text-muted-foreground"
             onClick={onClearFilters}
           >
             Clear all
           </Button>
         </div>
       )}
     </div>
   </Card>
  )
}