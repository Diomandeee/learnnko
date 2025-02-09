"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CoffeeShop } from "@prisma/client"
import { format } from "date-fns"
import { 
  PhoneCall, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  User,
  Star
} from "lucide-react"
import { FollowUpCreateDialog } from "./follow-up-create-dialog"
import { GenerateFollowUpsButton } from "./generate-button"

type FollowUp = {
  id: string
  type: string
  status: string
  priority: number
  dueDate: string
  completedDate?: string
  notes?: string
  contactMethod?: string
  contactDetails?: string
  coffeeShop: {
    id: string
    title: string
    address: string
    area?: string
  }
}

const STATUS_COLORS = {
  PENDING: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
  RESCHEDULED: "default"
} as const

const PRIORITY_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-green-500',
  5: 'text-blue-500'
} as const

export function FollowUpManager() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [shops, setShops] = useState<CoffeeShop[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [followUpsResponse, shopsResponse] = await Promise.all([
        fetch('/api/follow-ups'),
        fetch('/api/coffee-shops')
      ])

      if (!followUpsResponse.ok || !shopsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const followUpsJson = await followUpsResponse.json()
      const shopsJson = await shopsResponse.json()

      setFollowUps(followUpsJson.data || [])
      setShops(shopsJson.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (followUpId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${followUpId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getContactMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'phone':
      case 'call':
        return <PhoneCall className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'visit':
        return <Building className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getTypeDisplay = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const handleReschedule = (followUpId: string) => {
    console.log('Reschedule follow-up:', followUpId)
  }


  const filteredFollowUps = followUps.filter(followUp => {
    if (activeTab === 'pending') {
      return ['PENDING', 'IN_PROGRESS'].includes(followUp.status)
    }
    if (activeTab === 'completed') {
      return followUp.status === 'COMPLETED'
    }
    if (activeTab === 'cancelled') {
      return followUp.status === 'CANCELLED'
    }
    return true
  }).sort((a, b) => {
    // Sort by priority first, then by due date
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const renderTableContent = (status: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Shop & Stage</TableHead>
            <TableHead>Follow-up Type</TableHead>
            <TableHead>Visit History</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>{status === 'completed' ? 'Completed' : 'Due'}</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFollowUps.map((followUp) => {
            const shop = shops.find(s => s.id === followUp.coffeeShop.id)
            const visitCount = [shop?.first_visit, shop?.second_visit, shop?.third_visit].filter(Boolean).length
            
            return (
              <TableRow key={followUp.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{followUp.coffeeShop.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {shop?.stage || 'UNKNOWN'}
                      </Badge>
                      {shop?.area && (
                        <span className="text-xs text-muted-foreground">
                          {shop.area}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{getTypeDisplay(followUp.type)}</span>
                    {followUp.notes && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {followUp.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">
                      {visitCount} visit{visitCount !== 1 ? 's' : ''}
                    </span>
                    {shop?.lastFollowUp && (
                      <span className="text-xs text-muted-foreground">
                        Last: {format(new Date(shop.lastFollowUp), 'MMM d')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={PRIORITY_COLORS[followUp.priority as keyof typeof PRIORITY_COLORS]}>
                      {Array(followUp.priority).fill('★').join('')}
                    </span>
                    {shop?.potential && (
                      <span className="text-xs text-muted-foreground">
                        Potential: {shop.potential}/5
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>
                      {format(
                        new Date(status === 'completed' ? followUp.completedDate! : followUp.dueDate), 
                        'MMM d'
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(status === 'completed' ? followUp.completedDate! : followUp.dueDate),
                        'h:mm a'
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getContactMethodIcon(followUp.contactMethod)}
                      <span className="capitalize">
                        {followUp.contactMethod || 'Any'}
                      </span>
                    </div>
                    {shop?.contact_name && (
                      <span className="text-xs text-muted-foreground">
                        {shop.contact_name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[followUp.status as keyof typeof STATUS_COLORS]}>
                    {followUp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(followUp.id, 'COMPLETED')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReschedule(followUp.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(followUp.id, 'PENDING')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {filteredFollowUps.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No {status} follow-ups found
                  </p>
                  {status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGenerateDialog(true)}
                    >
                      Generate Follow-ups
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Manager</CardTitle>
          <CardDescription>Loading follow-ups...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Follow-up Manager</CardTitle>
            <CardDescription>
              Track and manage your follow-ups with coffee shops
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <GenerateFollowUpsButton onGenerated={fetchData} />
            <FollowUpCreateDialog 
              shops={shops} 
              onFollowUpCreated={fetchData} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending & In Progress
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <XCircle className="mr-2 h-4 w-4" />
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {renderTableContent('pending')}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderTableContent('completed')}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {renderTableContent('cancelled')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}