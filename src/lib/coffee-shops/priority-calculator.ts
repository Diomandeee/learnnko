// src/lib/coffee-shops/priority-calculator.ts
import { CoffeeShop } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

// Normalize volume to a 0-1 scale
function calculateVolumeScore(volume: string | null): number {
  if (!volume) return 0
  
  const volumeNum = parseFloat(volume)
  if (isNaN(volumeNum)) return 0

  // Logarithmic scaling to handle wide range of volumes
  return Math.min(1, Math.log(volumeNum + 1) / 5)
}

// Calculate visit count
function calculateVisitCount(shop: CoffeeShop): number {
  return [
    shop.first_visit, 
    shop.second_visit, 
    shop.third_visit
  ].filter(Boolean).length
}

// Determine last visit
function determineLastVisit(shop: CoffeeShop): Date | null {
  const visits = [
    shop.first_visit, 
    shop.second_visit, 
    shop.third_visit
  ].filter(Boolean) as Date[]

  return visits.length > 0 
    ? new Date(Math.max(...visits.map(v => new Date(v).getTime())))
    : null
}

// Calculate visit recency penalty
function calculateVisitRecencyPenalty(lastVisit: Date): number {
  const now = new Date()
  const daysSinceLastVisit = (now.getTime() - lastVisit.getTime()) / 
    (1000 * 3600 * 24)

  // Exponential decay of penalty
  // 0-30 days: minimal penalty
  // 30-90 days: increasing penalty
  // 90+ days: maximum penalty
  if (daysSinceLastVisit <= 30) return 1
  if (daysSinceLastVisit <= 90) {
    return Math.max(0, 1 - (daysSinceLastVisit - 30) / 60)
  }
  return 0
}

// Haversine formula for calculating distance between two points on Earth
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find nearby shops within a given radius
async function findNearbyShops(
  shop: CoffeeShop, 
  radiusKm: number = 20
): Promise<CoffeeShop[]> {
  const nearbyShops = await prisma.coffeeShop.findMany({
    where: {
      id: { not: shop.id }, // Exclude the current shop
      isPartner: false, // Exclude partner shops
      latitude: {
        gte: shop.latitude - (radiusKm / 111), // Approximate latitude conversion
        lte: shop.latitude + (radiusKm / 111)
      },
      longitude: {
        gte: shop.longitude - (radiusKm / 111), // Approximate longitude conversion
        lte: shop.longitude + (radiusKm / 111)
      }
    }
  })

  // Filter shops by actual distance
  return nearbyShops.filter(nearbyShop => 
    calculateDistance(
      shop.latitude, 
      shop.longitude, 
      nearbyShop.latitude, 
      nearbyShop.longitude
    ) <= radiusKm
  )
}

// Enhanced Bayesian rating calculation
function calculateEnhancedBayesianRating(
  rating: number | null, 
  reviewCount: number | null
): { score: number, confidence: number } {
  const GLOBAL_PRIOR_RATING = 3.5
  const CONFIDENCE_FACTOR = 20

  if (!rating || !reviewCount || reviewCount === 0) {
    return { score: 0, confidence: 0 }
  }

  const bayesianRating = (
    (CONFIDENCE_FACTOR * GLOBAL_PRIOR_RATING + rating * reviewCount) / 
    (CONFIDENCE_FACTOR + reviewCount)
  )

  const confidence = Math.min(1, Math.log(reviewCount + 1) / 5)

  return {
    score: bayesianRating / 5,
    confidence: confidence
  }
}

export async function calculatePriority(shop: CoffeeShop): Promise<number> {
  // If already a partner, potential for further deals
  if (shop.isPartner) return 1 // Minimal priority to keep tracking

  // Find nearby shops
  const nearbyShops = await findNearbyShops(shop)

  // Calculate cluster density
  const clusterDensity = Math.min(1, Math.log(nearbyShops.length + 1) / 3)

  // Enhanced Bayesian rating
  const { score: bayesianRatingScore, confidence: ratingConfidence } = 
    calculateEnhancedBayesianRating(shop.rating, shop.reviews)

  // Additional factors
  const volumeScore = calculateVolumeScore(shop.volume)
  const visitCount = calculateVisitCount(shop)
  const lastVisit = determineLastVisit(shop)
  const visitRecencyFactor = lastVisit 
    ? calculateVisitRecencyPenalty(lastVisit) 
    : 1

  // Combine factors with strategic weighting
  const priorityComponents = [
    clusterDensity * 0.25,        // Cluster density
    bayesianRatingScore * 0.25,   // Quality of rating
    volumeScore * 0.15,           // Business volume
    (visitCount / 3) * 0.15,      // Visit frequency
    visitRecencyFactor * 0.20     // Recency of engagement
  ]

  // Sum and normalize
  const rawScore = priorityComponents.reduce((a, b) => a + b, 0)
  
  // Convert to 1-5 star rating
  const priority = Math.round(rawScore * 5)

  return Math.max(0, Math.min(5, priority))
}

// Update priority for all shops
export async function updateAllShopPriorities() {
  const shops = await prisma.coffeeShop.findMany()
  
  for (const shop of shops) {
    const newPriority = await calculatePriority(shop)
    
    await prisma.coffeeShop.update({
      where: { id: shop.id },
      data: { 
        priority: newPriority,
        priorityLastUpdated: new Date()
      }
    })
  }
}

// Scheduled job to update priorities
export async function schedulePriorityUpdate() {
  await updateAllShopPriorities()
}