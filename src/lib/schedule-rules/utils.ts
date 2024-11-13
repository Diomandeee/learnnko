import { ScheduleRule } from "@prisma/client"
import { DateTime } from "luxon"

interface EvaluateScheduleRuleParams {
  rule: ScheduleRule
  currentTime?: Date
}

export function evaluateScheduleRule({
  rule,
  currentTime = new Date()
}: EvaluateScheduleRuleParams): boolean {
  const now = DateTime.fromJSDate(currentTime).setZone(rule.timeZone)
  const startDate = DateTime.fromJSDate(rule.startDate).setZone(rule.timeZone)

  // Check if we're after the start date
  if (now < startDate) {
    return false
  }

  // Check if we're before the end date (if specified)
  if (rule.endDate) {
    const endDate = DateTime.fromJSDate(rule.endDate).setZone(rule.timeZone)
    if (now > endDate) {
      return false
    }
  }

  // Check if today is in the allowed days of week
  if (rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(now.weekday % 7)) {
    return false
  }

  // Check time constraints if both start and end times are specified
  if (rule.startTime && rule.endTime) {
    const [startHour, startMinute] = rule.startTime.split(':').map(Number)
    const [endHour, endMinute] = rule.endTime.split(':').map(Number)
    
    const startTimeToday = now.set({ hour: startHour, minute: startMinute })
    const endTimeToday = now.set({ hour: endHour, minute: endMinute })
    
    if (now < startTimeToday || now > endTimeToday) {
      return false
    }
  }

  return true
}

export function findMatchingRule(rules: ScheduleRule[], currentTime: Date = new Date()): ScheduleRule | null {
  // Sort rules by priority (higher number = higher priority)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  // Find the first matching rule
  return sortedRules.find(rule => evaluateScheduleRule({ rule, currentTime })) || null
}
