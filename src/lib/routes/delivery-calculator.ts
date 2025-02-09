import { CoffeeShop } from "@prisma/client"

export interface WeeklyDelivery {
  shop: CoffeeShop
  weekNumber: number
  volume: number
}

export function getCurrentWeek(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7))
}

export function shouldDeliverThisWeek(
  shop: CoffeeShop,
  weekNumber: number
): boolean {
  // Ensure we have required data
  if (!shop.first_delivery_week || !shop.delivery_frequency) {
    console.log(`Shop ${shop.title} missing delivery data:`, {
      first_delivery_week: shop.first_delivery_week,
      delivery_frequency: shop.delivery_frequency
    })
    return false
  }

  // If week is before first delivery, no delivery
  if (weekNumber < shop.first_delivery_week) {
    return false
  }

  // Calculate weeks since first delivery
  const weeksSinceFirst = weekNumber - shop.first_delivery_week

  // Improved weekly frequency check
  if (shop.delivery_frequency === 'WEEKLY') {
    console.log(`Weekly delivery for ${shop.title} in week ${weekNumber}`)
    return true
  }

  // For non-weekly frequencies
  let frequencyWeeks = 0
  switch (shop.delivery_frequency) {
    case 'BIWEEKLY':
      frequencyWeeks = 2
      break
    case 'THREE_WEEKS':
      frequencyWeeks = 3
      break
    case 'FOUR_WEEKS':
      frequencyWeeks = 4
      break
    case 'FIVE_WEEKS':
      frequencyWeeks = 5
      break
    case 'SIX_WEEKS':
      frequencyWeeks = 6
      break
    default:
      console.warn(`Unknown delivery frequency for ${shop.title}:`, shop.delivery_frequency)
      return false
  }

  const shouldDeliver = weeksSinceFirst % frequencyWeeks === 0
  console.log(`Delivery check for ${shop.title}:`, {
    weekNumber,
    weeksSinceFirst,
    frequencyWeeks,
    shouldDeliver
  })

  return shouldDeliver
}

export function getDeliveriesForWeek(
  shops: CoffeeShop[],
  weekNumber: number
): WeeklyDelivery[] {
  console.log(`Calculating deliveries for week ${weekNumber}`)
  console.log('Total shops:', shops.length)

  const deliveries = shops
    .filter(shop => {
      const deliver = shouldDeliverThisWeek(shop, weekNumber)
      console.log(`${shop.title}: ${deliver ? 'YES' : 'NO'}`)
      return deliver
    })
    .map(shop => ({
      shop,
      weekNumber,
      volume: parseFloat(shop.volume || '0')
    }))
    .sort((a, b) => b.volume - a.volume)

  console.log(`Found ${deliveries.length} deliveries for week ${weekNumber}`)
  return deliveries
}

export function calculateTotalVolume(deliveries: WeeklyDelivery[]): number {
  const total = deliveries.reduce((sum, delivery) => sum + delivery.volume, 0)
  console.log(`Total volume calculated: ${total}`)
  return total
}
