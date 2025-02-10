import { 
  WeeklySchedule, 
  DaySchedule, 
  TimeBlock,
  ScheduleSettings,
  ScheduledVisit
} from "@/types/schedule"
import { CoffeeShop } from "@prisma/client"
import { findNearbyLocations, calculateDistance } from "./route-optimization"

interface GenerateScheduleParams {
  priorityLocations: CoffeeShop[]
  settings: ScheduleSettings
  timeBlocks: TimeBlock[]
  startDate: Date
}

// Create clusters of locations based on proximity
function createLocationClusters(
  priorityLocations: CoffeeShop[],
  allLocations: CoffeeShop[],
  settings: ScheduleSettings
): Array<{
  priority: CoffeeShop,
  nearby: CoffeeShop[]
}> {
  const clusters = [];
  const usedLocations = new Set<string>();

  // Filter locations to exclude partners and priority locations
  const availableLocations = allLocations.filter(location => 
    !location.isPartner && // Exclude partners
    !priorityLocations.some(pl => pl.id === location.id) && // Exclude priority locations
    !usedLocations.has(location.id)
  );

  for (const priority of priorityLocations) {
    // Skip if this location is already part of another cluster
    if (usedLocations.has(priority.id)) continue;

    // Find nearby locations within radius
    const nearbyShops = findNearbyLocations(
      { lat: priority.latitude, lng: priority.longitude },
      availableLocations.filter(l => !usedLocations.has(l.id)),
      settings.nearbyRadius
    )
    .filter(shop => 
      !shop.isPartner && // Double check no partners
      !priorityLocations.includes(shop) // Double check no priority locations
    )
    .slice(0, 3); // Limit to 3 nearby locations per priority location

    // Mark all locations in this cluster as used
    usedLocations.add(priority.id);
    nearbyShops.forEach(shop => usedLocations.add(shop.id));

    clusters.push({
      priority,
      nearby: nearbyShops
    });
  }

  return clusters;
}

// Find optimal day for a cluster based on location distribution
function findOptimalDay(
  cluster: { priority: CoffeeShop, nearby: CoffeeShop[] },
  days: DaySchedule[],
  settings: ScheduleSettings
): number {
  let bestDay = 0;
  let minScore = Infinity;

  days.forEach((day, index) => {
    if (day.visits.length >= settings.maxVisitsPerDay) return;

    // Calculate score based on multiple factors
    let score = 0;

    // Factor 1: Number of existing visits that day
    score += day.visits.length * 2;

    // Factor 2: Geographic distribution
    const dayLocations = day.visits.map(v => v.shop);
    if (dayLocations.length > 0) {
      const avgLat = dayLocations.reduce((sum, loc) => sum + loc.latitude, 0) / dayLocations.length;
      const avgLng = dayLocations.reduce((sum, loc) => sum + loc.longitude, 0) / dayLocations.length;
      
      // Distance from day's center to cluster's priority location
      score += calculateDistance(
        { lat: avgLat, lng: avgLng },
        { lat: cluster.priority.latitude, lng: cluster.priority.longitude }
      );
    }

    // Factor 3: Balance visits across week
    score += Math.abs(index - Math.floor(days.length / 2)) * 
             (settings.balanceWeekly ? 2 : 0);

    if (score < minScore && 
        (day.visits.length + 1 + cluster.nearby.length) <= settings.maxVisitsPerDay) {
      minScore = score;
      bestDay = index;
    }
  });

  return bestDay;
}

export async function generateWeeklySchedule({
  priorityLocations,
  settings,
  timeBlocks,
  startDate
}: GenerateScheduleParams): Promise<WeeklySchedule> {
  // Initialize week structure
  const days: DaySchedule[] = Array.from({ length: 5 }, (_, i) => ({
    day: i,
    date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
    timeBlocks: timeBlocks.filter(block => block.day === i),
    visits: [],
    availableMinutes: 480 // 8 hours default
  }));

  try {
    // Get all locations from API
    const response = await fetch('/api/coffee-shops');
    const allLocations: CoffeeShop[] = await response.json();

    // Filter out partners and create clusters
    const nonPartnerLocations = allLocations.filter(location => !location.isPartner);
    const clusters = createLocationClusters(priorityLocations, nonPartnerLocations, settings);

    // Distribute clusters across days
    for (const cluster of clusters) {
      const bestDay = findOptimalDay(cluster, days, settings);
      const daySchedule = days[bestDay];

      // Add priority location
      daySchedule.visits.push({
        id: crypto.randomUUID(),
        shopId: cluster.priority.id,
        shop: cluster.priority,
        day: bestDay,
        isPriority: true,
        estimatedDuration: settings.priorityVisitDuration
      });

      // Add nearby locations
      cluster.nearby.forEach(nearby => {
        daySchedule.visits.push({
          id: crypto.randomUUID(),
          shopId: nearby.id,
          shop: nearby,
          day: bestDay,
          isPriority: false,
          estimatedDuration: settings.visitDuration
        });
      });

      // Sort visits by location for optimal route
      daySchedule.visits.sort((a, b) => {
        const distA = calculateDistance(
          { lat: cluster.priority.latitude, lng: cluster.priority.longitude },
          { lat: a.shop.latitude, lng: a.shop.longitude }
        );
        const distB = calculateDistance(
          { lat: cluster.priority.latitude, lng: cluster.priority.longitude },
          { lat: b.shop.latitude, lng: b.shop.longitude }
        );
        return distA - distB;
      });
    }

    return {
      weekNumber: getWeekNumber(startDate),
      startDate,
      endDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000),
      days: days.map(day => ({
        ...day,
        visits: day.visits.map((visit, index) => ({
          ...visit,
          order: index + 1
        }))
      }))
    };
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
