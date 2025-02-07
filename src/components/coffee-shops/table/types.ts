import { CoffeeShop } from "@prisma/client"

export type SortConfig = {
  key: keyof CoffeeShop | null
  direction: 'asc' | 'desc'
}

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

export type FilterType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume'
type DeliveryFrequency = 'WEEKLY' | 'BIWEEKLY';

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

export const STAGE_COLORS = {
  PROSPECTING: "blue",
  QUALIFICATION: "yellow",
  MEETING: "purple",
  PROPOSAL: "cyan",
  NEGOTIATION: "orange",
  PAUSED: "gray",
  WON: "green",
  LOST: "red"
} as const

export const STAGE_LABELS = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  MEETING: "Meeting",
  PROPOSAL: "Proposal", 
  NEGOTIATION: "Negotiation",
  PAUSED: "Paused",
  WON: "Won",
  LOST: "Lost"
} as const

export const DELIVERY_FREQUENCY = {
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  THREE_WEEKS: "THREE_WEEKS",
  FOUR_WEEKS: "FOUR_WEEKS",
  FIVE_WEEKS: "FIVE_WEEKS",
  SIX_WEEKS: "SIX_WEEKS"
} as const

export const DELIVERY_FREQUENCY_LABELS = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  THREE_WEEKS: "Every 3 weeks",
  FOUR_WEEKS: "Every 4 weeks",
  FIVE_WEEKS: "Every 5 weeks",
  SIX_WEEKS: "Every 6 weeks"
} as const


interface VolumeData {
  amount: number;
  frequency: DeliveryFrequency;
}
