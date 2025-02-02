"use client"

import { useState, useEffect } from "react"
import { CoffeeShopsTable } from "@/components/coffee-shops/table"
import { CoffeeShop } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { CoffeeShopStats } from "@/components/coffee-shops/coffee-shop-stats"
import { PageContainer } from "@/components/layout/page-container"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"

export default function CoffeeShopsPage() {
  const [shops, setShops] = useState<CoffeeShop[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  
  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await fetch('/api/coffee-shops')
        if (!response.ok) throw new Error('Failed to fetch shops')
        
        const data = await response.json()
        setShops(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load coffee shops",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [toast])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <PageContainer>

    <div>
      <div className="flex flex-col space-y-2 p-4 sm:p-6 lg:p-8">
        <CoffeeShopHeader />
      </div>

      <CoffeeShopStats  />
      <CoffeeShopsTable shops={shops} />
    </div>
    </PageContainer>

  )
}