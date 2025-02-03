"use client"

import { useState, useMemo, useEffect } from "react"
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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  MoreHorizontal, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDown, 
  ArrowUp, 
  Filter, 
  XCircle, 
  Calendar as CalendarIcon,
  Pencil,
  Check,
  X,
  Instagram,
  User,
  Mail,
  Phone,
  Star,
  Shield,
  RefreshCw
} from "lucide-react"
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
import { cn } from "@/lib/utils"
import { CoffeeShop } from "@prisma/client"
import { format } from "date-fns"
import { FilterValueInput } from "./filter-value-input"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { Textarea } from "@/components/ui/textarea";
import { MobileCardView } from "./mobile-card-view";

const ITEMS_PER_PAGE = 50

interface EditableCellProps {
  value: string | null
  onUpdate: (value: string | null) => Promise<void>
  type?: 'text' | 'number' | 'instagram' | 'email' | 'manager' |'owners'|'notes' | 'volume' | 'phone'| 'priority'
  className?: string
}

function StarRating({ 
  value, 
  onUpdate,
  className 
}: { 
  value: number, 
  onUpdate: (value: number) => void,
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            star <= value 
              ? "fill-yellow-500 text-yellow-500" 
              : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={() => onUpdate(star)}
        />
      ))}
    </div>
  )
}
function EditableCell({ value, onUpdate, type = 'text', className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    
    try {
      let processedValue = editValue
      let isValid = true

      switch (type) {
        case 'instagram':
          processedValue = editValue
            .trim()
            .replace(/^@/, '')
            .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
            .replace(/\/$/, '')
          break
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (editValue && !emailRegex.test(editValue)) {
            isValid = false
            toast({
              title: "Invalid email",
              description: "Please enter a valid email address",
              variant: "destructive"
            })
          }
          break
          
        case 'number':
          if (editValue && isNaN(parseFloat(editValue))) {
            isValid = false
            toast({
              title: "Invalid value",
              description: "Please enter a valid number",
              variant: "destructive"
            })
          }
          break

        case 'volume':
          const numValue = parseFloat(editValue)
          if (isNaN(numValue) || numValue < 0) {
            isValid = false
            toast({
              title: "Invalid value",
              description: "Please enter a valid number",
              variant: "destructive"
            })
          } else {
            processedValue = numValue.toString()
          }
          break

        case 'phone':
          const phoneRegex = /^[\d\s\-+()]*$/
          if (editValue && !phoneRegex.test(editValue)) {
            isValid = false
            toast({
              title: "Invalid phone number",
              description: "Please enter a valid phone number",
              variant: "destructive"
            })
          }
          break
      }

      if (isValid) {
        await onUpdate(processedValue || null)
        setIsEditing(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update value",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type === 'number' || type === 'volume' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={cn("h-8 w-[200px]", className)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(value || '')
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (type === 'instagram' && value) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <Instagram className="h-4 w-4 mr-1" />
          @{value}
        </a>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }
  
  if (type === 'email' && value) {
    return (
      <div className="flex items-center gap-2">
                <a

          href={`mailto:${value}`}
          className="text-blue-600 hover:underline flex items-center"
        >
          <Mail className="h-4 w-4 mr-1" />
          {value}
        </a>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'manager' && value) {
    return (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 mr-1" />
        <span>{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'phone' && value) {
    return (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 mr-1" />
        <span>{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (type === 'volume' && value) {
    const numValue = parseFloat(value)
    const arr = (numValue * 52) * 18
    return (
      <div 
        className="space-y-1 cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-center gap-2">
          <span>{numValue.toLocaleString()}</span>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>

      </div>
    )
  }
  if (type === 'owners' && value) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          {value.split(',').map((owner, index) => (
            <div key={index} className="text-sm">
              {owner.trim()}
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
   }
   if (type === 'notes' && value) {
    return (
      <div className="flex items-center gap-2">
        <div className="max-w-[200px] truncate text-sm" title={value}>
          {value}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
   }
   
   {/* For notes, you might want to use a Textarea instead of Input when editing: */}
   
   if (isEditing && type === 'notes') {
    return (
      <div className="flex items-center gap-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px] w-[300px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSave()
            }
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false)
              setEditValue(value || '')
            }}
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
   }
   if (type === 'priority') {
    return (
      <div className="flex items-center gap-2 group cursor-pointer">
        <div 
          className={cn(
            "flex items-center gap-2",
            className
          )}
          onClick={() => setIsEditing(true)}
        >
          <Star className={cn(
            "h-4 w-4",
            value && parseInt(value) > 0 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
          )} />
          <span>{value || "0"}</span>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    )
  }
  
  if (isEditing && type === 'priority') {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="10"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setIsEditing(false)
              setEditValue(value || '')
            }
          }}
          disabled={isUpdating}
          autoFocus
        />
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(value || '')
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }
  return (
    <div 
      className={cn(
        "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-muted/50",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span>{value || "-"}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </div>
  )
}

interface DateCellProps {
  date: Date | null
  onUpdate: (date: Date | null) => Promise<void>
  onRemove: () => Promise<void>
}

function DateCell({ date, onUpdate, onRemove }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleDateSelect = async (newDate: Date | null) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await onUpdate(newDate)
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update date",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await onRemove()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove date",
        variant: "destructive"
      })
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
            "w-[140px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={isUpdating}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'MM-dd-yyyy') : 'Not set'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 flex flex-col gap-2">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleDateSelect}
            initialFocus
          />
          {date && (
            <div className="border-t pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleRemove}
                disabled={isUpdating}
              >
                Remove Date
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Filter types and configurations
type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'reviews' | 'followers' | 'volume' | 'priority'
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
  value: any
  type: FilterDataType
}

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
    field: 'manager_present',
    label: 'Manager Present',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'contact_name',
    label: 'Contact Name',
    type: 'text', 
    operators: ['contains', 'equals']
  },
  {
    field: 'contact_email',
    label: 'Contact Email',
    type: 'text',
    operators: ['contains', 'equals']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'reviews',
    label: 'Reviews',
    type: 'reviews',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'followers',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'volume',
    label: 'Volume',
    type: 'volume',
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
 
 export function CoffeeShopsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof CoffeeShop | null;
    direction: 'asc' | 'desc';
    statusPriority: 'visited' | 'notVisited' | null;
  }>({
    key: null,
    direction: 'asc',
    statusPriority: 'visited',
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const { shops, loading, error, mutate } = useCoffeeShops()
  const [isRecalculating, setIsRecalculating] = useState(false)

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
  const handleRecalculatePriorities = async () => {
    setIsRecalculating(true)
    try {
      const response = await fetch('/api/coffee-shops/priority', { 
        method: 'POST' 
      })
      
      if (response.ok) {
        // Optionally refresh the table or show a toast
        toast({
          title: "Priorities Recalculated",
          description: "Shop priorities have been updated"
        })
        // Trigger a reload of the shops data
        mutate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recalculate priorities",
        variant: "destructive"
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleAddFilter = (filter: Omit<ActiveFilter, 'id'>) => {
    setActiveFilters(prev => [...prev, { ...filter, id: crypto.randomUUID() }])
  }
 
  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId))
  }
 
  const handleClearFilters = () => {
    setActiveFilters([])
  }
 
  const handleCellUpdate = async (
    shop: CoffeeShop,
    field: keyof CoffeeShop,
    value: any
  ) => {
    try {
      const updateData: Partial<CoffeeShop> = {
        [field]: value
      }
 
      console.log('Updating shop:', { field, value, updateData })
 
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })
 
      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }
 
      toast({
        title: "Updated successfully",
        description: `${shop.title} has been updated.`
      })
 
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive"
      })
      console.error('Update error:', error)
    }
  }
 
  const handleDateUpdate = async (
    shop: CoffeeShop, 
    field: 'first_visit' | 'second_visit' | 'third_visit', 
    date: Date | null
  ) => {
    try {
      console.log('Updating date:', { field, date, shopId: shop.id })
      
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: date?.toISOString(),
          visited: !!date || !!shop.first_visit || !!shop.second_visit || !!shop.third_visit
        })
      })
 
      if (!response.ok) throw new Error(`Failed to update ${field}`)
 
      toast({
        title: "Visit date updated",
        description: `${shop.title} has been updated successfully.`
      })
 
      mutate()
    } catch (error) {
      console.error('Date update error:', error)
      toast({
        title: "Error",
        description: "Failed to update visit date. Please try again.",
        variant: "destructive"
      })
    }
  }
 
  const handleDateRemove = async (
    shop: CoffeeShop,
    field: 'first_visit' | 'second_visit' | 'third_visit'
  ) => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: null,
          visited: field !== 'first_visit' || !!shop.second_visit || !!shop.third_visit
        })
      })
 
      if (!response.ok) throw new Error(`Failed to remove ${field}`)
 
      toast({
        title: "Visit date removed",
        description: `${shop.title} has been updated successfully.`
      })
 
      mutate()
    } catch (error) {
      console.error('Date removal error:', error)
      toast({
        title: "Error",
        description: "Failed to remove visit date. Please try again.",
        variant: "destructive"
      })
    }
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
  let sorted = [...filteredShops];

  // Sort by visited status first
  if (sortConfig.statusPriority === 'visited') {
    sorted = sorted.sort((a, b) => Number(b.visited) - Number(a.visited));
  } else if (sortConfig.statusPriority === 'notVisited') {
    sorted = sorted.sort((a, b) => Number(a.visited) - Number(b.visited));
  }

  // Then sort by the selected column
  if (sortConfig.key) {
    sorted = sorted.sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Special handling for dates
      if (sortConfig.key.includes('visit')) {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      // Regular comparison
      const comparison =
        typeof aValue === 'string'
          ? aValue.localeCompare(String(bValue))
          : Number(aValue) - Number(bValue);

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  return sorted;
}, [filteredShops, sortConfig]);
 
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
 
  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)
 
  const handleSort = (key: keyof CoffeeShop) => {
    if (key === 'visited') {
      setSortConfig((current) => ({
        ...current,
        statusPriority: current.statusPriority === 'visited' ? 'notVisited' : 'visited',
      }));
    } else {
      setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        statusPriority: null,
      }));
    }
  };
 
  if (loading) return <div></div>
  if (error) return <div>Error loading coffee shops</div>
 
  return (
    <div className="space-y-4">
      {/* Mobile header controls */}
      <div className="flex flex-col gap-4 md">
        <Input
          placeholder="Search coffee shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
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
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
 
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleRecalculatePriorities}
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Recalculate</span>
          </Button>
        </div>
      </div>
 

    {/* Active filters */}
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

    {/* Mobile Card View */}
    <div className="block md:hidden">
      <MobileCardView
        shops={paginatedShops}
        onVisitToggle={handleVisitToggle}
        onDelete={handleDelete}
      />
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableHead>
                <div className="flex items-center gap-2">
                  Website
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('website')}
                  >
                    {sortConfig.key === 'website' ? (
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
              <TableHead>
                <div className="flex items-center gap-2">
                  Address
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('Address')}
                  >
                    {sortConfig.key === 'Address' ? (
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
              <TableHead>
                <div className="flex items-center gap-2">
                  Priority
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('priority')}
                  >
                    {sortConfig.key === 'priority' ? (
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
              <TableHead>Partner Status</TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  Manager Present
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('manager_present')}
                  >
                    {sortConfig.key === 'manager_present' ? (
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
              
              <TableHead>
                <div className="flex items-center gap-2">
                  Contact Name
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('contact_name')}
                  >
                  {sortConfig.key === 'contact_name' ? (
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
             <TableHead>
               <div className="flex items-center gap-2">
                 Contact Email
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('contact_email')}
                 >
                   {sortConfig.key === 'contact_email' ? (
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
             <TableHead>
              <div className="flex items-center gap-2">
                Owners
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('owners')}
                >
                  {sortConfig.key === 'owners' ? (
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
             <TableHead>
              <div className="flex items-center gap-2">
                Volume
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('volume')}
                >
                  {sortConfig.key === 'volume' ? (
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
            <TableHead>ARR</TableHead>
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
             <TableHead>Status</TableHead>
             <TableHead>
               <div className="flex items-center gap-2">
                 Rating
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('rating')}
                 >
                   {sortConfig.key === 'rating' ? (
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
             <TableHead>
               <div className="flex items-center gap-2">
                 Reviews
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('reviews')}
                 >
                   {sortConfig.key === 'reviews' ? (
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
             <TableHead>
               <div className="flex items-center gap-2">
                 Instagram
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('instagram')}
                 >
                   {sortConfig.key === 'instagram' ? (
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
             <TableHead>
               <div className="flex items-center gap-2">
                 Followers
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('followers')}
                 >
                   {sortConfig.key === 'followers' ? (
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
             <TableHead>Lead</TableHead>
             <TableHead>
              <div className="flex items-center gap-2">
                Notes
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('notes')}
                >
                  {sortConfig.key === 'notes' ? (
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
               <TableCell>
                  <EditableCell
                    value={shop.website}
                    onUpdate={(value) => handleCellUpdate(shop, 'website', value)}
                    type="url"
                  />
                </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.area}
                   onUpdate={(value) => handleCellUpdate(shop, 'area', value)}
                 />
               </TableCell>
                  
               <TableCell>
                 <EditableCell
                   value={shop.address}
                   onUpdate={(value) => handleCellUpdate(shop, 'address', value)}
                 />
               </TableCell>
               <TableCell>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <StarRating
                    value={shop.priority || 0}
                    onUpdate={(value) => handleCellUpdate(shop, 'priority', value)}
                    className="group-hover:opacity-100"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={shop.isPartner ? "success" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleCellUpdate(shop, 'isPartner', !shop.isPartner)}
                >
                  {shop.isPartner ? (
                    <><Shield className="h-4 w-4 mr-1" /> Partner</>
                  ) : "Not Partner"}
                </Badge>
              </TableCell>


               <TableCell>
                 <EditableCell
                   value={shop.manager_present}
                   onUpdate={(value) => handleCellUpdate(shop, 'manager_present', value)}
                   type="manager"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.contact_name}
                   onUpdate={(value) => handleCellUpdate(shop, 'contact_name', value)}
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.contact_email}
                   onUpdate={(value) => handleCellUpdate(shop, 'contact_email', value)}
                   type="email"
                 />
               </TableCell>
               <TableCell>
                <EditableCell
                  value={shop.owners.map(owner => `${owner.name} (${owner.email})`).join(', ') || null}
                  onUpdate={async (value) => {
                    // Parse owner string into array of objects
                    const owners = value ? value.split(',').map(owner => {
                      const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/);
                      if (match) {
                        return {
                          name: match[1].trim(),
                          email: match[2].trim()
                        };
                      }
                      return null;
                    }).filter(Boolean) : [];
                    
                    await handleCellUpdate(shop, 'owners', owners);
                  }}
                  type="owners"
                />
              </TableCell>
               <TableCell>
                  <EditableCell 
                    value={shop.volume?.toString() || null}
                    onUpdate={(value) => handleCellUpdate(shop, 'volume', value)}
                    type="volume"
                  />
                </TableCell>
                <TableCell>
                  {shop.volume ? (
                    <div className="text-sm">
                      ${((parseFloat(shop.volume) * 52) * 18).toLocaleString()}
                    </div>
                  ) : "-"}
                </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.first_visit ? new Date(shop.first_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'first_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'first_visit')}
                 />
               </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.second_visit ? new Date(shop.second_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'second_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'second_visit')}
                 />
               </TableCell>
               <TableCell>
                 <DateCell
                   date={shop.third_visit ? new Date(shop.third_visit) : null}
                   onUpdate={(date) => handleDateUpdate(shop, 'third_visit', date)}
                   onRemove={() => handleDateRemove(shop, 'third_visit')}
                 />
               </TableCell>
               <TableCell>
                 <Badge
                   variant={shop.visited ? "success" : "default"}
                   className="cursor-pointer"
                   onClick={() => handleCellUpdate(shop, 'visited', !shop.visited)}
                 >
                   {shop.visited ? "Visited" : "Not Visited"}
                 </Badge>
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.rating?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'rating', value ? parseFloat(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.reviews?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'reviews', value ? parseFloat(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.instagram}
                   onUpdate={(value) => handleCellUpdate(shop, 'instagram', value)}
                   type="instagram"
                 />
               </TableCell>
               <TableCell>
                 <EditableCell
                   value={shop.followers?.toString()}
                   onUpdate={(value) => handleCellUpdate(shop, 'followers', value ? parseInt(value) : null)}
                   type="number"
                 />
               </TableCell>
               <TableCell>
                 <Badge
                   variant={shop.parlor_coffee_leads ? "warning" : "default"}
                   className="cursor-pointer"
                   onClick={() => handleCellUpdate(shop, 'parlor_coffee_leads', !shop.parlor_coffee_leads)}
                 >
                   {shop.parlor_coffee_leads ? "Lead" : "No Lead"}
                 </Badge>
               </TableCell>
               <TableCell>
                <EditableCell
                  value={shop.notes}
                  onUpdate={(value) => handleCellUpdate(shop, 'notes', value)}
                  type="notes"
                />
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
                     <DropdownMenuItem onClick={() => router.push(`/dashboard/coffee-shops/${shop.id}`)}>
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

    {/* Pagination - Show on both views */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {paginatedShops.length} of results
      </p>
      <div className="flex items-center justify-end gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>

    {/* Delete Dialog */}
    <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the coffee shop and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => handleDelete(deleteId!)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

     <style jsx>{`
       @media (max-width: 768px) {
         .overflow-x-auto {
           -webkit-overflow-scrolling: touch;
         }
         
         .table {
           min-width: 100%;
         }
       }
       
       @media (min-width: 769px) {
         .overflow-x-auto {
           max-width: 100%;
         }

         .table {
           min-width: 100%;
           width: max-content;
         }

         th, td {
           white-space: nowrap;
           padding: 0.75rem 1rem;
         }

         th:first-child,
         td:first-child {
           position: sticky;
           left: 0;
           background: white;
           z-index: 1;
         }
       }
     `}</style>
   </div>
 )
}