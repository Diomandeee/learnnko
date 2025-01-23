import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const visits = await prisma.visit.findMany({
      where: {
        coffeeShopId: params.id
      },
      orderBy: {
        date: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Coffee shop ID is required", { status: 400 })
    }

    // Validate that the coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: params.id }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    const json = await request.json()

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { 
        coffeeShopId: params.id 
      }
    })

    const visit = await prisma.visit.create({
      data: {
        ...json,
        coffeeShopId: params.id,
        userId: session.user.id,
        visitNumber: visitCount + 1
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Update coffee shop's visited status
    await prisma.coffeeShop.update({
      where: { id: params.id },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[COFFEE_SHOP_VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
