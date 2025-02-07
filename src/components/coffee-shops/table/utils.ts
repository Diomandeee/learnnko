// src/components/coffee-shops/table/utils.ts

import { CoffeeShop } from "@prisma/client"
import { SortConfig, Filter } from "./types"

/**
 * Sort shops based on sort configuration
 */
export function sortShops(shops: CoffeeShop[], sortConfig: SortConfig): CoffeeShop[] {
  if (!sortConfig.key) return shops

  return [...shops].sort((a, b) => {
    const aVal = a[sortConfig.key!]
    const bVal = b[sortConfig.key!]

    // Special handling for date fields with null values
    const dateFields = ['first_visit', 'second_visit', 'third_visit']
    if (dateFields.includes(sortConfig.key)) {
      // Move null/undefined values to the bottom regardless of sort direction
      if (!aVal && !bVal) return 0
      if (!aVal) return 1  // Move 'a' to the bottom
      if (!bVal) return -1 // Move 'b' to the bottom
      
      const aDate = new Date(aVal).getTime()
      const bDate = new Date(bVal).getTime()
      
      // Handle invalid dates
      if (isNaN(aDate)) return 1
      if (isNaN(bDate)) return -1
      
      return sortConfig.direction === 'asc'
        ? aDate - bDate
        : bDate - aDate
    }

 

    // Default string comparison
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
}

// Rest of the utils.ts file remains the same...

/**
 * Search shops based on search term
 */
export function searchShops(shops: CoffeeShop[], searchTerm: string): CoffeeShop[] {
  if (!searchTerm) return shops

  const normalizedSearch = searchTerm.toLowerCase().trim()
  const searchFields: (keyof CoffeeShop)[] = [
    'title',
    'area',
    'address',
    'manager_present',
    'contact_name',
    'contact_email',
    'instagram',
    'notes'
  ]

  return shops.filter(shop => {
    // Search in main fields
    const mainFieldsMatch = searchFields.some(field => {
      const value = shop[field]
      return value && String(value).toLowerCase().includes(normalizedSearch)
    })

    if (mainFieldsMatch) return true

    // Search in owners
    const ownersMatch = shop.owners?.some(owner => 
      owner.name.toLowerCase().includes(normalizedSearch) ||
      owner.email.toLowerCase().includes(normalizedSearch)
    )

    return ownersMatch
  })
}

/**
 * Calculate ARR (Annual Recurring Revenue)
 */
export function calculateARR(volume: string | number | null, frequency: string | null): number {
  if (!volume) return 0
  const weeklyVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  
  // Calculate number of deliveries per year based on frequency
  let deliveriesPerYear = 52; // Default to weekly
  switch (frequency) {
    case 'WEEKLY':
      deliveriesPerYear = 52;
      break;
    case 'BIWEEKLY':
      deliveriesPerYear = 26;
      break;
    case 'THREE_WEEKS':
      deliveriesPerYear = 17;
      break;
    case 'FOUR_WEEKS':
      deliveriesPerYear = 13;
      break;
    case 'FIVE_WEEKS':
      deliveriesPerYear = 10;
      break;
    case 'SIX_WEEKS':
      deliveriesPerYear = 9;
      break;
  }

  return (weeklyVolume * deliveriesPerYear) * 18;
}

/**
 * Format ARR for display
 */
export function formatARR(volume: string | number | null): string {
  const arr = calculateARR(volume)
  return arr ? `$${arr.toLocaleString()}` : '-'
}

/**
 * Parse owner string into owner objects
 */
export function parseOwners(ownerString: string): Array<{ name: string; email: string }> {
  if (!ownerString) return []

  return ownerString
    .split(',')
    .map(owner => {
      const match = owner.trim().match(/^(.+?)\s*\((.+?)\)$/)
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim()
        }
      }
      return null
    })
    .filter((owner): owner is { name: string; email: string } => owner !== null)
}

/**
 * Format owners for display
 */
export function formatOwners(owners: Array<{ name: string; email: string }>): string {
  return owners.map(owner => `${owner.name} (${owner.email})`).join(', ')
}