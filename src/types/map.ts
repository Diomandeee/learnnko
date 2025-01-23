import { CoffeeShop } from "@prisma/client"

export interface MapProps {
  className?: string
}

export interface ShopMarkerProps {
  shop: CoffeeShop
  selected?: boolean
  onSelect?: (shop: CoffeeShop) => void
}

export interface RouteLayerProps {
  route?: CoffeeShop[]
  color?: string
}
