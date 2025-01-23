#!/bin/bash

# Update CoffeeShopsTable component
cat > "src/components/coffee-shops/coffee-shops-table.tsx" << 'EOF'
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
 DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Filter, XCircle, Calendar } from "lucide-react"
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
import { CoffeeShop } from "@prisma/client"
import { useCoffeeShops } from "@/hooks/use-coffee-shops"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover"

const ITEMS_PER_PAGE = 1000

type SortConfig = {
 key: keyof CoffeeShop | null
 direction: 'asc' | 'desc'
}

type FilterValue = string | number | boolean
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan'

interface Filter {
 field: keyof CoffeeShop
 operator: FilterOperator
 value: FilterValue
}

export function CoffeeShopsTable() {
 const router = useRouter()
 const { toast } = useToast()
 const [searchTerm, setSearchTerm] = useState("")
 const [deleteId, setDeleteId] = useState<string | null>(null)
 const [currentPage, setCurrentPage] = useState(1)
 const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
 const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
 const [filters, setFilters] = useState<Filter[]>([])
 const [selectedShops, setSelectedShops] = useState<string[]>([])
 const { shops, loading, error, mutate } = useCoffeeShops()
 const [datePickerOpen, setDatePickerOpen] = useState<{id: string, field: string} | null>(null)

 const filterOperators: Record<string, FilterOperator[]> = {
   string: ['equals', 'contains'],
   number: ['equals', 'greaterThan', 'lessThan'],
   boolean: ['equals']
 }

 const operatorLabels: Record<FilterOperator, string> = {
   equals: 'Equals',
   contains: 'Contains',
   greaterThan: 'Greater Than',
   lessThan: 'Less Than'
 }

 const handleVisitDateUpdate = async (shopId: string, field: string, date: Date | null) => {
   try {
     const response = await fetch(`/api/coffee-shops/${shopId}`, {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ [field]: date }),
     })

     if (!response.ok) throw new Error("Failed to update visit date")

     toast({
       title: "Visit date updated",
       description: "The visit date has been updated successfully.",
     })

     mutate()
     setDatePickerOpen(null)
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update visit date. Please try again.",
       variant: "destructive",
     })
   }
 }

 const addFilter = (field: keyof CoffeeShop, operator: FilterOperator, value: FilterValue) => {
   setFilters(prev => [...prev, { field, operator, value }])
 }

 const removeFilter = (index: number) => {
   setFilters(prev => prev.filter((_, i) => i !== index))
 }

 const clearAllFilters = () => {
   setFilters([])
 }

 const filteredShops = useMemo(() => {
   if (!shops) return []

   return shops.filter(shop => {
     const matchesSearch = 
       shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       shop.area?.toLowerCase().includes(searchTerm.toLowerCase())

     const matchesFilters = filters.every(filter => {
       const value = shop[filter.field]
       
       switch (filter.operator) {
         case 'equals':
           return value === filter.value
         case 'contains':
           return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
         case 'greaterThan':
           return typeof value === 'number' && value > Number(filter.value)
         case 'lessThan':
           return typeof value === 'number' && value < Number(filter.value)
         default:
           return true
       }
     })

     return matchesSearch && matchesFilters
   })
 }, [shops, searchTerm, filters])

 const sortedShops = useMemo(() => {
   if (!sortConfig.key) return filteredShops

   return [...filteredShops].sort((a, b) => {
     const aValue = a[sortConfig.key!]
     const bValue = b[sortConfig.key!]

     if (aValue === null || aValue === undefined) return 1
     if (bValue === null || bValue === undefined) return -1

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

 const handleSort = (key: keyof CoffeeShop) => {
   setSortConfig(current => ({
     key,
     direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
   }))
 }

 const DateCell = ({ shop, field, value }: { shop: CoffeeShop, field: string, value: Date | null }) => {
   const isOpen = datePickerOpen?.id === shop.id && datePickerOpen?.field === field
   
   return (
     <div className="flex items-center gap-2">
       <Popover open={isOpen} onOpenChange={() => setDatePickerOpen(isOpen ? null : { id: shop.id, field })}>
         <PopoverTrigger asChild>
           <Button variant="ghost" size="sm" className="h-8 border-dashed border">
             {value ? (
               format(new Date(value), 'MMM dd, yyyy')
             ) : (
               <span className="text-muted-foreground">Pick date</span>
             )}
             <Calendar className="ml-2 h-4 w-4" />
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
           <CalendarComponent
             mode="single"
             selected={value ? new Date(value) : undefined}
             onSelect={(date) => handleVisitDateUpdate(shop.id, field, date)}
             initialFocus
           />
         </PopoverContent>
       </Popover>
     </div>
   )
 }

 return (
   <div className="space-y-4">
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
         <Input
           placeholder="Search coffee shops..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-[300px]"
         />
       </div>
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

     <div className="rounded-md border">
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
             <TableHead>First Visit</TableHead>
             <TableHead>Second Visit</TableHead>
             <TableHead>Third Visit</TableHead>
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
                 Lead
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => handleSort('parlor_coffee_leads')}
                 >
                   {sortConfig.key === 'parlor_coffee_leads' ? (
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
                 {shop.area}
               </TableCell>
               <TableCell>
                 <DateCell shop={shop} field="first_visit" value={shop.first_visit} />
               </TableCell>
               <TableCell>
                 <DateCell shop={shop} field="second_visit" value={shop.second_visit} />
               </TableCell>
               <TableCell>
                 <DateCell shop={shop} field="third_visit" value={shop.third_visit} />
               </TableCell>
               <TableCell>
                 <Badge
                   variant={shop.visited ? "success" : "default"}
                   className="cursor-pointer"
                 >
                   {shop.visited ? "Visited" : "Not Visited"}
                 </Badge>
               </TableCell>
               <TableCell>{shop.rating || "-"}</TableCell>'
cat >> "src/components/coffee-shops/coffee-shops-table.tsx" << 'EOF'
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
                       View
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
                 onClick={() => handleBulkStatusUpdate('visited', true)}
               >
                 Mark as Visited
               </DropdownMenuItem>
               <DropdownMenuItem
                 onClick={() => handleBulkStatusUpdate('visited', false)}
               >
                 Mark as Not Visited
               </DropdownMenuItem>
               <DropdownMenuItem
                 onClick={() => handleBulkStatusUpdate('parlor_coffee_leads', true)}
               >
                 Mark as Lead
               </DropdownMenuItem>
               <DropdownMenuItem
                 onClick={() => handleBulkStatusUpdate('parlor_coffee_leads', false)}
               >
                 Remove Lead Status
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem
                 className="text-red-600"
                 onClick={handleDeleteSelected}
               >
                 Delete Selected
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
     )}

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
             onClick={() => deleteId && handleDelete(deleteId)}
           >
             Delete
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   </div>
 )
}

EOF

# Update use-coffee-shops hook to properly handle dates
cat > "src/hooks/use-coffee-shops.ts" << 'EOF'
import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = async (url: string) => {
 const res = await fetch(url)
 if (!res.ok) {
   throw new Error('An error occurred while fetching the data.')
 }
 const data = await res.json()
 return data.map((shop: any) => ({
   ...shop,
   first_visit: shop.first_visit ? new Date(shop.first_visit) : null,
   second_visit: shop.second_visit ? new Date(shop.second_visit) : null,
   third_visit: shop.third_visit ? new Date(shop.third_visit) : null,
   createdAt: new Date(shop.createdAt),
   updatedAt: new Date(shop.updatedAt)
 }))
}

export function useCoffeeShops() {
 const { data, error, isLoading, mutate } = useSWR<CoffeeShop[]>(
   '/api/coffee-shops',
   fetcher,
   {
     refreshInterval: 0,
     revalidateOnFocus: false,
   }
 )

 return {
   shops: data,
   loading: isLoading,
   error: error,
   mutate,
 }
}
EOF