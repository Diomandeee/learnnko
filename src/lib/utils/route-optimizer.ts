interface Location {
  id: string
  latitude: number
  longitude: number
  volume?: string
  visited?: boolean
  isPriority?: boolean
}

interface OptimizeOptions {
  maxStops?: number
  maxDistance?: number
  optimizeBy?: 'distance' | 'time' | 'volume'
  avoidHighways?: boolean
  avoidTolls?: boolean
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function getLocationScore(
  location: Location,
  options: OptimizeOptions
): number {
  let score = 0

  // Base score is inverse of distance
  if (options.optimizeBy === 'distance') {
    score = 1 / (calculateDistance(
      location.latitude,
      location.longitude,
      startLocation.latitude,
      startLocation.longitude
    ) + 1)
  }

  // Volume priority
  if (options.optimizeBy === 'volume' && location.volume) {
    score += parseFloat(location.volume) / 1000
  }

  // Priority multiplier
  if (location.isPriority) {
    score *= 1.5
  }

  // Not visited bonus
  if (!location.visited) {
    score *= 1.2
  }

  return score
}

export async function optimizeRoute(
  startLocation: Location,
  locations: Location[],
  options: OptimizeOptions = {}
): Promise<Location[]> {
  const {
    maxStops = 10,
    maxDistance = 5,
    optimizeBy = 'distance'
  } = options

  // Calculate scores for each location
  const scoredLocations = locations.map(location => ({
    ...location,
    score: getLocationScore(location, options)
  }))

  // Sort by score
  scoredLocations.sort((a, b) => b.score - a.score)

  // Select top locations within constraints
  const selectedLocations: Location[] = []
  let totalDistance = 0

  for (const location of scoredLocations) {
    if (selectedLocations.length >= maxStops) break

    const distance = calculateDistance(
      startLocation.latitude,
      startLocation.longitude,
      location.latitude,
      location.longitude
    )

    if (distance <= maxDistance) {
      selectedLocations.push(location)
      totalDistance += distance
    }
  }

  // Optimize order using nearest neighbor
  const optimizedRoute = [startLocation]
  const remaining = [...selectedLocations]

  while (remaining.length > 0) {
    const current = optimizedRoute[optimizedRoute.length - 1]
    let nearest = remaining[0]
    let minDistance = calculateDistance(
      current.latitude,
      current.longitude,
      nearest.latitude,
      nearest.longitude
    )

    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        remaining[i].latitude,
        remaining[i].longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearest = remaining[i]
      }
    }

    optimizedRoute.push(nearest)
    remaining.splice(remaining.indexOf(nearest), 1)
  }

  // Add return to start
  optimizedRoute.push(startLocation)

  return optimizedRoute
}
