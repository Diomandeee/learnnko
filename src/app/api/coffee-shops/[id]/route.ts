import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Handle date conversions
    const updateData = {
      ...body,
      // Only convert dates if they exist in the payload
      ...(body.first_visit && { first_visit: new Date(body.first_visit) }),
      ...(body.second_visit && { second_visit: new Date(body.second_visit) }),
      ...(body.third_visit && { third_visit: new Date(body.third_visit) }),
      // Update visited status if setting first visit
      ...(body.first_visit && { visited: true }),
      updatedAt: new Date()
    }

    const coffeeShop = await prisma.coffeeShop.update({
      where: {
        id: params.id
      },
      data: updateData
    })

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH]", error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          details: "Failed to update coffee shop"
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

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
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: {
        id: params.id
      }
    })

    if (!coffeeShop) {
      return new NextResponse("Coffee shop not found", { status: 404 })
    }

    return NextResponse.json(coffeeShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.id) {
      return new NextResponse("Missing shop ID", { status: 400 })
    }

    await prisma.coffeeShop.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE]", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
 