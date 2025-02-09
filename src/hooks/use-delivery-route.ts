import { useState, useEffect } from "react"
import { CoffeeShop } from "@prisma/client"
import { getCurrentWeek, getDeliverySchedule, DeliverySchedule } from "@/lib/routes/delivery-calculator"

export function useDeliveryRoute(shops: CoffeeShop[]) {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule[]>([])
  const [currentDeliveries, setCurrentDeliveries] = useState<CoffeeShop[]>([])

  useEffect(() => {
    // Update schedule when shops change
    const schedule = getDeliverySchedule(shops)
    setDeliverySchedule(schedule)
    
    // Filter for current week deliveries
    const thisWeekDeliveries = schedule
      .filter(s => s.nextDeliveryWeek === currentWeek)
      .map(s => s.shop)
    
    setCurrentDeliveries(thisWeekDeliveries)
  }, [shops, currentWeek])

  const updateWeek = (week: number) => {
    setCurrentWeek(week)
  }

  return {
    currentWeek,
    updateWeek,
    deliverySchedule,
    currentDeliveries
  }
}
