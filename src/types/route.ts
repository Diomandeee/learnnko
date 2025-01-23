// src/types/route.ts
import { CoffeeShop } from "@prisma/client"

export interface RouteSettings {
  startingPoint: string
  maxStops: number
  maxDistance: number
}

export interface RouteStop {
  shop: CoffeeShop
  distanceFromPrevious: number
  cumulativeDistance: number
}