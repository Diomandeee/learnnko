import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { RouteOptimizer } from "@/lib/route-optimizer"

const routeSettingsSchema = z.object({
  startingPoint: z.string(),
  maxStops: z.number().min(1).max(20),
  maxDistance: z.number().min(1).max(10)
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const settings = routeSettingsSchema.parse(json)

    // Get starting point shop
    const startShop = await prisma.shop.findUnique({
      where: { id: settings.startingPoint }
    })

    if (!startShop) {
      return new NextResponse("Starting point not found", { status: 404 })
    }

    // Get potential target shops
    const targetShops = await prisma.shop.findMany({
      where: {
        id: { not: settings.startingPoint },
        // Add any additional filters like visited status
      }
    })

    // Initialize route optimizer
    const optimizer = new RouteOptimizer({
      maxStops: settings.maxStops,
      maxDistance: settings.maxDistance
    })

    // Generate optimized route
    const route = await optimizer.generateRoute(startShop, targetShops)

    return NextResponse.json(route)
  } catch (error) {
    console.error("[ROUTE_GENERATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
