// src/lib/follow-ups/generate-initial.ts

import { CoffeeShop, FollowUpType } from "@prisma/client"
import { addBusinessDays, isAfter, isFuture } from "date-fns"

interface FollowUpSuggestion {
  coffeeShopId: string
  type: FollowUpType
  priority: number
  dueDate: Date
  notes: string
  contactMethod: string
}

function getLatestVisitDate(shop: CoffeeShop): Date | null {
  const visits = [
    shop.first_visit,
    shop.second_visit,
    shop.third_visit
  ].filter(Boolean) as Date[]
  
  return visits.length > 0 
    ? new Date(Math.max(...visits.map(date => new Date(date).getTime())))
    : null
}

function shouldGenerateFollowUp(shop: CoffeeShop): boolean {
  // Skip if already a partner
  if (shop.isPartner) return false

  // Skip if in PROSPECTING and not visited
  if (shop.stage === 'PROSPECTING' && !shop.visited) return false

  // Skip if next visit is already scheduled
  if (shop.nextFollowUpDate && isFuture(new Date(shop.nextFollowUpDate))) return false

  return true
}

export async function generateInitialFollowUps(shops: CoffeeShop[]): Promise<FollowUpSuggestion[]> {
  const followUps: FollowUpSuggestion[] = []
  const today = new Date()

  for (const shop of shops) {
    if (!shouldGenerateFollowUp(shop)) continue

    const latestVisit = getLatestVisitDate(shop)
    const basePriority = calculateBasePriority(shop)

    // Stage-based follow-ups
    switch (shop.stage) {
      case 'QUALIFICATION':
        if (!shop.second_visit) {
          followUps.push({
            coffeeShopId: shop.id,
            type: 'SAMPLE_DELIVERY',
            priority: basePriority + 1,
            dueDate: addBusinessDays(today, 2),
            notes: `Schedule sample delivery for ${shop.title}. ${shop.potential ? `High potential (${shop.potential}/5).` : ''} Contact: ${shop.contact_name || shop.manager_present || 'TBD'}`,
            contactMethod: shop.communicationPreference || 'call'
          })
        }
        break

      case 'MEETING':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'TEAM_MEETING',
          priority: basePriority + 1,
          dueDate: addBusinessDays(today, 1),
          notes: `Schedule team meeting at ${shop.title}. Decision maker: ${shop.decisionMaker || 'TBD'}. ${shop.budget ? `Budget: $${shop.budget}` : ''}`,
          contactMethod: 'visit'
        })
        break

      case 'PROPOSAL':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'PROPOSAL_FOLLOW',
          priority: basePriority + 2,
          dueDate: addBusinessDays(today, 2),
          notes: `Follow up on proposal with ${shop.title}. Volume potential: ${shop.volume || 'TBD'}. ${shop.competitors ? `Current suppliers: ${shop.competitors.join(', ')}` : ''}`,
          contactMethod: 'call'
        })
        break

      case 'NEGOTIATION':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'TEAM_MEETING',
          priority: 5, // Highest priority for negotiations
          dueDate: addBusinessDays(today, 1),
          notes: `Close deal with ${shop.title}. ${shop.closingNotes ? `Notes: ${shop.closingNotes}` : ''}`,
          contactMethod: 'visit'
        })
        break
    }

    // Visit-based follow-ups
    if (latestVisit) {
      const daysSinceVisit = Math.floor((today.getTime() - latestVisit.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceVisit > 7 && !shop.third_visit) {
        followUps.push({
          coffeeShopId: shop.id,
          type: 'CHECK_IN',
          priority: basePriority,
          dueDate: addBusinessDays(today, 1),
          notes: `Follow up needed after ${daysSinceVisit} days since last visit to ${shop.title}. ${shop.notes ? `Previous notes: ${shop.notes}` : ''}`,
          contactMethod: shop.communicationPreference || 'call'
        })
      }
    }

    // High priority follow-ups
    if (shop.potential && shop.potential >= 4) {
      followUps.push({
        coffeeShopId: shop.id,
        type: 'CHECK_IN',
        priority: 5,
        dueDate: addBusinessDays(today, 1),
        notes: `High potential opportunity (${shop.potential}/5) at ${shop.title}. ${shop.interest ? `Interest level: ${shop.interest}/5.` : ''} Best time to visit: ${shop.bestTimeToVisit || 'TBD'}`,
        contactMethod: 'visit'
      })
    }
  }

  // Sort follow-ups by priority and due date
  return followUps.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
}

function calculateBasePriority(shop: CoffeeShop): number {
  let priority = 3 // Base priority

  // Increase priority based on stage
  if (['PROPOSAL', 'NEGOTIATION'].includes(shop.stage)) {
    priority += 1
  }

  // Increase for high potential
  if (shop.potential && shop.potential >= 4) {
    priority += 1
  }

  // Increase for high volume
  if (shop.volume && parseFloat(shop.volume) > 50) {
    priority += 1
  }

  // Lower priority if no decision maker identified
  if (!shop.decisionMaker) {
    priority -= 1
  }

  // Cap between 1-5
  return Math.min(Math.max(priority, 1), 5)
}