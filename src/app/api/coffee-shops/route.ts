// app/api/coffee-shops/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { revalidatePath } from "next/cache"

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

    // 5. Parse numeric values
    const parsedData = {
      ...data,
      followers: data.followers ? parseInt(data.followers) : null,
      volume: data.volume ? parseFloat(data.volume) : null,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviews: data.reviews ? parseInt(data.reviews) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      priority: data.priority ? parseInt(data.priority) : null,
    }

    // 6. Create the coffee shop
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: parsedData.title,
        address: parsedData.address,
        website: parsedData.website || null,
        manager_present: parsedData.manager_present || null,
        contact_name: parsedData.contact_name || null,
        contact_email: parsedData.contact_email || null,
        phone: parsedData.phone || null,
        visited: false,
        instagram: parsedData.instagram || null,
        followers: parsedData.followers,
        store_doors: parsedData.store_doors || null,
        volume: parsedData.volume,
        rating: parsedData.rating,
        reviews: parsedData.reviews,
        price_type: parsedData.price_type || null,
        type: parsedData.type || null,
        types: parsedData.types || [],
        service_options: parsedData.service_options || null,
        hours: parsedData.hours || null,
        operating_hours: parsedData.operating_hours || null,
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
        area: parsedData.area || null,
        is_source: parsedData.is_source || false,
        parlor_coffee_leads: parsedData.parlor_coffee_leads || false,
        notes: parsedData.notes || null,
        priority: parsedData.priority,
        userId: user.id,
        company_data: cleanCompanyData,
        owners: parsedData.owners ? {
          create: parsedData.owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: parsedData.people ? {
          create: parsedData.people.map((person: any) => ({
            ...person,
            userId: user.id
          }))
        } : undefined
      }
    })

    console.log("[COFFEE_SHOPS_POST] Created coffee shop:", coffeeShop)
    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(coffeeShop, { status: 201 })

  } catch (error) {
    console.error("[COFFEE_SHOPS_POST] Error:", error)
    
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

export async function GET(request: Request) {
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

    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase()
    const area = searchParams.get('area')
    const isPartner = searchParams.get('isPartner') === 'true'
    const visited = searchParams.get('visited') === 'true'

    // Build where clause
    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { area: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        area ? { area: { equals: area } } : {},
        isPartner ? { isPartner: true } : {},
        visited ? { visited: true } : {},
      ]
    }

    const coffeeShops = await prisma.coffeeShop.findMany({
      where,
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

    // Handle numeric fields
    if (updateData.volume) updateData.volume = parseFloat(updateData.volume)
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating)
    if (updateData.reviews) updateData.reviews = parseInt(updateData.reviews)
    if (updateData.followers) updateData.followers = parseInt(updateData.followers)
    if (updateData.priority !== undefined) {
      updateData.priority = Math.max(0, Math.min(10, parseInt(updateData.priority)))
    }

    // Handle date fields
    if (updateData.first_visit) updateData.first_visit = new Date(updateData.first_visit)
    if (updateData.second_visit) updateData.second_visit = new Date(updateData.second_visit)
    if (updateData.third_visit) updateData.third_visit = new Date(updateData.third_visit)

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

    revalidatePath('/dashboard/coffee-shops')
    revalidatePath(`/dashboard/coffee-shops/${id}`)

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("[COFFEE_SHOP_PATCH] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
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

    if (!id) {
      return NextResponse.json(
        { error: "Missing coffee shop ID" },
        { status: 400 }
      )
    }

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

    revalidatePath('/dashboard/coffee-shops')

    return NextResponse.json(
      { message: "Coffee shop deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[COFFEE_SHOP_DELETE] Error:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}