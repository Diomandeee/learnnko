// src/app/dashboard/coffee-shops/new/page.tsx
import { Metadata } from "next"
import { NewCoffeeShopForm } from "@/components/coffee-shops/new-coffee-shop-form"
import { ClientOnly } from "@/components/providers/client-only"

export const metadata: Metadata = {
  title: "Add Coffee Shop | Milk Man CRM",
  description: "Add a new coffee shop to your network",
}

export default function NewCoffeeShopPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ClientOnly>
        <NewCoffeeShopForm />
      </ClientOnly>
    </div>
  )
}