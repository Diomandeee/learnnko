// app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    console.log("[COFFEE_SHOPS_POST] Session data:", {
      email: session?.user?.email,
      exists: !!session
    })

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    let user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log("[COFFEE_SHOPS_POST] Found user:", user)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Get and validate coffee shop data
    const data = await request.json()
    console.log("[COFFEE_SHOPS_POST] Received data:", data)

    // 4. Clean up the company_data field
    const cleanCompanyData = data.company_data ? {
      size: data.company_data.size || null,
      industry: data.company_data.industry || null,
      founded_in: data.company_data.founded_in || null,
      description: data.company_data.description || null,
      linkedin: data.company_data.linkedin || null
    } : undefined

    // 5. Create the coffee shop
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: data.title,
        address: data.address,
        website: data.website || null,
        manager_present: data.manager_present || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        phone: data.phone || null,
        visited: false,
        instagram: data.instagram || null,
        followers: data.followers ? parseInt(data.followers) : null,
        store_doors: data.store_doors || null,
        volume: data.volume || null,
        rating: data.rating ? parseFloat(data.rating) : null,
        reviews: data.reviews ? parseInt(data.reviews) : null,
        price_type: data.price_type || null,
        type: data.type || null,
        types: data.types || [],
        service_options: data.service_options || null,
        hours: data.hours || null,
        operating_hours: data.operating_hours || null,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        area: data.area || null,
        is_source: data.is_source || false,
        parlor_coffee_leads: data.parlor_coffee_leads || false,
        notes: data.notes || null,
        userId: user.id,
        company_data: cleanCompanyData
      }
    })

    console.log("[COFFEE_SHOPS_POST] Created coffee shop:", coffeeShop)

    return NextResponse.json(coffeeShop, { status: 201 })

  } catch (error) {
    console.error("[COFFEE_SHOPS_POST] Error:", error)
    
    // Handle specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to create coffee shop" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("[COFFEE_SHOPS_GET] Session:", session)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      include: {
        owners: true,
        people: true
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    })

    console.log(`Found ${coffeeShops.length} coffee shops`)
    return NextResponse.json(coffeeShops)
  } catch (error) {
    console.error("[COFFEE_SHOPS_GET] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, owners, people, domainEmails, ...updateData } = data

    // Validate priority if present
    if (updateData.priority !== undefined) {
      updateData.priority = Math.max(0, Math.min(10, parseInt(updateData.priority)))
    }

    // Handle domain search updates
    if (domainEmails) {
      updateData.domainEmails = domainEmails
      updateData.lastDomainSearch = new Date()
    }

    const updatedShop = await prisma.coffeeShop.update({
      where: { id },
      data: {
        ...updateData,
        // Update owners if provided
        ...(owners && {
          owners: {
            deleteMany: {},
            create: owners.map((owner: { name: string; email: string }) => ({
              name: owner.name,
              email: owner.email
            }))
          }
        }),
        // Update people if provided
        ...(people && {
          people: {
            createMany: {
              data: people.map((person: any) => ({
                ...person,
                userId: session.user.id
              }))
            }
          }
        })
      },
      include: {
        owners: true,
        people: true
      }
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id } = data

    // Delete related records first
    await prisma.$transaction([
      prisma.person.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.owner.deleteMany({
        where: { coffeeShopId: id }
      }),
      prisma.coffeeShop.delete({
        where: { id }
      })
    ])

    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}