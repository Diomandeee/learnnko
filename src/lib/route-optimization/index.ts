import { CoffeeShop } from "@prisma/client"

interface Location {
  lat: number
  lng: number
}

interface OptimizationSettings {
  maxStops: number
  preferHigherRated: boolean
  avoidTraffic: boolean
  prioritizeUnvisited: boolean
  timePerStop: number
  startTime: string
  endTime: string
  maxTravelTime: number
}

// Calculate location score based on various factors
function calculateLocationScore(
  location: CoffeeShop,
  settings: OptimizationSettings
): number {
  let score = 0

  // Priority score (0-5)
  score += (location.priority || 0) * 2

  // Rating score (0-5)
  if (settings.preferHigherRated && location.rating) {
    score += location.rating
  }

  // Visit status
  if (settings.prioritizeUnvisited && !location.visited) {
    score += 3
  }

  // Volume score
  if (location.volume) {
    const volume = parseFloat(location.volume)
    if (!isNaN(volume)) {
      score += Math.min(volume / 20, 5)
    }
  }

  // Partner status
  if (location.isPartner) {
    score += 2
  }

  // Lead status
  if (location.parlor_coffee_leads) {
    score += 2
  }

  return score
}

// Calculate distance matrix between locations
async function calculateDistanceMatrix(
  locations: CoffeeShop[],
  directionsService: google.maps.DirectionsService
): Promise<number[][]> {
  const matrix: number[][] = []

  for (let i = 0; i < locations.length; i++) {
    matrix[i] = []
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        matrix[i][j] = 0
        continue
      }

      try {
        const response = await directionsService.route({
          origin: { lat: locations[i].latitude, lng: locations[i].longitude },
          destination: { lat: locations[j].latitude, lng: locations[j].longitude },
          travelMode: google.maps.TravelMode.DRIVING
        })

        matrix[i][j] = response.routes[0].legs[0].distance?.value || 0
      } catch (error) {
        console.error(`Error calculating distance between locations ${i} and ${j}:`, error)
        matrix[i][j] = Infinity
      }
    }
  }

  return matrix
}

// Nearest neighbor algorithm with priority scoring
async function findOptimalRoute(
  locations: CoffeeShop[],
  settings: OptimizationSettings,
  directionsService: google.maps.DirectionsService
): Promise<CoffeeShop[]> {
  const distanceMatrix = await calculateDistanceMatrix(locations, directionsService)
  const visited = new Set<number>()
  const route: CoffeeShop[] = []
  
  // Start with highest priority location
  let currentIndex = 0
  let maxScore = -1
  
  locations.forEach((location, index) => {
    const score = calculateLocationScore(location, settings)
    if (score > maxScore) {
      maxScore = score
      currentIndex = index
    }
  })

  route.push(locations[currentIndex])
  visited.add(currentIndex)

  // Build route
  while (visited.size < locations.length && route.length < settings.maxStops) {
    let nextIndex = -1
    let minDistance = Infinity
    let maxPriorityScore = -1

    for (let i = 0; i < locations.length; i++) {
      if (visited.has(i)) continue

      const distance = distanceMatrix[currentIndex][i]
      if (distance === Infinity) continue

      const priorityScore = calculateLocationScore(locations[i], settings)
      const combinedScore = priorityScore / (distance + 1) // Avoid division by zero

      if (combinedScore > maxPriorityScore) {
        maxPriorityScore = combinedScore
        minDistance = distance
        nextIndex = i
      }
    }

    if (nextIndex === -1) break

    route.push(locations[nextIndex])
    visited.add(nextIndex)
    currentIndex = nextIndex
  }

  return route
}

export async function optimizeRoute(
  locations: CoffeeShop[],
  settings: OptimizationSettings,
  directionsService: google.maps.DirectionsService
): Promise<CoffeeShop[]> {
  if (!locations.length) return []
  if (locations.length === 1) return locations

  try {
    return await findOptimalRoute(locations, settings, directionsService)
  } catch (error) {
    console.error('Error in route optimization:', error)
    throw new Error('Failed to optimize route')
  }
}

export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lng - point1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function findNearbyLocations(
  center: Location,
  locations: CoffeeShop[],
  radius: number,
  maxResults = 20
): CoffeeShop[] {
  return locations
    .map(location => ({
      location,
      distance: calculateDistance(center, {
        lat: location.latitude,
        lng: location.longitude
      })
    }))
    .filter(({ distance }) => distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map(({ location }) => location)
}

export type { Location, OptimizationSettings }
