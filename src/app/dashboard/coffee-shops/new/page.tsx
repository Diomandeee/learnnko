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
