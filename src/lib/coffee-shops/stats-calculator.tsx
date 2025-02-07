// src/lib/coffee-shops/stats-calculator.ts

import { CoffeeShop } from "@prisma/client"
import _ from 'lodash'

// Get annual deliveries based on frequency
export function getAnnualDeliveries(frequency: string | null): number {
  switch (frequency) {
    case 'WEEKLY':
      return 52
    case 'BIWEEKLY':
      return 26
    case 'THREE_WEEKS':
      return 17
    case 'FOUR_WEEKS':
      return 13
    case 'FIVE_WEEKS':
      return 10
    case 'SIX_WEEKS':
      return 9
    default:
      return 52 // Default to weekly if no frequency specified
  }
}

// Calculate ARR for a single shop
export function calculateShopARR(shop: CoffeeShop): number {
  if (!shop.volume) return 0
  const weeklyVolume = typeof shop.volume === 'string' ? parseFloat(shop.volume) : shop.volume
  const deliveriesPerYear = getAnnualDeliveries(shop.delivery_frequency)
  return (weeklyVolume * deliveriesPerYear) * 18
}

// Calculate total ARR across all shops
export function calculateTotalARR(shops: CoffeeShop[]): number {
  return shops.reduce((total, shop) => total + calculateShopARR(shop), 0)
}

// Calculate average ARR per shop
export function calculateAverageARR(shops: CoffeeShop[]): number {
  if (shops.length === 0) return 0
  return calculateTotalARR(shops) / shops.length
}

// Calculate total annual volume across all shops
export function calculateTotalAnnualVolume(shops: CoffeeShop[]): number {
  return shops.reduce((total, shop) => {
    if (!shop.volume) return total
    const weeklyVolume = typeof shop.volume === 'string' ? parseFloat(shop.volume) : shop.volume
    const deliveriesPerYear = getAnnualDeliveries(shop.delivery_frequency)
    return total + (weeklyVolume * deliveriesPerYear)
  }, 0)
}

// Calculate average volume per shop (annualized)
export function calculateAverageAnnualVolume(shops: CoffeeShop[]): number {
  if (shops.length === 0) return 0
  return calculateTotalAnnualVolume(shops) / shops.length
}

// Calculate volume statistics by delivery frequency
export function calculateVolumeStatsByFrequency(shops: CoffeeShop[]): Record<string, {
  count: number
  totalVolume: number
  averageVolume: number
  totalARR: number
  averageARR: number
}> {
  const groupedShops = _.groupBy(shops, 'delivery_frequency')
  
  return _.mapValues(groupedShops, (frequencyShops) => {
    const shopsWithVolume = frequencyShops.filter(shop => shop.volume)
    const totalVolume = calculateTotalAnnualVolume(frequencyShops)
    const totalARR = calculateTotalARR(frequencyShops)
    
    return {
      count: frequencyShops.length,
      totalVolume,
      averageVolume: shopsWithVolume.length > 0 ? totalVolume / shopsWithVolume.length : 0,
      totalARR,
      averageARR: frequencyShops.length > 0 ? totalARR / frequencyShops.length : 0
    }
  })
}

// Calculate month-over-month growth in ARR
export function calculateARRGrowth(
  currentShops: CoffeeShop[],
  previousShops: CoffeeShop[]
): number {
  const currentARR = calculateTotalARR(currentShops)
  const previousARR = calculateTotalARR(previousShops)
  
  if (previousARR === 0) return 0
  return ((currentARR - previousARR) / previousARR) * 100
}

// Calculate distribution of delivery frequencies
export function calculateFrequencyDistribution(
  shops: CoffeeShop[]
): Record<string, { count: number, percentage: number }> {
  const total = shops.length
  const frequencies = _.countBy(shops, 'delivery_frequency')
  
  return _.mapValues(frequencies, (count) => ({
    count,
    percentage: (count / total) * 100
  }))
}

// Calculate key metrics for dashboard
export function calculateDashboardMetrics(shops: CoffeeShop[]) {
  const activeShops = shops.filter(shop => shop.isPartner)
  const volumeStats = calculateVolumeStatsByFrequency(activeShops)
  
  return {
    totalShops: shops.length,
    activeShops: activeShops.length,
    totalARR: calculateTotalARR(activeShops),
    averageARR: calculateAverageARR(activeShops),
    totalAnnualVolume: calculateTotalAnnualVolume(activeShops),
    averageAnnualVolume: calculateAverageAnnualVolume(activeShops),
    frequencyDistribution: calculateFrequencyDistribution(activeShops),
    volumeStatsByFrequency: volumeStats
  }
}

// Utility function to format ARR as currency
export function formatARR(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Utility function to format volume
export function formatVolume(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}