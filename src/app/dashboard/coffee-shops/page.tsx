import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"

export const metadata = {
  title: "Coffee Shops | BUF BARISTA CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <div className="container mx-auto max-w-[95%] py-10">
      <CoffeeShopHeader />
      <CoffeeShopsTable />
    </div>
  )
}
