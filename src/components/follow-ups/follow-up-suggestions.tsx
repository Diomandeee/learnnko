import { CoffeeShop } from "@prisma/client"
import { format, addDays, addBusinessDays, isAfter, differenceInDays } from "date-fns"

interface FollowUpSuggestion {
  type: string
  dueDate: Date
  priority: number
  contactMethod: string
  notes: string
  coffeeShopId: string
}

interface FollowUpRule {
  type: string
  priority: number
  daysAfter: number
  contactMethod: string
  notes: string
}

// Rules for different stages and scenarios
const STAGE_RULES: Record<string, FollowUpRule[]> = {
  PROSPECTING: [
    {
      type: "INITIAL_CONTACT",
      priority: 3,
      daysAfter: 1,
      contactMethod: "visit",
      notes: "Initial visit to introduce products and establish contact."
    }
  ],
  QUALIFICATION: [
    {
      type: "SAMPLE_DELIVERY",
      priority: 4,
      daysAfter: 3,
      contactMethod: "visit",
      notes: "Follow up on initial interest and bring samples."
    }
  ],
  PROPOSAL: [
    {
      type: "PROPOSAL_FOLLOW",
      priority: 5,
      daysAfter: 2,
      contactMethod: "call",
      notes: "Follow up on proposal and address any questions."
    }
  ],
  NEGOTIATION: [
    {
      type: "TEAM_MEETING",
      priority: 5,
      daysAfter: 1,
      contactMethod: "visit",
      notes: "Schedule meeting with decision makers to finalize details."
    }
  ]
}

// Visit-based rules
const VISIT_RULES: Record<string, FollowUpRule> = {
  FIRST_VISIT: {
    type: "INITIAL_CONTACT",
    priority: 4,
    daysAfter: 3,
    contactMethod: "call",
    notes: "Follow up on initial visit. Discuss first impressions and address questions."
  },
  SECOND_VISIT: {
    type: "SAMPLE_DELIVERY",
    priority: 5,
    daysAfter: 4,
    contactMethod: "visit",
    notes: "Follow up on samples and discuss potential partnership."
  },
  THIRD_VISIT: {
    type: "PROPOSAL_FOLLOW",
    priority: 4,
    daysAfter: 5,
    contactMethod: "call",
    notes: "Follow up on final visit and discuss next steps."
  }
}

export function generateFollowUpSuggestions(shop: CoffeeShop): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = []
  const today = new Date()

  // Helper function to create a suggestion
  const createSuggestion = (
    rule: FollowUpRule,
    baseDate: Date,
    extraNotes?: string
  ): FollowUpSuggestion => ({
    type: rule.type,
    dueDate: addBusinessDays(baseDate, rule.daysAfter),
    priority: rule.priority,
    contactMethod: rule.contactMethod,
    notes: extraNotes ? `${rule.notes} ${extraNotes}` : rule.notes,
    coffeeShopId: shop.id
  })

  // Stage-based suggestions
  if (shop.stage && STAGE_RULES[shop.stage]) {
    STAGE_RULES[shop.stage].forEach(rule => {
      const suggestion = createSuggestion(rule, today)
      if (isAfter(suggestion.dueDate, today)) {
        suggestions.push(suggestion)
      }
    })
  }

  // Visit-based suggestions
  if (shop.first_visit && !shop.second_visit) {
    const firstVisitDate = new Date(shop.first_visit)
    suggestions.push(createSuggestion(
      VISIT_RULES.FIRST_VISIT,
      firstVisitDate,
      `Previous visit was on ${format(firstVisitDate, 'MMM d')}.`
    ))
  }

  if (shop.second_visit && !shop.third_visit) {
    const secondVisitDate = new Date(shop.second_visit)
    suggestions.push(createSuggestion(
      VISIT_RULES.SECOND_VISIT,
      secondVisitDate,
      `Samples delivered on ${format(secondVisitDate, 'MMM d')}.`
    ))
  }

  if (shop.third_visit) {
    const thirdVisitDate = new Date(shop.third_visit)
    const daysSinceThirdVisit = differenceInDays(today, thirdVisitDate)
    
    if (daysSinceThirdVisit <= 7) {
      suggestions.push(createSuggestion(
        VISIT_RULES.THIRD_VISIT,
        thirdVisitDate,
        `Final visit completed on ${format(thirdVisitDate, 'MMM d')}.`
      ))
    }
  }

  // Special case: Long time no contact
  const lastVisitDate = shop.third_visit || shop.second_visit || shop.first_visit
  if (lastVisitDate) {
    const daysSinceLastVisit = differenceInDays(today, new Date(lastVisitDate))
    if (daysSinceLastVisit > 14 && !shop.isPartner) {
      suggestions.push({
        type: "CHECK_IN",
        dueDate: addBusinessDays(today, 1),
        priority: 3,
        contactMethod: "call",
        notes: `No contact in ${daysSinceLastVisit} days. Reconnect and assess current status.`,
        coffeeShopId: shop.id
      })
    }
  }

  // Special case: High potential leads without recent contact
  if (shop.potential && shop.potential >= 4 && !shop.isPartner) {
    const lastVisit = new Date(lastVisitDate || 0)
    const daysSinceContact = differenceInDays(today, lastVisit)
    
    if (daysSinceContact > 7) {
      suggestions.push({
        type: "HIGH_POTENTIAL",
        dueDate: addBusinessDays(today, 1),
        priority: 5,
        contactMethod: "visit",
        notes: "High potential lead requires immediate follow-up.",
        coffeeShopId: shop.id
      })
    }
  }

  // Volume-based suggestions
  if (shop.volume) {
    const weeklyVolume = parseFloat(shop.volume)
    if (weeklyVolume > 50 && !shop.isPartner) {
      suggestions.push({
        type: "HIGH_VOLUME",
        dueDate: addBusinessDays(today, 1),
        priority: 5,
        contactMethod: "visit",
        notes: `High volume potential (${weeklyVolume} units/week). Priority follow-up required.`,
        coffeeShopId: shop.id
      })
    }
  }

  // Sort suggestions by priority and due date
  return suggestions.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
}