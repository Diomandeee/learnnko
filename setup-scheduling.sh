#!/bin/bash

# Create the PeopleCardView component
cat > "src/components/people/people-table.tsx" << 'EOF'
"use client"

import { useState, useMemo } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  MoreHorizontal,
  Mail,
  Building,
  Phone,
  User,
  Star,
  Trash2,
  Edit,
  ArrowUpDown,
  Filter,
} from "lucide-react"
import { format } from "date-fns"
import { usePeople } from "@/hooks/use-people"
import { Person } from "@prisma/client"

type SortField = 'name' | 'email' | 'company' | 'emailType' | 'verificationStatus' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface Filter {
  emailType?: 'professional' | 'generic' | null
  verificationStatus?: 'VALID' | 'INVALID' | 'UNVERIFIED' | null
  hasCompany?: boolean | null
}

interface PersonCardProps {
  person: Person
  onDelete: (id: string) => Promise<void>
}

function PersonCard({ person, onDelete }: PersonCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {person.firstName || person.lastName ? (
                `${person.firstName || ''} ${person.lastName || ''}`
              ) : (
                <span className="text-muted-foreground">No name</span>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${person.email}`}
                className="text-blue-600 hover:underline"
              >
                {person.email}
              </a>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(person.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <span>Details</span>
                <Edit className="h-4 w-4" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="truncate">
                        {person.phone || 'No phone'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="truncate">
                        {person.company || 'No company'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">Status</div>
                  <div className="flex gap-2">
                    <Badge 
                      variant={person.emailType === 'professional' ? 'default' : 'secondary'}
                    >
                      {person.emailType}
                    </Badge>
                    <Badge 
                      variant={
                        person.verificationStatus === 'VALID' ? 'success' :
                        person.verificationStatus === 'INVALID' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {person.verificationStatus}
                    </Badge>
                  </div>
                </div>

                {person.notes && (
                  <div className="space-y-2">
                    <div className="text-sm">Notes</div>
                    <div className="text-sm text-muted-foreground">
                      {person.notes}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm">Added</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(person.createdAt), 'PPP')}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export function PeopleTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{field: SortField, direction: SortDirection}>({
    field: 'createdAt',
    direction: 'desc'
  })
  const [filters, setFilters] = useState<Filter>({})
  const { people, loading, error, mutate } = usePeople()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete person")

      toast({
        title: "Success",
        description: "Person deleted successfully",
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete person",
        variant: "destructive",
      })
    }
  }

  const filteredAndSortedPeople = useMemo(() => {
    if (!people) return []

    let result = [...people]

    // Apply filters
    if (filters.emailType) {
      result = result.filter(person => person.emailType === filters.emailType)
    }
    if (filters.verificationStatus) {
      result = result.filter(person => person.verificationStatus === filters.verificationStatus)
    }
    if (filters.hasCompany !== undefined) {
      result = result.filter(person => filters.hasCompany ? !!person.company : !person.company)
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(person => 
        person.firstName?.toLowerCase().includes(search) ||
        person.lastName?.toLowerCase().includes(search) ||
        person.email.toLowerCase().includes(search) ||
        person.company?.toLowerCase().includes(search)
      )
    }

    // Apply sort
    result.sort((a, b) => {
      let aValue: any = null
      let bValue: any = null

      switch (sortConfig.field) {
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim()
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim()
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'company':
          aValue = a.company || ''
          bValue = b.company || ''
          break
        case 'emailType':
          aValue = a.emailType
          bValue = b.emailType
          break
        case 'verificationStatus':
          aValue = a.verificationStatus
          bValue = b.verificationStatus
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [people, searchTerm, sortConfig, filters])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-red-600">
        Error loading people. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Email Type</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.emailType === 'professional'}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  emailType: f.emailType === 'professional' ? null : 'professional'
                }))}
              >
                Professional
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.emailType === 'generic'}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  emailType: f.emailType === 'generic' ? null : 'generic'
                }))}
              >
                Generic
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Verification</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.verificationStatus === 'VALID'}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  verificationStatus: f.verificationStatus === 'VALID' ? null : 'VALID'
                }))}
              >
                Valid
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.verificationStatus === 'INVALID'}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  verificationStatus: f.verificationStatus === 'INVALID' ? null : 'INVALID'
                }))}
              >
                Invalid
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Company</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.hasCompany === true}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  hasCompany: f.hasCompany === true ? null : true
                }))}
              >
                Has Company
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.hasCompany === false}
                onCheckedChange={() => setFilters(f => ({
                  ...f,
                  hasCompany: f.hasCompany === false ? null : false
                }))}
              >
                No Company
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedPeople.length} 
        {filteredAndSortedPeople.length === 1 ? ' person' : ' people'} found
      </div>

      {/* Content */}
      {isMobile ? (
        <div className="grid gap-4">
          {filteredAndSortedPeople.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 text-muted-foreground">
                No people found
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2"
                  >
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <Button 
                    variant="ghost"
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-2"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('company')}
                    className="flex items-center gap-2"
                  >
                    Company
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('emailType')}
                    className="flex items-center gap-2"
                  >
                    Email Type
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('verificationStatus')}
                    className="flex items-center gap-2"
                  >
                    Verification
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2"
                  >
                    Created
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPeople.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={8} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No people found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedPeople.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {person.firstName || person.lastName ? (
                            `${person.firstName || ''} ${person.lastName || ''}`
                          ) : (
                            <span className="text-muted-foreground">No name</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a 
                          href={`mailto:${person.email}`}
                          className="text-blue-600 hover:underline truncate"
                        >
                          {person.email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{person.company || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{person.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={person.emailType === 'professional' ? 'default' : 'secondary'}>
                        {person.emailType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        person.verificationStatus === 'VALID' ? 'success' :
                        person.verificationStatus === 'INVALID' ? 'destructive' :
                        'secondary'
                      }>
                        {person.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="truncate">
                        {format(new Date(person.createdAt), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(person.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
EOF
```

This completes the component with:
1. Full mobile card view support
2. Desktop table view
3. Complete sorting functionality
4. Search and filtering
5. All actions (delete, email)
6. Loading and error states
7. Responsive layout handling
8. Proper TypeScript types

Would you like me to explain any specific part in more detail?