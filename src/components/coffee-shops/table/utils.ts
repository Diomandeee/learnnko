// src/components/coffee-shops/table/utils.ts

import { CoffeeShop } from "@prisma/client"
import { SortConfig, Filter } from "./types"

/**
 * Filter shops based on active filters
 */
export function filterShops(shops: CoffeeShop[], filters: Filter[]): CoffeeShop[] {
  if (!filters.length) return shops

  return shops.filter(shop => {
    return filters.every(filter => {
      const value = shop[filter.field]

      switch (filter.operator) {
        case 'equals':
          if (filter.type === 'boolean') {
            return value === (filter.value === 'true')
          }
          return value === filter.value

        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase())

        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())

        case 'greaterThan':
          if (filter.type === 'date') {
            return new Date(value) > new Date(filter.value)
          }
          return Number(value) > Number(filter.value)

        case 'lessThan':
          if (filter.type === 'date') {
            return new Date(value) < new Date(filter.value)
          }
          return Number(value) < Number(filter.value)

        case 'between':
          if (filter.type === 'date') {
            const date = new Date(value)
            return date >= new Date(filter.value.min) && date <= new Date(filter.value.max)
          }
          const numValue = Number(value)
          return numValue >= Number(filter.value.min) && numValue <= Number(filter.value.max)

        default:
          return true
      }
    })
  })
}

/**
 * Sort shops based on sort configuration
 */
export function sortShops(shops: CoffeeShop[], sortConfig: SortConfig): CoffeeShop[] {
  if (!sortConfig.key) return shops

  return [...shops].sort((a, b) => {
    const aVal = a[sortConfig.key!]
    const bVal = b[sortConfig.key!]

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    // Handle special cases
    switch (sortConfig.key) {
      case 'first_visit':
      case 'second_visit':
      case 'third_visit':
        return sortConfig.direction === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime()

      case 'volume':
      case 'rating':
      case 'reviews':
      case 'followers':
      case 'priority':
        return sortConfig.direction === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal)

      case 'owners':
        // Sort by number of owners first, then by first owner's name
        const aOwners = Array.isArray(aVal) ? aVal : []
        const bOwners = Array.isArray(bVal) ? bVal : []
        if (aOwners.length !== bOwners.length) {
          return sortConfig.direction === 'asc'
            ? aOwners.length - bOwners.length
            : bOwners.length - aOwners.length
        }
        const aFirstOwner = aOwners[0]?.name || ''
        const bFirstOwner = bOwners[0]?.name || ''
        return sortConfig.direction === 'asc'
          ? aFirstOwner.localeCompare(bFirstOwner)
          : bFirstOwner.localeCompare(aFirstOwner)

      default:
        // String comparison for everything else
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
    }
  })
}

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
export function calculateARR(volume: string | number | null): number {
  if (!volume) return 0
  const weeklyVolume = typeof volume === 'string' ? parseFloat(volume) : volume
  return (weeklyVolume * 52) * 18
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