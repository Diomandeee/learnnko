// src/lib/route-optimizer.ts
import { CoffeeShop } from "@prisma/client";
import { calculateDistance } from "@/lib/utils/geo";

interface DistanceMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

export class RouteOptimizer {
  private buildDistanceMatrix(shops: CoffeeShop[]): DistanceMatrix {
    const matrix: DistanceMatrix = {};
    
    // Build a matrix of distances between all shops
    shops.forEach(shop1 => {
      matrix[shop1.id] = {};
      shops.forEach(shop2 => {
        if (shop1.id !== shop2.id) {
          matrix[shop1.id][shop2.id] = calculateDistance(
            shop1.latitude,
            shop1.longitude,
            shop2.latitude,
            shop2.longitude
          );
        }
      });
    });

    return matrix;
  }

  private findNearestNeighbor(
    current: string,
    unvisited: Set<string>,
    distanceMatrix: DistanceMatrix,
    maxDistance: number,
    shopMap: Map<string, CoffeeShop>,
    optimizeBy: 'distance' | 'time' | 'volume'
  ): string | null {
    let nearest: string | null = null;
    let bestScore = optimizeBy === 'volume' ? -Infinity : Infinity;

    unvisited.forEach(shopId => {
      const distance = distanceMatrix[current][shopId];
      if (distance > maxDistance) return;

      let score: number;
      const shop = shopMap.get(shopId);
      
      switch (optimizeBy) {
        case 'volume':
          // Higher volume is better
          score = shop ? -parseFloat(shop.volume || '0') : 0;
          if (score < bestScore) {
            bestScore = score;
            nearest = shopId;
          }
          break;
          
        case 'time':
          // Consider traffic conditions if available
          score = distance * (shop?.traffic_factor || 1);
          if (score < bestScore) {
            bestScore = score;
            nearest = shopId;
          }
          break;
          
        case 'distance':
        default:
          // Shorter distance is better
          if (distance < bestScore) {
            bestScore = distance;
            nearest = shopId;
          }
          break;
      }
    });

    return nearest;
  }

  public optimizeRoute(
    shops: CoffeeShop[],
    startPointId: string,
    maxStops: number,
    maxDistance: number,
    optimizeBy: 'distance' | 'time' | 'volume' = 'distance'
  ): CoffeeShop[] {
    // Handle edge cases
    if (shops.length === 0) return [];
    if (shops.length === 1) return shops;

    // Initialize data structures
    const distanceMatrix = this.buildDistanceMatrix(shops);
    const unvisited = new Set(shops.map(shop => shop.id));
    const optimizedRoute: CoffeeShop[] = [];
    const shopMap = new Map(shops.map(shop => [shop.id, shop]));

    // Start with the specified starting point
    const startShop = shopMap.get(startPointId);
    if (!startShop) return [];
    
    unvisited.delete(startPointId);
    optimizedRoute.push(startShop);
    let currentShopId = startPointId;

    // Build route using nearest neighbor with constraints
    while (
      optimizedRoute.length < maxStops && 
      unvisited.size > 0
    ) {
      const nextShopId = this.findNearestNeighbor(
        currentShopId,
        unvisited,
        distanceMatrix,
        maxDistance,
        shopMap,
        optimizeBy
      );

      if (!nextShopId) break;

      const nextShop = shopMap.get(nextShopId);
      if (!nextShop) break;

      optimizedRoute.push(nextShop);
      unvisited.delete(nextShopId);
      currentShopId = nextShopId;
    }

    // Apply additional optimization based on strategy
    return this.finalizeRoute(optimizedRoute, optimizeBy);
  }

  private finalizeRoute(
    route: CoffeeShop[], 
    optimizeBy: 'distance' | 'time' | 'volume'
  ): CoffeeShop[] {
    if (route.length <= 2) return route;

    if (optimizeBy === 'volume') {
      // Keep start point, sort rest by volume
      const [startPoint, ...rest] = route;
      const sortedByVolume = rest.sort((a, b) => {
        const volumeA = parseFloat(a.volume || '0');
        const volumeB = parseFloat(b.volume || '0');
        return volumeB - volumeA;
      });
      return [startPoint, ...sortedByVolume];
    }

    // Additional optimizations could be added here
    // For example, 2-opt optimization for distance
    
    return route;
  }

  public calculateRouteMetrics(route: CoffeeShop[]): {
    totalDistance: number;
    estimatedDuration: number;
  } {
    let totalDistance = 0;

    for (let i = 1; i < route.length; i++) {
      totalDistance += calculateDistance(
        route[i - 1].latitude,
        route[i - 1].longitude,
        route[i].latitude,
        route[i].longitude
      );
    }

    // Estimate duration based on average speed (30 km/h for urban areas)
    const estimatedDuration = (totalDistance / 30) * 60; // minutes

    return {
      totalDistance,
      estimatedDuration
    };
  }
}