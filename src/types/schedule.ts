import { CoffeeShop } from "@prisma/client"

export type TimeBlockType = 
  | 'TEAM_MEETING'
  | 'CLIENT_MEETING'
  | 'DELIVERY'
  | 'BREAK'
  | 'PRIORITY_VISIT'
  | 'NEARBY_VISIT'
  | 'OTHER'

export type TimeBlock = {
  id: string
  day: number // 0-6 for Monday-Sunday
  startTime: string
  endTime: string
  type: TimeBlockType
  title: string
  description?: string
  recurrent?: boolean
}

export type DaySchedule = {
  day: number
  date: Date | string  // Allow both Date and string types
  timeBlocks: TimeBlock[]
  visits: ScheduledVisit[]
  availableMinutes: number
}

export type ScheduledVisit = {
  id: string
  shopId: string
  shop: CoffeeShop
  startTime: string
  endTime: string
  day: number
  isPriority: boolean
  estimatedDuration: number // in minutes
}

export type WeeklySchedule = {
  weekNumber: number
  startDate: Date
  endDate: Date
  days: DaySchedule[]
}
