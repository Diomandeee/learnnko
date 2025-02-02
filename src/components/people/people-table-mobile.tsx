import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Trash2,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { format } from "date-fns"
import { usePeople } from "@/hooks/use-people"

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
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-2">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              {['name', 'email', 'company', 'createdAt'].map((field) => (
                <DropdownMenuItem
                  key={field}
                  onClick={() => handleSort(field as SortField)}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedPeople.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No people found
          </div>
        ) : (
          filteredAndSortedPeople.map((person) => (
            <Card key={person.id} className="flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">
                        {person.firstName || person.lastName ? (
                          `${person.firstName || ''} ${person.lastName || ''}`
                        ) : (
                          <span className="text-muted-foreground">No name</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Added {format(new Date(person.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </div>

                <div className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={`mailto:${person.email}`}
                      className="text-blue-600 hover:underline truncate"
                    >
                      {person.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{person.company || 'No company'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{person.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Badge variant={person.emailType === 'professional' ? 'default' : 'secondary'}>
                    {person.emailType}
                  </Badge>
                  <Badge variant={
                    person.verificationStatus === 'VALID' ? 'success' :
                    person.verificationStatus === 'INVALID' ? 'destructive' :
                    'secondary'
                  }>
                    {person.verificationStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedPeople.length} 
        {filteredAndSortedPeople.length === 1 ? ' person' : ' people'} found
      </div>
    </div>
  )
}

export default PeopleTable;