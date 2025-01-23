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
