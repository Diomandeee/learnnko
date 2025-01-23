import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET() {
  try {
    console.log("Fetching coffee shops...")  // Debug log
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log(`Found ${coffeeShops.length} coffee shops`)  // Debug log
    return NextResponse.json(coffeeShops)
  } catch (error) {
    console.error("[COFFEE_SHOPS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
