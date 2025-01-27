// src/app/api/coffee-shops/priority/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { 
  calculatePriority, 
  updateAllShopPriorities 
} from "@/lib/coffee-shops/priority-calculator"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check user role (optional, you might want to restrict to admins)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Trigger priority recalculation
    await updateAllShopPriorities()

    return NextResponse.json(
      { 
        message: "Priorities recalculated successfully",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_RECALCULATION] Error:", error)
    return NextResponse.json(
      { error: "Failed to recalculate priorities" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch current priority distribution
    const priorityDistribution = await prisma.coffeeShop.groupBy({
      by: ['priority'],
      _count: {
        id: true
      },
      orderBy: {
        priority: 'asc'
      }
    })

    return NextResponse.json(
      { 
        distribution: priorityDistribution,
        lastUpdated: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PRIORITY_DISTRIBUTION] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch priority distribution" },
      { status: 500 }
    )
  }
}