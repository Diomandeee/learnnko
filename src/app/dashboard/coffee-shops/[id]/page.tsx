import { CoffeeShopProfile } from "@/components/coffee-shops/coffee-shop-profile"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function CoffeeShopPage({ params }: Props) {
  const coffeeShop = await prisma.coffeeShop.findUnique({
    where: {
      id: params.id
    },
    include: {
      visits: {
        orderBy: {
          date: 'desc'
        }
      }
    }
  })

  if (!coffeeShop) {
    notFound()
  }

  return <CoffeeShopProfile shop={coffeeShop} />
}
