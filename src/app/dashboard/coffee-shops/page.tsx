import { CoffeeShopsTable } from "@/components/coffee-shops/coffee-shops-table"
import { CoffeeShopHeader } from "@/components/coffee-shops/coffee-shop-header"
import { CoffeeShopStats } from "@/components/coffee-shops/coffee-shop-stats"
import { PageContainer } from "@/components/layout/page-container"

export const metadata = {
  title: "Coffee Shops | Milk Man CRM",
  description: "Manage your coffee shops",
}

export default function CoffeeShopsPage() {
  return (
    <PageContainer>
      <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
        <CoffeeShopHeader />
        <CoffeeShopStats />
        <CoffeeShopsTable />
      </div>
    </PageContainer>
  )
}
