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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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

export function PeopleTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{field: SortField, direction: SortDirection}>({
    field: 'createdAt',
    direction: 'desc'
  })
  const [filters, setFilters] = useState<Filter>({})
  const { people, loading, error, mutate } = usePeople()
  const { toast } = useToast()

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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading people</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2"
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-2"
                >
                  Email
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('company')}
                  className="flex items-center gap-2"
                >
                  Company
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('emailType')}
                  className="flex items-center gap-2"
                >
                  Email Type
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('verificationStatus')}
                  className="flex items-center gap-2"
                >
                  Verification
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2"
                >
                  Created
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPeople.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {person.firstName || person.lastName ? (
                      `${person.firstName || ''} ${person.lastName || ''}`
                    ) : (
                      <span className="text-muted-foreground">No name</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${person.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {person.email}
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {person.company || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {person.phone || 'N/A'}
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
                  {format(new Date(person.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
