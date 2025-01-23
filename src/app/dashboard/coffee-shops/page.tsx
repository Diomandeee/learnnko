import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"

export const metadata = {
  title: "Coffee Shops | BUF BARISTA CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CoffeeShopHeader />
      <CoffeeShopsTable />
    </div>
  )
}
