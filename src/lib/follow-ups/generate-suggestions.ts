import { CoffeeShop } from "@prisma/client"
import { addBusinessDays, differenceInDays } from "date-fns"

export function generateFollowUpSuggestions(shop: CoffeeShop) {
  const suggestions = []
  const today = new Date()

  // Initial visit follow-up
  if (shop.first_visit && !shop.second_visit) {
    suggestions.push({
      type: 'INITIAL_CONTACT',
      dueDate: addBusinessDays(new Date(shop.first_visit), 3),
      priority: 4,
      contactMethod: 'call',
      notes: 'Follow up on initial visit',
      coffeeShopId: shop.id
    })
  }

  // Sample follow-up
  if (shop.second_visit && !shop.third_visit) {
    suggestions.push({
      type: 'SAMPLE_DELIVERY',
      dueDate: addBusinessDays(new Date(shop.second_visit), 4),
      priority: 5,
      contactMethod: 'visit',
      notes: 'Follow up on samples',
      coffeeShopId: shop.id
    })
  }

  // Stage-based follow-ups
  switch (shop.stage) {
    case 'PROSPECTING':
      if (!shop.first_visit) {
        suggestions.push({
          type: 'INITIAL_CONTACT',
          dueDate: addBusinessDays(today, 1),
          priority: 3,
          contactMethod: 'visit',
          notes: 'Initial visit',
          coffeeShopId: shop.id
        })
      }
      break
    case 'PROPOSAL':
      suggestions.push({
        type: 'PROPOSAL_FOLLOW',
        dueDate: addBusinessDays(today, 2),
        priority: 5,
        contactMethod: 'call',
        notes: 'Follow up on proposal',
        coffeeShopId: shop.id
      })
      break
  }

  return suggestions
}