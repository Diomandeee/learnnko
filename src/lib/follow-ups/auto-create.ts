// src/lib/follow-ups/auto-create.ts

import { prisma } from "@/lib/db/prisma";
import { Visit, CoffeeShop } from "@prisma/client";
import { addBusinessDays } from "date-fns";

export async function createAutoFollowUps(userId: string) {
  try {
    // Get all visits and coffee shops
    const visits = await prisma.visit.findMany({
      include: {
        coffeeShop: true
      }
    });

    const shops = await prisma.coffeeShop.findMany();

    for (const shop of shops) {
      const shopVisits = visits.filter(v => v.coffeeShopId === shop.id);
      await handleShopFollowUps(shop, shopVisits, userId);
    }
  } catch (error) {
    console.error("[AUTO_FOLLOW_UPS]", error);
  }
}

async function handleShopFollowUps(shop: CoffeeShop, visits: Visit[], userId: string) {
  // Sort visits by date
  const sortedVisits = [...visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestVisit = sortedVisits[0];
  if (!latestVisit) return;

  // Check if there are any pending follow-ups for this shop
  const existingFollowUps = await prisma.followUp.findMany({
    where: {
      coffeeShopId: shop.id,
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      }
    }
  });

  if (existingFollowUps.length > 0) return;

  // Determine what kind of follow-up to create based on visit number
  const followUpData = determineFollowUpType(shop, latestVisit, visits.length);

  if (followUpData) {
    await prisma.followUp.create({
      data: {
        ...followUpData,
        coffeeShopId: shop.id,
        assignedTo: userId,
        status: 'PENDING'
      }
    });
  }
}

function determineFollowUpType(shop: CoffeeShop, latestVisit: Visit, visitCount: number) {
  const baseFollowUp = {
    dueDate: addBusinessDays(new Date(latestVisit.date), 3),
    priority: calculatePriority(shop, visitCount)
  };

  // First visit follow-up
  if (visitCount === 1) {
    return {
      ...baseFollowUp,
      type: 'INITIAL_CONTACT',
      priority: 4,
      contactMethod: 'call',
      notes: 'Follow up on initial visit. Discuss first impressions and next steps.'
    };
  }

  // Sample delivery follow-up
  if (latestVisit.samplesDropped) {
    return {
      ...baseFollowUp,
      type: 'SAMPLE_DELIVERY',
      priority: 5,
      contactMethod: 'visit',
      notes: 'Follow up on samples delivered. Get feedback and discuss potential partnership.',
      dueDate: addBusinessDays(new Date(latestVisit.date), 4)
    };
  }

  // Stage-based follow-ups
  switch (shop.stage) {
    case 'PROPOSAL':
      return {
        ...baseFollowUp,
        type: 'PROPOSAL_FOLLOW',
        priority: 5,
        contactMethod: 'call',
        notes: 'Follow up on proposal. Address any questions and move towards partnership.',
        dueDate: addBusinessDays(new Date(latestVisit.date), 2)
      };

    case 'NEGOTIATION':
      return {
        ...baseFollowUp,
        type: 'TEAM_MEETING',
        priority: 5,
        contactMethod: 'visit',
        notes: 'Schedule meeting with decision makers to finalize partnership details.',
        dueDate: addBusinessDays(new Date(latestVisit.date), 1)
      };

    default:
      if (visitCount > 1) {
        return {
          ...baseFollowUp,
          type: 'CHECK_IN',
          contactMethod: 'visit',
          notes: `Follow up visit #${visitCount}. Continue building relationship and assess needs.`
        };
      }
  }

  return null;
}

function calculatePriority(shop: CoffeeShop, visitCount: number): number {
  let priority = 3; // Base priority

  // Increase priority based on stage
  if (shop.stage === 'PROPOSAL' || shop.stage === 'NEGOTIATION') {
    priority += 1;
  }

  // Increase priority for high potential
  if (shop.potential && shop.potential >= 4) {
    priority += 1;
  }

  // Increase priority for high volume
  if (shop.volume && parseFloat(shop.volume) > 50) {
    priority += 1;
  }

  // Cap priority between 1-5
  return Math.min(Math.max(priority, 1), 5);
}