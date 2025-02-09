import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { generateInitialFollowUps } from "@/lib/follow-ups/generate-initial"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const shops = await prisma.coffeeShop.findMany()
    const suggestions = await generateInitialFollowUps(shops)

    const createdFollowUps = await Promise.all(
      suggestions.map(suggestion =>
        prisma.followUp.create({
          data: {
            ...suggestion,
            assignedTo: user.id,
            status: 'PENDING'
          }
        })
      )
    )

    await Promise.all(
      suggestions.map(suggestion =>
        prisma.coffeeShop.update({
          where: { id: suggestion.coffeeShopId },
          data: {
            followUpCount: { increment: 1 },
            lastFollowUp: new Date(),
            nextFollowUpDate: suggestion.dueDate
          }
        })
      )
    )

    return NextResponse.json({
      data: createdFollowUps,
      count: createdFollowUps.length
    })
  } catch (error) {
    console.error("[FOLLOW_UPS_GENERATE]", error)
    return NextResponse.json(
      { error: "Failed to generate follow-ups" },
      { status: 500 }
    )
  }
}
