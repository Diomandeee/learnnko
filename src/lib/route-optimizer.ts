import { CoffeeShop } from "@prisma/client"
import { getDistance } from "geolib"

interface RouteOptimizerConfig {
  maxStops: number
  maxDistance: number // in kilometers
}

interface RouteStop {
  shop: CoffeeShop
  distanceFromPrevious: number
  cumulativeDistance: number
}

export class RouteOptimizer {
  private config: RouteOptimizerConfig

  constructor(config: RouteOptimizerConfig) {
    this.config = config
  }

  async generateRoute(startShop: CoffeeShop, targetShops: CoffeeShop[]): Promise<RouteStop[]> {
    const route: RouteStop[] = []
    let currentShop = startShop
    let totalDistance = 0

    // Filter out the start shop from target shops if it's there
    targetShops = targetShops.filter(shop => shop.id !== startShop.id)

    while (
      route.length < this.config.maxStops &&
      targetShops.length > 0 &&
      totalDistance < this.config.maxDistance * 1000 // Convert to meters
    ) {
      // Find nearest unvisited shop
      const nearestShop = this.findNearestShop(currentShop, targetShops)
      if (!nearestShop) break

      // Calculate distances
      const distanceToNext = nearestShop.distance

      // Check if adding this stop would exceed max distance
      if (totalDistance + distanceToNext > this.config.maxDistance * 1000) break

      // Add total distance for this leg
      totalDistance += distanceToNext

      // Add stop to route
      route.push({
        shop: nearestShop.shop,
        distanceFromPrevious: distanceToNext,
        cumulativeDistance: totalDistance
      })

      // Update current position and remove visited shop
      currentShop = nearestShop.shop
      targetShops = targetShops.filter(shop => shop.id !== nearestShop.shop.id)
    }

    return route
  }

  private findNearestShop(currentShop: CoffeeShop, targetShops: CoffeeShop[]): {
    shop: CoffeeShop
    distance: number
  } | null {
    if (targetShops.length === 0) return null

    let nearestShop = targetShops[0]
    let minDistance = this.calculateDistance(currentShop, nearestShop)

    for (const shop of targetShops.slice(1)) {
      const distance = this.calculateDistance(currentShop, shop)
      if (distance < minDistance) {
        minDistance = distance
        nearestShop = shop
      }
    }

    return { shop: nearestShop, distance: minDistance }
  }

  private calculateDistance(shop1: CoffeeShop, shop2: CoffeeShop): number {
    return getDistance(
      { latitude: shop1.latitude, longitude: shop1.longitude },
      { latitude: shop2.latitude, longitude: shop2.longitude }
    )
  }
}
