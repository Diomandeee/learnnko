import { CoffeeShop } from "@prisma/client"

export type SortConfig = {
  key: keyof CoffeeShop | null
  direction: 'asc' | 'desc'
}

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

export type FilterType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume'

export interface Filter {
  id: string
  field: keyof CoffeeShop
  operator: FilterOperator
  value: any
  type: FilterType
}

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterType
  operators: FilterOperator[]
}
