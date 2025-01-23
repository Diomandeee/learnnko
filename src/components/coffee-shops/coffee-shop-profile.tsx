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
