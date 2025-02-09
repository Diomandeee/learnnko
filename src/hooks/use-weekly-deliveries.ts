import { useState, useEffect, useCallback } from "react"
import { CoffeeShop } from "@prisma/client"
import { 
  getCurrentWeek, 
  getDeliveriesForWeek,
  calculateTotalVolume,
  WeeklyDelivery 
} from "@/lib/routes/delivery-calculator"

export function useWeeklyDeliveries(shops: CoffeeShop[]) {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())
  const [weeklyDeliveries, setWeeklyDeliveries] = useState<WeeklyDelivery[]>([])
  const [totalVolume, setTotalVolume] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const updateDeliveries = useCallback((week: number) => {
    try {
      console.log('Updating deliveries for week:', week)
      console.log('Available shops:', shops.length)
      
      // Log shops with delivery data
      shops.forEach(shop => {
        console.log(`Shop ${shop.title}:`, {
          first_delivery_week: shop.first_delivery_week,
          delivery_frequency: shop.delivery_frequency,
          volume: shop.volume
        })
      })

      const deliveries = getDeliveriesForWeek(shops, week)
      const volume = calculateTotalVolume(deliveries)

      console.log('Calculated deliveries:', deliveries.length)
      console.log('Calculated volume:', volume)

      setWeeklyDeliveries(deliveries)
      setTotalVolume(volume)
      setError(null)
    } catch (err) {
      console.error('Error updating deliveries:', err)
      setError(err instanceof Error ? err.message : 'Error calculating deliveries')
    }
  }, [shops])

  useEffect(() => {
    updateDeliveries(currentWeek)
  }, [currentWeek, updateDeliveries])

  const changeWeek = (weekNum: number) => {
    console.log('Changing to week:', weekNum)
    setCurrentWeek(weekNum)
  }

  return {
    currentWeek,
    weeklyDeliveries,
    totalVolume,
    changeWeek,
    error
  }
}
