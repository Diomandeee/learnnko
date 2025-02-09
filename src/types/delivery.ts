export const DELIVERY_FREQUENCIES = {
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  THREE_WEEKS: "THREE_WEEKS",
  FOUR_WEEKS: "FOUR_WEEKS",
  FIVE_WEEKS: "FIVE_WEEKS",
  SIX_WEEKS: "SIX_WEEKS"
} as const

export type DeliveryFrequency = keyof typeof DELIVERY_FREQUENCIES

export const isValidDeliveryFrequency = (value: string): value is DeliveryFrequency => {
  return Object.values(DELIVERY_FREQUENCIES).includes(value as DeliveryFrequency)
}
