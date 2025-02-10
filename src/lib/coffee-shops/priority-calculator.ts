// src/lib/coffee-shops/priority-calculator.ts
import { CoffeeShop, Stage } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

const STAGE_CONFIG = {
  PROSPECTING: {
    weight: 0,       // No priority as not visited
    requiresVisit: false
  },
  QUALIFICATION: {
    weight: 0.8,     // High priority after first visit
    requiresVisit: true
  },
  MEETING: {
    weight: 0.9,     // Very high - actively meeting
    requiresVisit: true
  },
  PROPOSAL: {
    weight: 1.0,     // Highest - discussing details
    requiresVisit: true
  },
  NEGOTIATION: {
    weight: 0.9,     // Very high - finalizing
    requiresVisit: true
  },
  PAUSED: {
    weight: 0.3,     // Low - temporarily paused
    requiresVisit: true
  },
  WON: {
    weight: 0,       // No priority - converted
    requiresVisit: true
  },
  LOST: {
    weight: 0,       // No priority - not moving forward
    requiresVisit: true
  }
} as const

// Validate stage and visit requirements
function validateStageVisit(shop: CoffeeShop): boolean {
  if (shop.stage === 'PROSPECTING') {
    return !shop.first_visit && !shop.second_visit && !shop.third_visit;
  }
  return Boolean(shop.first_visit);
}

// Count total visits
function calculateVisitCount(shop: CoffeeShop): number {
  return [
    shop.first_visit,
    shop.second_visit,
    shop.third_visit
  ].filter(Boolean).length;
}

// Find the most recent visit date
function determineLastVisit(shop: CoffeeShop): Date | null {
  const visits = [
    shop.first_visit,
    shop.second_visit,
    shop.third_visit
  ].filter(Boolean) as Date[];

  return visits.length > 0
    ? new Date(Math.max(...visits.map(v => new Date(v).getTime())))
    : null;
}

// Calculate recency penalty
function calculateVisitRecencyPenalty(lastVisit: Date): number {
  const daysSinceLastVisit = (new Date().getTime() - lastVisit.getTime()) / 
    (1000 * 3600 * 24);

  // Exponential decay
  return Math.exp(-daysSinceLastVisit / 30);
}

// Calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearby shops
async function findNearbyShops(
  shop: CoffeeShop,
  radiusKm: number = 20
): Promise<CoffeeShop[]> {
  const nearbyShops = await prisma.coffeeShop.findMany({
    where: {
      id: { not: shop.id },
      isPartner: false,
      stage: { notIn: ['WON', 'LOST'] },
      latitude: {
        gte: shop.latitude - (radiusKm / 111),
        lte: shop.latitude + (radiusKm / 111)
      },
      longitude: {
        gte: shop.longitude - (radiusKm / 111),
        lte: shop.longitude + (radiusKm / 111)
      }
    }
  });

  return nearbyShops.filter(nearbyShop =>
    calculateDistance(
      shop.latitude,
      shop.longitude,
      nearbyShop.latitude,
      nearbyShop.longitude
    ) <= radiusKm
  );
}

// Calculate Bayesian rating
function calculateEnhancedBayesianRating(
  rating: number | null,
  reviewCount: number | null
): { score: number; confidence: number } {
  const GLOBAL_PRIOR_RATING = 3.5;
  const CONFIDENCE_FACTOR = 20;

  if (!rating || !reviewCount || reviewCount === 0) {
    return { score: 0, confidence: 0 };
  }

  const bayesianRating = (
    (CONFIDENCE_FACTOR * GLOBAL_PRIOR_RATING + rating * reviewCount) /
    (CONFIDENCE_FACTOR + reviewCount)
  );

  const confidence = Math.min(1, Math.log(reviewCount + 1) / 5);

  return {
    score: bayesianRating / 5,
    confidence
  };
}

// Calculate volume score
function calculateVolumeScore(volume: string | null): number {
  if (!volume) return 0;
  const volumeNum = parseFloat(volume);
  if (isNaN(volumeNum)) return 0;
  return Math.min(1, Math.log(volumeNum + 1) / 5);
}

// Calculate engagement score
function calculateEngagementScore(shop: CoffeeShop): number {
  const factors = [
    shop.contact_email && 0.2,
    shop.contact_name && 0.2,
    shop.manager_present && 0.3,
    shop.decisionMaker && 0.3
  ].filter(Boolean);

  return factors.reduce((sum, score) => sum + score, 0);
}

export async function calculatePriority(shop: CoffeeShop): Promise<number> {
  // Validate stage requirements
  if (!validateStageVisit(shop)) {
    console.warn(`Invalid stage-visit state for shop ${shop.id}. Stage: ${shop.stage}`);
    return 0;
  }

  // Early returns for terminal stages
  if (['WON', 'LOST'].includes(shop.stage)) {
    return 0;
  }

  // PROSPECTING stage has no priority
  if (shop.stage === 'PROSPECTING') {
    return 0;
  }

  // Calculate visit components
  const visitCount = calculateVisitCount(shop);
  const lastVisit = determineLastVisit(shop);
  const visitScore = lastVisit
    ? (visitCount / 3) * calculateVisitRecencyPenalty(lastVisit)
    : 0;

  // Calculate geographic score
  const nearbyShops = await findNearbyShops(shop);
  const geographicScore = Math.min(1, Math.log(nearbyShops.length + 1) / 3);

  // Calculate rating score
  const { score: ratingScore, confidence: ratingConfidence } =
    calculateEnhancedBayesianRating(shop.rating, shop.reviews);

  // Calculate volume and engagement scores
  const volumeScore = calculateVolumeScore(shop.volume);
  const engagementScore = calculateEngagementScore(shop);

  // Stage weight
  const stageWeight = STAGE_CONFIG[shop.stage].weight;

  // Combined weighted score
  const rawScore = (
    (stageWeight * 0.3) +      // Stage importance
    (visitScore * 0.25) +      // Visit engagement
    (geographicScore * 0.15) + // Geographic opportunity
    (ratingScore * 0.15) +     // Quality/rating
    (volumeScore * 0.1) +      // Business potential
    (engagementScore * 0.05)   // Engagement level
  );

  // Convert to 1-5 scale with adjustment to make 5 harder to achieve
  const adjustedScore = Math.ceil(rawScore * 5 * 0.8);

  // Ensure valid range
  return Math.max(1, Math.min(5, adjustedScore));
}

export async function updateAllShopPriorities() {
  const shops = await prisma.coffeeShop.findMany();
  const updates = [];

  for (const shop of shops) {
    const newPriority = await calculatePriority(shop);
    
    // Only update if priority has changed
    if (newPriority !== shop.priority) {
      updates.push(
        prisma.coffeeShop.update({
          where: { id: shop.id },
          data: {
            priority: newPriority,
            priorityLastUpdated: new Date()
          }
        })
      );
    }
  }

  // Batch update all changed priorities
  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}