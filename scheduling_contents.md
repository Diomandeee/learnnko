### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/dashboard/coffee-shops/page.tsx
import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"

export const metadata = {
  title: "Coffee Shops | BUF BARISTA CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CoffeeShopHeader />
      <CoffeeShopsTable />
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/dashboard/coffee-shops/new/page.tsx
import { Metadata } from "next"
import { NewCoffeeShopForm } from "@/components/coffee-shops/new-coffee-shop-form"

export const metadata: Metadata = {
  title: "Add Coffee Shop | BUF BARISTA CRM",
  description: "Add a new coffee shop to your network",
}

export default function NewCoffeeShopPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Coffee Shop</h1>
      <NewCoffeeShopForm />
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/dashboard/coffee-shops/[id]/page.tsx
import { CoffeeShopProfile } from "@/components/coffee-shops/coffee-shop-profile"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function CoffeeShopPage({ params }: Props) {
  const coffeeShop = await prisma.coffeeShop.findUnique({
    where: {
      id: params.id
    },
    include: {
      visits: {
        orderBy: {
          date: 'desc'
        }
      }
    }
  })

  if (!coffeeShop) {
    notFound()
  }

  return <CoffeeShopProfile shop={coffeeShop} />
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/coffee-shops/coffee-shop-header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CoffeeShopHeader() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coffee Shops</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track coffee shops in your network
        </p>
      </div>
      <Button onClick={() => router.push("/dashboard/coffee-shops/new")}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Coffee Shop
      </Button>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/coffee-shops/coffee-shop-profile.tsx
"use client"

import { CoffeeShop, Visit } from "@prisma/client"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Globe, Phone, Instagram, Calendar, Star, DollarSign, Clock, Users } from "lucide-react"
import Link from "next/link"

interface CoffeeShopProfileProps {
  shop: CoffeeShop & {
    visits: Visit[]
  }
}

export function CoffeeShopProfile({ shop }: CoffeeShopProfileProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{shop.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={shop.is_source ? "default" : "secondary"}>
              {shop.is_source ? "Partner" : "Prospect"}
            </Badge>
            {shop.visited && <Badge variant="success">Visited</Badge>}
            {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/coffee-shops">Back to List</Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{shop.address}</span>
                </div>
                {shop.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                {shop.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <span>@{shop.instagram}</span>
                    {shop.followers && <span>({shop.followers.toLocaleString()} followers)</span>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {shop.contact_name && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Contact: {shop.contact_name}</span>
                  </div>
                )}
                {shop.contact_email && (
                  <div className="flex items-center gap-2">
                    <span>Email: {shop.contact_email}</span>
                  </div>
                )}
                {shop.manager_present && (
                  <div className="flex items-center gap-2">
                    <span>Manager: {shop.manager_present}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings & Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {shop.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{shop.rating} ({shop.reviews} reviews)</span>
                  </div>
                )}
                {shop.price_type && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{shop.price_type}</span>
                  </div>
                )}
                {shop.volume && (
                  <div className="flex items-center gap-2">
                    <span>Volume: {shop.volume}</span>
                  </div>
                )}
                {shop.store_doors && (
                  <div className="flex items-center gap-2">
                    <span>Store Doors: {shop.store_doors}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shop.first_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>First Visit: {format(new Date(shop.first_visit), 'PPP')}</span>
                  </div>
                )}
                {shop.second_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Second Visit: {format(new Date(shop.second_visit), 'PPP')}</span>
                  </div>
                )}
                {shop.third_visit && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Third Visit: {format(new Date(shop.third_visit), 'PPP')}</span>
                  </div>
                )}
                {shop.visits.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">Detailed Visits</h3>
                    {shop.visits.map((visit) => (
                      <Card key={visit.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Visit #{visit.visitNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(visit.date), 'PPP')}
                              </p>
                            </div>
                            {visit.managerPresent && (
                              <Badge>Manager Present</Badge>
                            )}
                          </div>
                          {visit.notes && (
                            <p className="mt-2 text-sm">{visit.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Area</h3>
                  <Badge variant="outline">{shop.area}</Badge>
                </div>
              </div>
              {shop.service_options && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Service Options</h3>
                  <pre className="bg-muted p-2 rounded-md text-sm">
                    {JSON.stringify(shop.service_options, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              {shop.hours && (
                <CardDescription>{shop.hours}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {shop.operating_hours ? (
                <div className="space-y-2">
                  {Object.entries(shop.operating_hours as Record<string, string>).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b">
                      <span className="capitalize">{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No operating hours available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/coffee-shops/coffee-shops-table.tsx
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
import { Edit, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Filter, XCircle } from "lucide-react"
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
     // Search filter
     const matchesSearch = 
       shop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       shop.area?.toLowerCase().includes(searchTerm.toLowerCase())

     // Applied filters
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

 const handleDelete = async (id: string) => {
   try {
     const response = await fetch(`/api/coffee-shops/${id}`, {
       method: "DELETE",
     })

     if (!response.ok) throw new Error("Failed to delete coffee shop")

     toast({
       title: "Coffee shop deleted",
       description: "The coffee shop has been deleted successfully.",
     })

     mutate()
     setDeleteId(null)
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to delete coffee shop. Please try again.",
       variant: "destructive",
     })
   }
 }

 const handleDeleteSelected = async () => {
   try {
     await Promise.all(
       selectedShops.map(id =>
         fetch(`/api/coffee-shops/${id}`, { method: "DELETE" })
       )
     )

     toast({
       title: "Coffee shops deleted",
       description: `${selectedShops.length} shops have been deleted successfully.`,
     })

     mutate()
     setSelectedShops([])
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to delete selected coffee shops. Please try again.",
       variant: "destructive",
     })
   }
 }

 const handleStatusToggle = async (shop: CoffeeShop, field: 'visited' | 'parlor_coffee_leads') => {
   try {
     const response = await fetch(`/api/coffee-shops/${shop.id}`, {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ [field]: !shop[field] }),
     })

     if (!response.ok) throw new Error(`Failed to update ${field}`)

     toast({
       title: "Status updated",
       description: `${shop.title} has been updated successfully.`,
     })

     mutate()
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update status. Please try again.",
       variant: "destructive",
     })
   }
 }

 const handleBulkStatusUpdate = async (field: 'visited' | 'parlor_coffee_leads', value: boolean) => {
   try {
     await Promise.all(
       selectedShops.map(id =>
         fetch(`/api/coffee-shops/${id}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ [field]: value }),
         })
       )
     )

     toast({
       title: "Status updated",
       description: `${selectedShops.length} shops have been updated successfully.`,
     })

     mutate()
     setSelectedShops([])
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update status. Please try again.",
       variant: "destructive",
     })
   }
 }

 const EditableCell = ({
   shop,
   field,
   value,
   type = 'text'
 }: {
   shop: CoffeeShop
   field: string
   value: any
   type?: 'text' | 'number'
 }) => {
   const isEditing = editingCell?.id === shop.id && editingCell?.field === field
   const [editValue, setEditValue] = useState(value?.toString() || '')

   const handleCellEdit = async (newValue: string) => {
     try {
       const response = await fetch(`/api/coffee-shops/${shop.id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ [field]: type === 'number' ? Number(newValue) : newValue }),
       })

       if (!response.ok) throw new Error("Failed to update coffee shop")

       toast({
         title: "Coffee shop updated",
         description: "The coffee shop has been updated successfully.",
       })

       mutate()
       setEditingCell(null)
     } catch (error) {
       toast({
         title: "Error",
         description: "Failed to update coffee shop. Please try again.",
         variant: "destructive",
       })
     }
   }

   if (isEditing) {
     return (
       <div className="flex items-center gap-2">
         <Input
           type={type}
           value={editValue}
           onChange={(e) => setEditValue(e.target.value)}
           className="h-8 w-[200px]"
           onKeyPress={(e) => {
             if (e.key === 'Enter') {
               handleCellEdit(editValue)
             }
           }}
         />
         <Button
           size="sm"
           onClick={() => handleCellEdit(editValue)}
         >
           Save
         </Button>
         <Button
           size="sm"
           variant="ghost"
           onClick={() => setEditingCell(null)}
         >
           Cancel
         </Button>
       </div>
     )
   }

   return (
     <div
       className="cursor-pointer hover:bg-muted/50 p-2 rounded"
       onClick={() => setEditingCell({ id: shop.id, field })}
     >
       {value || "-"}
     </div>
   )
 }

 if (loading) return <div>Loading...</div>
 if (error) return <div>Error loading coffee shops</div>

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
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="outline">
               <Filter className="mr-2 h-4 w-4" />
               Filters {filters.length > 0 && `(${filters.length})`}
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="start" className="w-[300px]">
             <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {Object.entries(filterOperators).map(([type, operators]) => (
               <DropdownMenuSub key={type}>
                 <DropdownMenuSubTrigger>
                   {type.charAt(0).toUpperCase() + type.slice(1)} Fields
                 </DropdownMenuSubTrigger>
                 <DropdownMenuSubContent>
                   {operators.map(operator => (
                     <DropdownMenuItem
                       key={operator}
                       onClick={() => {
                         // Add specific field filter logic here
                       }}
                     >
                       {operatorLabels[operator]}
                     </DropdownMenuItem>
                   ))}
                 </DropdownMenuSubContent>
               </DropdownMenuSub>
             ))}
             {filters.length > 0 && (
               <>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem
                   className="text-red-600"
                   onClick={clearAllFilters}
                 >
                   <XCircle className="mr-2 h-4 w-4" />
                   Clear All Filters
                 </DropdownMenuItem>
               </>
             )}
           </DropdownMenuContent>
         </DropdownMenu>
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

     {filters.length > 0 && (
       <div className="flex flex-wrap gap-2">
         {filters.map((filter, index) => (
           <Badge
             key={index}
             variant="secondary"
             className="flex items-center gap-2"
           >
             {filter.field} {filter.operator} {filter.value}
             <XCircle
               className="h-4 w-4 cursor-pointer"
               onClick={() => removeFilter(index)}
             />
           </Badge>
         ))}
       </div>
     )}

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
                    <EditableCell shop={shop} field="area" value={shop.area} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={shop.visited ? "success" : "default"}
                      className="cursor-pointer"
                      onClick={() => handleStatusToggle(shop, 'visited')}
                    >
                      {shop.visited ? "Visited" : "Not Visited"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <EditableCell 
                      shop={shop} 
                      field="rating" 
                      value={shop.rating} 
                      type="number" 
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell 
                      shop={shop} 
                      field="instagram" 
                      value={shop.instagram} 
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell 
                      shop={shop} 
                      field="followers" 
                      value={shop.followers} 
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={shop.parlor_coffee_leads ? "warning" : "default"}
                      className="cursor-pointer"
                      onClick={() => handleStatusToggle(shop, 'parlor_coffee_leads')}
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
   }________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/coffee-shops/instagram-cell.tsx
// src/components/coffee-shops/instagram-cell.tsx
"use client"

import { useState } from "react"
import { Instagram, Edit, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CoffeeShop } from "@prisma/client"

interface InstagramCellProps {
  shop: CoffeeShop
  onUpdate: (value: string) => Promise<void>
}

export function InstagramCell({ shop, onUpdate }: InstagramCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(shop.instagram || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Clean the Instagram handle
      const cleanedValue = editValue
        .trim()
        .replace("@", "")
        .replace("https://www.instagram.com/", "")
        .replace("/", "")

      await onUpdate(cleanedValue)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Instagram handle updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Instagram handle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatInstagramUrl = (handle: string) => {
    const cleanHandle = handle
      .replace("@", "")
      .replace("https://www.instagram.com/", "")
      .replace("/", "")
    return `https://www.instagram.com/${cleanHandle}`
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Instagram handle"
          className="h-8 w-[200px]"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSave()
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setEditValue(shop.instagram || "")
          }}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {shop.instagram ? (
        <Link
          href={formatInstagramUrl(shop.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Instagram className="h-4 w-4" />
          {shop.instagram.startsWith("@") ? shop.instagram : `@${shop.instagram}`}
        </Link>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/coffee-shops/new-coffee-shop-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const coffeeShopSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  price: z.string().optional(),
  type: z.string().optional(),
  types: z.array(z.string()).default([]),
  is_source: z.boolean().default(false),
  parlor_coffee_leads: z.boolean().default(false),
})

type FormData = z.infer<typeof coffeeShopSchema>

export function NewCoffeeShopForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(coffeeShopSchema),
    defaultValues: {
      is_source: false,
      parlor_coffee_leads: false,
      types: [],
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const response = await fetch("/api/coffee-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create coffee shop")
      }

      toast({
        title: "Coffee shop created",
        description: "The coffee shop has been created successfully.",
      })

      router.push("/dashboard/coffee-shops")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coffee shop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coffee Shop Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Coffee Shop Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Upper East Side" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="40.7128"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="is_source"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Source Location</FormLabel>
                      <FormDescription>
                        Mark this as a source/partner location
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parlor_coffee_leads"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Potential Lead</FormLabel>
                      <FormDescription>
                        Mark this as a potential lead
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/coffee-shops")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Coffee Shop"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(request: Request) {
  try {
    console.log("Fetching coffee shops...")  // Debug log
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log(`Found ${coffeeShops.length} coffee shops`)  // Debug log
    return NextResponse.json(coffeeShops)
  } catch (error) {
    console.error("[COFFEE_SHOPS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/coffee-shops/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: {
        id: params.id
      }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.coffeeShop.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    const coffeeShop = await prisma.coffeeShop.update({
      where: {
        id: params.id
      },
      data: json
    })

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/coffee-shops/[id]/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const visits = await prisma.visit.findMany({
      where: {
        coffeeShopId: params.id
      },
      orderBy: {
        date: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const json = await request.json()

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { 
        coffeeShopId: params.id 
      }
    })

    const visit = await prisma.visit.create({
      data: {
        ...json,
        coffeeShopId: params.id,
        userId: session.user.id,
        visitNumber: visitCount + 1
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Update coffee shop's visited status
    await prisma.coffeeShop.update({
      where: { id: params.id },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/routes/[shopId]/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const visitSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = visitSchema.parse(json)

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { shopId: params.shopId }
    })

    const visit = await prisma.visit.create({
      data: {
        ...body,
        shopId: params.shopId,
        visitNumber: visitCount + 1,
        userId: session.user.id
      }
    })

    // Update shop's visited status
    await prisma.shop.update({
      where: { id: params.shopId },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const visits = await prisma.visit.findMany({
      where: { shopId: params.shopId },
      orderBy: { date: "desc" },
      include: {
        photos: true
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/api/routes/generate/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { RouteOptimizer } from "@/lib/route-optimizer"

const routeSettingsSchema = z.object({
  startingPoint: z.string(),
  maxStops: z.number().min(1).max(20),
  maxDistance: z.number().min(1).max(10)
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const settings = routeSettingsSchema.parse(json)

    // Get starting point shop
    const startShop = await prisma.shop.findUnique({
      where: { id: settings.startingPoint }
    })

    if (!startShop) {
      return new NextResponse("Starting point not found", { status: 404 })
    }

    // Get potential target shops
    const targetShops = await prisma.shop.findMany({
      where: {
        id: { not: settings.startingPoint },
        // Add any additional filters like visited status
      }
    })

    // Initialize route optimizer
    const optimizer = new RouteOptimizer({
      maxStops: settings.maxStops,
      maxDistance: settings.maxDistance
    })

    // Generate optimized route
    const route = await optimizer.generateRoute(startShop, targetShops)

    return NextResponse.json(route)
  } catch (error) {
    console.error("[ROUTE_GENERATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-calendar-intersection.ts
import { useState, useEffect, useRef } from 'react';

interface UseCalendarIntersectionOptions {
 root?: Element | null;
 rootMargin?: string;
 threshold?: number | number[];
}

export function useCalendarIntersection(
 options: UseCalendarIntersectionOptions = {}
) {
 const [isIntersecting, setIntersecting] = useState(false);
 const targetRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const observer = new IntersectionObserver(([entry]) => {
     setIntersecting(entry.isIntersecting);
   }, {
     root: options.root || null,
     rootMargin: options.rootMargin || '0px',
     threshold: options.threshold || 0,
   });

   if (targetRef.current) {
     observer.observe(targetRef.current);
   }

   return () => observer.disconnect();
 }, [options.root, options.rootMargin, options.threshold]);

 return [targetRef, isIntersecting] as const;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-coffee-shops.ts
// src/hooks/use-coffee-shops.ts
import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return res.json()
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
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-media-query.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Start listening for changes
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-selected-shop.ts
import { useMapStore } from '@/store/use-map'

export function useSelectedShop() {
  const selectedShop = useMapStore((state) => state.selectedShop)
  const setSelectedShop = useMapStore((state) => state.setSelectedShop)

  return {
    selectedShop,
    setSelectedShop,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-shop-visits.ts
import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShopVisits(shopId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    shopId ? `/api/coffee-shops/${shopId}/visits` : null,
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-shops.ts
import useSWR from 'swr'
import { CoffeeShop } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useShops() {
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/hooks/use-visits.ts
import useSWR from 'swr'
import { Visit } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useVisits() {
  const { data, error, isLoading, mutate } = useSWR<Visit[]>(
    '/api/visits',
    fetcher
  )

  return {
    visits: data,
    loading: isLoading,
    error: error,
    mutate,
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/analytics.prisma
model AnalyticsSnapshot {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  date          DateTime
  metrics       Json
  type          String   // UTILIZATION, LABOR_COST, COVERAGE
  filters       Json?
  createdAt     DateTime @default(now())
}

model Report {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  type          String
  filters       Json
  schedule      Json?    // For automated reports
  lastRun       DateTime?
  createdBy     String   @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Alert {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String
  severity      String
  message       String
  metadata      Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}
model User {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  email         String      @unique
  name          String?
  password      String
  role          Role        @default(USER)
  contacts      Contact[]
  bio           String?
  phoneNumber   String?
  preferences   Json?
  notifications Json?
  activities    Activity[]
  orders        Order[]
  quickNotes    QuickNote[]
  menuItems     MenuItem[]
  visits        Visit[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
  coffeeShops   CoffeeShop[] // Add this line to complete the relation

}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId
  type        String
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
  contact     Contact  @relation(fields: [contactId], references: [id])
}

model Contact {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName   String
  lastName    String
  email       String
  phone       String?
  company     String?
  notes       String?
  status      Status     @default(NEW)
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  Activity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  shop        Shop?      @relation(fields: [shopId], references: [id])
  shopId      String?    @db.ObjectId
}

model MenuItem {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userId      String      @db.ObjectId
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime    @default(now())
  total          Float
  isComplimentary Boolean     @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String      @db.ObjectId
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId  String    @db.ObjectId
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String    @db.ObjectId
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuickNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  content   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  qrCodes   QRCode[]
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String         @db.ObjectId
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?        @db.ObjectId
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]
  design        QRDesign?
  scans         Scan[]
}

model QRDesign {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  size                  Int      @default(300)
  backgroundColor       String   @default("#FFFFFF")
  foregroundColor       String   @default("#000000")
  logoImage            String?
  logoWidth            Int?
  logoHeight           Int?
  dotStyle             String    @default("squares")
  margin               Int       @default(20)
  errorCorrectionLevel String    @default("M")
  style                Json
  logoStyle            Json?
  imageRendering       String    @default("auto")
  qrCodeId             String    @unique @db.ObjectId
  qrCode               QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Scan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId    String   @db.ObjectId
  qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  userAgent   String?
  ipAddress   String?
  location    String?
  device      String?
  browser     String?
  os          String?
  timestamp   DateTime @default(now())
}

model DeviceRule {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String   @db.ObjectId
  qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  deviceType String
  browsers   String[]
  os         String[]
  targetUrl  String
  priority   Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ScheduleRule {
  id         String    @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String    @db.ObjectId
  qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  startDate  DateTime
  endDate    DateTime?
  timeZone   String
  daysOfWeek Int[]
  startTime  String?
  endTime    String?
  targetUrl  String
  priority   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences Json?
  maxShiftsPerWeek Int               @default(5)
  preferredShiftLength Int           @default(8)
  preferredDays    Int[]
  blackoutDates    DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int               @default(8)
  notes            String?
}

model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int
  startTime String
  endTime   String
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SchedulingRule {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  name                 String
  description          String?
  isActive             Boolean  @default(true)
  ruleType             RuleType @default(BASIC)
  minStaffPerShift     Int?
  maxStaffPerShift     Int?
  requireCertification Boolean  @default(false)
  requiredCertifications String[]
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[]
  preferredHours       String[]
  roleRequirements     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model TimeOff {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String       @db.ObjectId
  staff       Staff        @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model CoffeeShop {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  address               String
  website               String?
  manager_present       String?
  contact_name          String?
  contact_email         String?
  phone                 String?
  visited               Boolean   @default(false)
  instagram             String?
  followers             Int?
  store_doors           String?
  volume                String?
  first_visit           DateTime?
  second_visit          DateTime?
  third_visit           DateTime?
  rating                Float?
  reviews               Int?
  price_type            String?
  type                  String?
  types                 String[]
  service_options       Json?
  hours                 String?
  operating_hours       Json?
  gps_coordinates       Json?
  latitude              Float
  longitude             Float
  area                  String?
  is_source             Boolean   @default(false)
  quality_score         Float?
  parlor_coffee_leads   Boolean   @default(false)
  visits                Visit[]
  userId                String?   @db.ObjectId
  user                  User?     @relation(fields: [userId], references: [id])
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Visit {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  shopId        String    @db.ObjectId
  userId        String    @db.ObjectId
  visitNumber   Int
  date          DateTime
  managerPresent Boolean  @default(false)
  managerName   String?
  managerContact String?
  samplesDropped Boolean  @default(false)
  sampleDetails String?
  notes         String?
  nextVisitDate DateTime?
  photos        Photo[]   
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  shop          Shop      @relation(fields: [shopId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id])

}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  visitId   String   @db.ObjectId
  url       String
  caption   String?
  createdAt DateTime @default(now())
  visit     Visit    @relation(fields: [visitId], references: [id])
}

model Shop {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  address     String
  latitude    Float
  longitude   Float
  rating      Float?
  reviews     Int?
  website     String?
  phone       String?
  visited     Boolean   @default(false)
  visits      Visit[]
  contacts    Contact[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum Status {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}



________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/dashboard/routes/layout.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/app/dashboard/routes/page.tsx
import { Map } from "@/components/routes/map/map"
import { RouteControls } from "@/components/routes/map/route-controls"
import { VisitManagement } from "@/components/routes/visit/visit-management"

export const metadata = {
  title: "Route Planning & Visits | BUF BARISTA CRM",
  description: "Plan and optimize your coffee shop visits",
}

export default function RoutePlanningPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Planning & Visits</h1>
          <p className="text-muted-foreground">
            Plan your routes and manage coffee shop visits
          </p>
        </div>        
      </div>
      
      <div className="grid gap-4 grid-cols-12">
        {/* Left Panel - Controls */}
        <div className="col-span-3 space-y-4">
          <RouteControls />
          <VisitManagement shop={null} />
        </div>
        
        {/* Right Panel - Map */}
        <div className="col-span-9">
          <Map />
        </div>
      </div>

    </div>
  )
}________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/visit/visit-form.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { useVisitStore } from "@/store/use-visit"
import { VisitFormData } from "@/types/visit"

const visitFormSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
  photos: z.array(z.instanceof(File)).optional(),
})

interface VisitFormProps {
  shopId: string;
  onComplete: () => void;
}

export function VisitForm({ shopId, onComplete }: VisitFormProps) {
  const [loading, setLoading] = useState(false)
  const { addVisit } = useVisitStore()

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: new Date(),
      managerPresent: false,
      samplesDropped: false,
    },
  })

  async function onSubmit(data: VisitFormData) {
    setLoading(true)
    try {
      await addVisit(shopId, data)
      onComplete()
    } catch (error) {
      console.error("Failed to save visit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerPresent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Manager Present</FormLabel>
                <FormDescription>
                  Was the manager present during the visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("managerPresent") && (
          <>
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="samplesDropped"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Samples Dropped</FormLabel>
                <FormDescription>
                  Did you leave any samples during this visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("samplesDropped") && (
          <FormField
            control={form.control}
            name="sampleDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Details</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="List the samples provided..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any notes about the visit..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    field.onChange(files)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextVisitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Visit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/visit/visit-history.tsx
"use client"

import { formatDistanceToNow as formatDistance } from "date-fns"
import { Visit } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VisitHistoryProps {
  visits: Visit[]
}

export function VisitHistory({ visits }: VisitHistoryProps) {
  if (!visits.length) {
    return <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Visit #{visit.visitNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistance(new Date(visit.date), new Date(), { addSuffix: true })}
              </p>
            </div>

            {visit.managerPresent && (
              <p className="text-sm">
                Manager present: {visit.managerName || "Yes"}
              </p>
            )}

            {visit.samplesDropped && (
              <p className="text-sm">
                Samples: {visit.sampleDetails || "Dropped off"}
              </p>
            )}

            {visit.notes && (
              <p className="text-sm text-muted-foreground">{visit.notes}</p>
            )}

            {visit.nextVisitDate && (
              <p className="text-xs text-muted-foreground">
                Next visit planned: {formatDistance(new Date(visit.nextVisitDate), new Date(), { addSuffix: true })}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/visit/visit-management.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitForm } from "./visit-form"
import { VisitHistory } from "./visit-history"
import { useShopVisits } from "@/hooks/use-shop-visits"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface VisitManagementProps {
  shop: CoffeeShop | null;
}

export function VisitManagement({ shop }: VisitManagementProps) {
  const { visits, loading, error, mutate } = useShopVisits(shop?.id || null)
  const [showForm, setShowForm] = useState(false)

  if (!shop) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a coffee shop to view visit history
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading visits...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading visits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the visit history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Visit History - {shop.title}</CardTitle>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Visit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showForm ? (
          <VisitForm 
            shopId={shop.id} 
            onComplete={() => {
              setShowForm(false)
              mutate() // Refresh visits list
            }} 
          />
        ) : (
          <VisitHistory visits={visits || []} />
        )}
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/location-action-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { RouteGenerationDialog } from "./route-generation-dialog"

interface LocationActionDialogProps {
  shop: CoffeeShop
  onGenerateRoute: (shop: CoffeeShop) => void
  onVisitRecorded: () => void
}

export function LocationActionDialog({
  shop,
  onGenerateRoute,
  onVisitRecorded,
}: LocationActionDialogProps) {
  const { toast } = useToast()
  const [managerPresent, setManagerPresent] = useState(false)
  const [staffSize, setStaffSize] = useState("")
  const [showRouteDialog, setShowRouteDialog] = useState(false)

  const handleVisitRecord = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managerPresent,
          staffSize: parseInt(staffSize),
          date: new Date(),
        }),
      })

      if (!response.ok) throw new Error("Failed to record visit")

      toast({
        title: "Visit Recorded",
        description: "The visit has been successfully recorded.",
      })
      onVisitRecorded()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shop.title}</DialogTitle>
          <DialogDescription>
            {shop.address}
            <div className="flex gap-2 mt-2">
              {shop.visited && <Badge variant="success">Visited</Badge>}
              {shop.is_source && <Badge variant="default">Source Location</Badge>}
              {shop.parlor_coffee_leads && <Badge variant="warning">Lead</Badge>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Manager Present</Label>
            <Switch
              checked={managerPresent}
              onCheckedChange={setManagerPresent}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-2">Estimated Staff Size</Label>
            <Input
              type="number"
              value={staffSize}
              onChange={(e) => setStaffSize(e.target.value)}
              className="col-span-2"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setShowRouteDialog(true)}
            className="w-full"
          >
            Generate Route from Here
          </Button>
          <Button
            type="submit"
            onClick={handleVisitRecord}
            className="w-full"
            variant={shop.visited ? "outline" : "default"}
          >
            {shop.visited ? "Update Visit" : "Mark as Visited"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <RouteGenerationDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        startingPoint={shop}
        onGenerate={onGenerateRoute}
      />
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/map-preview.tsx
"use client"

import { useEffect, useState } from "react"
import { CoffeeShop } from "@prisma/client"
import { MapContainer, TileLayer, Circle, Marker } from "react-leaflet"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPreviewProps {
  startingPoint: CoffeeShop
  maxDistance: number
  className?: string
}

export function MapPreview({
  startingPoint,
  maxDistance,
  className
}: MapPreviewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={[startingPoint.latitude, startingPoint.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[startingPoint.latitude, startingPoint.longitude]}
        />
        <Circle
          center={[startingPoint.latitude, startingPoint.longitude]}
          radius={maxDistance * 1000}
          pathOptions={{ fillColor: "blue", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/map.tsx
"use client"

import { useEffect, useRef } from "react"
import { useMapStore } from "@/store/use-map"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { ShopMarker } from "./shop-marker"
import { RouteLayer } from "./route-layer"
import { useShops } from "@/hooks/use-shops"

export function Map() {
  const mapRef = useRef(null)
  const { shops = [], loading } = useShops()
  const { center, zoom, selectedShop, setSelectedShop } = useMapStore()

  if (loading) {
    return <div>Loading map...</div>
  }

  return (
    <div className="h-[800px] rounded-lg border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {shops?.map((shop) => (
          <ShopMarker
            key={shop.id}
            shop={shop}
            selected={selectedShop?.id === shop.id}
            onSelect={setSelectedShop}
          />
        ))}

        <RouteLayer />
      </MapContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/route-controls.tsx
"use client"

import { useState } from "react"
import { useRouteStore } from "@/store/use-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useShops } from "@/hooks/use-shops"

export function RouteControls() {
  const [loading, setLoading] = useState(false)
  const { generateRoute, clearRoute, settings, updateSettings } = useRouteStore()
  const { shops, loading: shopsLoading } = useShops()

  // Filter source shops (either is_source=true or visited=true)
  const sourceShops = shops?.filter(shop => shop.is_source || shop.visited) || []

  const handleGenerateRoute = async () => {
    setLoading(true)
    await generateRoute()
    setLoading(false)
  }

  if (shopsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Settings</CardTitle>
        </CardHeader>
        <CardContent>
          Loading source shops...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label>Starting Point</label>
          <Select
            value={settings.startingPoint}
            onValueChange={(value) => updateSettings({ startingPoint: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a starting point" />
            </SelectTrigger>
            <SelectContent>
              {sourceShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.title}
                  {shop.is_source && " (Partner)"}
                  {shop.visited && !shop.is_source && " (Visited)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select a partner shop or previously visited location
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Stops</label>
          <Input
            type="number"
            value={settings.maxStops}
            onChange={(e) => updateSettings({ maxStops: parseInt(e.target.value) })}
            min={1}
            max={20}
          />
          <p className="text-sm text-muted-foreground">
            Maximum number of stops in the route
          </p>
        </div>

        <div className="space-y-2">
          <label>Max Distance (km)</label>
          <Slider
            value={[settings.maxDistance]}
            onValueChange={(value) => updateSettings({ maxDistance: value[0] })}
            min={1}
            max={10}
            step={0.5}
          />
          <p className="text-sm text-muted-foreground">
            Maximum distance between stops
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleGenerateRoute} 
            className="w-full"
            disabled={loading || !settings.startingPoint}
          >
            {loading ? "Generating..." : "Generate Route"}
          </Button>
          <Button 
            onClick={clearRoute}
            variant="outline" 
            className="w-full"
          >
            Clear Route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/route-generation-dialog.tsx
"use client"

import { useState } from "react"
import { CoffeeShop } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MapPreview } from "./map-preview"

interface RouteGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startingPoint: CoffeeShop
  onGenerate: (shop: CoffeeShop) => void
}

export function RouteGenerationDialog({
  open,
  onOpenChange,
  startingPoint,
  onGenerate,
}: RouteGenerationDialogProps) {
  const [maxStops, setMaxStops] = useState(5)
  const [maxDistance, setMaxDistance] = useState(2)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/routes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startingPoint: startingPoint.id,
          maxStops,
          maxDistance,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate route")

      const route = await response.json()
      onGenerate(route)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to generate route:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Route</DialogTitle>
          <DialogDescription>
            Generate a route starting from {startingPoint.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Maximum Stops</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxStops]}
                onValueChange={(value) => setMaxStops(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxStops}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance (km)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                min={0.5}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-center">{maxDistance}</span>
            </div>
          </div>

          <MapPreview
            startingPoint={startingPoint}
            maxDistance={maxDistance}
            className="h-[200px] rounded-lg border"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/route-layer.tsx
"use client"

import { Polyline } from "react-leaflet"
import { CoffeeShop } from "@prisma/client"

interface RouteLayerProps {
  route?: CoffeeShop[]
  color?: string
}

export function RouteLayer({ route, color = "#3B82F6" }: RouteLayerProps) {
  if (!route || route.length < 2) return null

  const positions = route.map(shop => [shop.latitude, shop.longitude])

  return (
    <Polyline
      positions={positions as [number, number][]}
      pathOptions={{
        color,
        weight: 3,
        opacity: 0.7,
      }}
    />
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/map/shop-marker.tsx
"use client"

import { useState } from "react"
import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { CoffeeShop } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouteStore } from "@/store/use-route"
import "leaflet/dist/leaflet.css"

interface ShopMarkerProps {
  shop: CoffeeShop
  selected?: boolean
  onSelect?: (shop: CoffeeShop) => void
}

export function ShopMarker({ shop, selected, onSelect }: ShopMarkerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [managerPresent, setManagerPresent] = useState(false)
  const [managerName, setManagerName] = useState("")
  const [samplesDropped, setSamplesDropped] = useState(false)
  const [sampleDetails, setSampleDetails] = useState("")
  const [notes, setNotes] = useState("")
  const { updateSettings, generateRoute } = useRouteStore()

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="
        w-8 h-8 rounded-full flex items-center justify-center text-white
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${shop.visited ? 'bg-green-500' : shop.is_source ? 'bg-red-500' : 'bg-blue-500'}
        ${shop.parlor_coffee_leads ? 'border-2 border-yellow-400' : ''}
      ">
        ${shop.visited ? '✓' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  const handleMarkVisited = async () => {
    try {
      const response = await fetch(`/api/coffee-shops/${shop.id}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(),
          managerPresent,
          managerName: managerName || undefined,
          samplesDropped,
          sampleDetails: sampleDetails || undefined,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to record visit')

      toast({
        title: "Visit recorded",
        description: "The shop has been marked as visited",
      })

      setVisitDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record visit",
        variant: "destructive",
      })
    }
  }

  const handleGenerateRoute = async () => {
    try {
      await updateSettings({ startingPoint: shop.id })
      await generateRoute()
      toast({
        title: "Route generated",
        description: `Route generated from ${shop.title}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate route",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Marker
        position={[shop.latitude, shop.longitude]}
        icon={customIcon}
        eventHandlers={{
          click: () => onSelect?.(shop),
        }}
      >
        <Popup>
          <div className="min-w-[200px] space-y-4">
            <div>
              <h3 className="font-bold mb-1">{shop.title}</h3>
              <p className="text-sm mb-1">{shop.address}</p>
              {shop.rating && (
                <p className="text-sm mb-1">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
              {shop.visited && (
                <p className="text-sm text-green-600">✓ Visited</p>
              )}
              {shop.parlor_coffee_leads && (
                <p className="text-sm text-yellow-600">🎯 Lead</p>
              )}
              {shop.is_source && (
                <p className="text-sm text-red-600">📍 Source Location</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleGenerateRoute}
                className="w-full"
              >
                Generate Route From Here
              </Button>
              
              {!shop.visited && (
                <Button 
                  onClick={() => setVisitDialogOpen(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Mark as Visited
                </Button>
              )}

              {shop.website && (
                <Button 
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Popup>
      </Marker>

      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Visit - {shop.title}</DialogTitle>
            <DialogDescription>
              Record details about your visit to this coffee shop
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="manager-present">Manager Present</Label>
              <Switch
                id="manager-present"
                checked={managerPresent}
                onCheckedChange={setManagerPresent}
              />
            </div>

            {managerPresent && (
              <div className="space-y-2">
                <Label htmlFor="manager-name">Manager's Name</Label>
                <Input
                  id="manager-name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Enter manager's name"
                />
              </div>
            )}

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="samples-dropped">Samples Dropped</Label>
              <Switch
                id="samples-dropped"
                checked={samplesDropped}
                onCheckedChange={setSamplesDropped}
              />
            </div>

            {samplesDropped && (
              <div className="space-y-2">
                <Label htmlFor="sample-details">Sample Details</Label>
                <Input
                  id="sample-details"
                  value={sampleDetails}
                  onChange={(e) => setSampleDetails(e.target.value)}
                  placeholder="Enter sample details"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the visit"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVisitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkVisited}>
              Record Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/analytics/leads-analytics.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"
import { CoffeeShop } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LeadsAnalytics() {
  const { shops, loading } = useShops()
  const [leads, setLeads] = useState<CoffeeShop[]>([])

  useEffect(() => {
    if (shops) {
      const leadShops = shops
        .filter(shop => shop.parlor_coffee_leads)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setLeads(leadShops)
    }
  }, [shops])

  if (loading) {
    return <div>Loading leads...</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {leads.map((shop) => (
          <div key={shop.id} className="flex items-start space-x-4">
            <Badge variant={shop.visited ? "success" : "default"}>
              {shop.visited ? "Visited" : "New Lead"}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{shop.title}</p>
              <p className="text-sm text-muted-foreground">{shop.area}</p>
              {shop.rating && (
                <p className="text-xs">⭐ {shop.rating} ({shop.reviews} reviews)</p>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads generated yet</p>
        )}
      </div>
    </ScrollArea>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/analytics/route-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitStats } from "./visit-stats"
import { VisitChart } from "./visit-chart"
import { LeadsAnalytics } from "./leads-analytics"

export function RouteAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Visit Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitStats />
          <VisitChart />
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsAnalytics />
        </CardContent>
      </Card>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/analytics/visit-chart.tsx
"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useShops } from "@/hooks/use-shops"

interface VisitData {
  area: string
  totalShops: number
  visitedShops: number
  leads: number
}

export function VisitChart() {
  const { shops, loading } = useShops()
  const [data, setData] = useState<VisitData[]>([])

  useEffect(() => {
    if (shops && shops.length > 0) {
      // Group shops by area
      const areaData = shops.reduce((acc, shop) => {
        const area = shop.area || 'Unknown'
        if (!acc[area]) {
          acc[area] = {
            area,
            totalShops: 0,
            visitedShops: 0,
            leads: 0
          }
        }
        
        acc[area].totalShops++
        if (shop.visited) acc[area].visitedShops++
        if (shop.parlor_coffee_leads) acc[area].leads++
        
        return acc
      }, {} as Record<string, VisitData>)

      setData(Object.values(areaData))
    }
  }, [shops])

  if (loading) {
    return <div>Loading chart...</div>
  }

  return (
    <div className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalShops" name="Total Shops" fill="#94a3b8" />
          <Bar dataKey="visitedShops" name="Visited" fill="#22c55e" />
          <Bar dataKey="leads" name="Leads" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/components/routes/analytics/visit-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { useShops } from "@/hooks/use-shops"

interface VisitStats {
  totalVisits: number
  totalShops: number
  visitedShops: number
  visitRate: number
  leadsGenerated: number
  conversionRate: number
}

export function VisitStats() {
  const { shops, loading } = useShops()
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    totalShops: 0,
    visitedShops: 0,
    visitRate: 0,
    leadsGenerated: 0,
    conversionRate: 0
  })

  useEffect(() => {
    if (shops && shops.length > 0) {
      const visitedShops = shops.filter(shop => shop.visited).length
      const leadsGenerated = shops.filter(shop => shop.parlor_coffee_leads).length

      setStats({
        totalVisits: 0, // This would come from Visit records
        totalShops: shops.length,
        visitedShops,
        visitRate: (visitedShops / shops.length) * 100,
        leadsGenerated,
        conversionRate: (leadsGenerated / visitedShops) * 100 || 0
      })
    }
  }, [shops])

  if (loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Visit Rate"
        value={`${stats.visitRate.toFixed(1)}%`}
        description={`${stats.visitedShops} of ${stats.totalShops} shops`}
      />
      <StatCard
        title="Leads Generated"
        value={stats.leadsGenerated.toString()}
        description="Potential opportunities"
      />
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        description="Visits to leads"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-map.ts
import { create } from 'zustand'
import { Shop } from '@/types/shop'

interface MapState {
  center: [number, number]
  zoom: number
  selectedShop: Shop | null
  setSelectedShop: (shop: Shop | null) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
}

export const useMapStore = create<MapState>((set) => ({
  center: [40.7128, -74.0060], // Default to NYC coordinates
  zoom: 12,
  selectedShop: null,
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
}))
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-route.ts
import { create } from 'zustand'
import { CoffeeShop } from '@prisma/client'
import { RouteOptimizer } from '@/lib/route-optimizer'

interface RouteSettings {
  startingPoint: string
  maxStops: number
  maxDistance: number
}

interface RouteState {
  settings: RouteSettings
  currentRoute: CoffeeShop[]
  loading: boolean
  error: string | null
  updateSettings: (settings: Partial<RouteSettings>) => void
  generateRoute: () => Promise<void>
  clearRoute: () => void
}

export const useRouteStore = create<RouteState>((set, get) => ({
  settings: {
    startingPoint: '',
    maxStops: 10,
    maxDistance: 5,
  },
  currentRoute: [],
  loading: false,
  error: null,

  updateSettings: (newSettings) => 
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  generateRoute: async () => {
    set({ loading: true, error: null })
    try {
      const { settings } = get()
      
      // Fetch shops
      const shopsResponse = await fetch('/api/coffee-shops')
      const shops: CoffeeShop[] = await shopsResponse.json()
      
      // Find starting shop
      const startShop = shops.find(shop => shop.id === settings.startingPoint)
      if (!startShop) throw new Error('Starting point not found')
      
      // Get target shops (exclude visited and source locations)
      const targetShops = shops.filter(shop => 
        !shop.visited && 
        !shop.is_source && 
        shop.id !== settings.startingPoint
      )

      // Initialize optimizer
      const optimizer = new RouteOptimizer({
        maxStops: settings.maxStops,
        maxDistance: settings.maxDistance
      })

      // Generate route
      const route = await optimizer.generateRoute(startShop, targetShops)
      
      // Update state with route
      set({ 
        currentRoute: [startShop, ...route.map(stop => stop.shop)],
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  clearRoute: () => set({ currentRoute: [] }),
}))
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-scheduling-store.ts
import { create } from 'zustand';
import { Shift, Staff, ShiftTemplate } from '@/types/scheduling';
import { ShiftType, StaffRole } from '@prisma/client';

interface DateRange {
  from: Date;
  to: Date;
}

interface SchedulingState {
  // Data
  shifts: Shift[];
  staff: Staff[];
  templates: ShiftTemplate[];
  
  // UI State
  selectedDate: Date;
  dateRange: DateRange;
  selectedShift: string | null;
  selectedStaff: string | null;
  
  // Filters
  filter: {
    shiftType: ShiftType | 'ALL';
    staffRole: StaffRole | null;
    certifications: string[];
    dateRange: DateRange | null;
  };

  // Loading States
  isLoading: {
    shifts: boolean;
    staff: boolean;
    templates: boolean;
  };

  // Actions
  setShifts: (shifts: Shift[]) => void;
  setStaff: (staff: Staff[]) => void;
  setTemplates: (templates: ShiftTemplate[]) => void;
  setSelectedDate: (date: Date) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedShift: (shiftId: string | null) => void;
  setSelectedStaff: (staffId: string | null) => void;
  setFilter: (filter: Partial<SchedulingState['filter']>) => void;
  setLoading: (key: keyof SchedulingState['isLoading'], value: boolean) => void;
}

export const useSchedulingStore = create<SchedulingState>((set) => ({
  // Initial Data
  shifts: [],
  staff: [],
  templates: [],

  // Initial UI State
  selectedDate: new Date(),
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  },
  selectedShift: null,
  selectedStaff: null,

  // Initial Filters
  filter: {
    shiftType: 'ALL',
    staffRole: null,
    certifications: [],
    dateRange: null,
  },

  // Initial Loading States
  isLoading: {
    shifts: false,
    staff: false,
    templates: false,
  },

  // Actions
  setShifts: (shifts) => set({ shifts }),
  setStaff: (staff) => set({ staff }),
  setTemplates: (templates) => set({ templates }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedShift: (selectedShift) => set({ selectedShift }),
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  setLoading: (key, value) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
}));

// Selectors
export const useSelectedShift = () => useSchedulingStore(
  (state) => state.shifts.find(s => s.id === state.selectedShift)
);

export const useFilteredShifts = () => useSchedulingStore((state) => {
  const { shifts, filter } = state;
  return shifts.filter(shift => {
    if (filter.shiftType !== 'ALL' && shift.type !== filter.shiftType) return false;
    if (filter.dateRange) {
      const shiftDate = new Date(shift.startTime);
      if (shiftDate < filter.dateRange.from || shiftDate > filter.dateRange.to) return false;
    }
    return true;
  });
});

export const useFilteredStaff = () => useSchedulingStore((state) => {
  const { staff, filter } = state;
  return staff.filter(s => {
    if (filter.staffRole && s.role !== filter.staffRole) return false;
    if (filter.certifications.length > 0) {
      return filter.certifications.every(cert => s.certifications.includes(cert));
    }
    return true;
  });
});
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-shift-store.ts
import { create } from 'zustand';
import { Shift } from '@/types/scheduling/shift';

interface ShiftStore {
 shifts: Shift[];
 selectedShift: Shift | null;
 loading: boolean;
 error: string | null;
 draggingShift: {
   shift: Shift;
   type: 'move' | 'resize';
 } | null;
 
 // Actions
 setShifts: (shifts: Shift[]) => void;
 selectShift: (shift: Shift | null) => void;
 setLoading: (loading: boolean) => void;
 setError: (error: string | null) => void;
 setDraggingShift: (dragging: { shift: Shift; type: 'move' | 'resize' } | null) => void;
 
 // Async actions
 fetchShifts: (startDate: Date, endDate: Date) => Promise<void>;
 createShift: (shiftData: Partial<Shift>) => Promise<void>;
 updateShift: (id: string, shiftData: Partial<Shift>) => Promise<void>;
 deleteShift: (id: string) => Promise<void>;
 assignStaff: (shiftId: string, staffId: string) => Promise<void>;
 removeStaffAssignment: (shiftId: string, staffId: string) => Promise<void>;
}

export const useShiftStore = create<ShiftStore>((set, get) => ({
 shifts: [],
 selectedShift: null,
 loading: false,
 error: null,
 draggingShift: null,

 setShifts: (shifts) => set({ shifts }),
 selectShift: (shift) => set({ selectedShift: shift }),
 setLoading: (loading) => set({ loading }),
 setError: (error) => set({ error }),
 setDraggingShift: (dragging) => set({ draggingShift: dragging }),

 fetchShifts: async (startDate: Date, endDate: Date) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
     );
     
     if (!response.ok) throw new Error('Failed to fetch shifts');
     
     const shifts = await response.json();
     set({ shifts, loading: false });
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to fetch shifts',
       loading: false 
     });
   }
 },

 createShift: async (shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch('/api/scheduling/shifts', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to create shift');
     
     const newShift = await response.json();
     set((state) => ({ 
       shifts: [...state.shifts, newShift],
       loading: false 
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to create shift',
       loading: false 
     });
   }
 },

 updateShift: async (id, shiftData) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shiftData),
     });
     
     if (!response.ok) throw new Error('Failed to update shift');
     
     const updatedShift = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => s.id === id ? updatedShift : s),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to update shift',
       loading: false 
     });
   }
 },

 deleteShift: async (id) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${id}`, {
       method: 'DELETE',
     });
     
     if (!response.ok) throw new Error('Failed to delete shift');
     
     set((state) => ({
       shifts: state.shifts.filter((s) => s.id !== id),
       selectedShift: null,
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to delete shift',
       loading: false 
     });
   }
 },

 assignStaff: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(`/api/scheduling/shifts/${shiftId}/assignments`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ staffId }),
     });
     
     if (!response.ok) throw new Error('Failed to assign staff');
     
     const assignment = await response.json();
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: [...s.assignedStaff, assignment]
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to assign staff',
       loading: false 
     });
   }
 },

 removeStaffAssignment: async (shiftId, staffId) => {
   try {
     set({ loading: true, error: null });
     const response = await fetch(
       `/api/scheduling/shifts/${shiftId}/assignments?staffId=${staffId}`,
       { method: 'DELETE' }
     );
     
     if (!response.ok) throw new Error('Failed to remove staff assignment');
     
     set((state) => ({
       shifts: state.shifts.map((s) => {
         if (s.id === shiftId) {
           return {
             ...s,
             assignedStaff: s.assignedStaff.filter(
               (a) => a.staffId !== staffId
             )
           };
         }
         return s;
       }),
       loading: false
     }));
   } catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Failed to remove staff assignment',
       loading: false 
     });
   }
 }
}));
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-sidebar.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isResetting: boolean;
  toggleCollapse: () => void;
  onResetStart: () => void;
  onResetEnd: () => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isResetting: false,
      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      onResetStart: () => set({ isResetting: true }),
      onResetEnd: () => set({ isResetting: false }),
    }),
    {
      name: 'sidebar-state',
    }
  )
);
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/bufbarista-crm/src/store/use-visit.ts
import { create } from 'zustand'
import { Visit, VisitFormData } from '@/types/visit'

interface VisitState {
  visits: Visit[]
  loading: boolean
  error: string | null
  fetchVisits: (shopId: string) => Promise<void>
  addVisit: (shopId: string, data: VisitFormData) => Promise<void>
  updateVisit: (visitId: string, data: Partial<VisitFormData>) => Promise<void>
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  loading: false,
  error: null,

  fetchVisits: async (shopId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`)
      if (!response.ok) throw new Error('Failed to fetch visits')

      const visits = await response.json()
      set({ visits, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  addVisit: async (shopId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to add visit')

      const newVisit = await response.json()
      set((state) => ({
        visits: [...state.visits, newVisit],
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  updateVisit: async (visitId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update visit')

      const updatedVisit = await response.json()
      set((state) => ({
        visits: state.visits.map((visit) =>
          visit.id === visitId ? updatedVisit : visit
        ),
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },
}))
________________________________________________________________________________
