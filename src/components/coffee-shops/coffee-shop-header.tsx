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
}