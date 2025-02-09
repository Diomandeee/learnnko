import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { revalidatePath } from "next/cache"
import { Stage } from "@prisma/client"
import { isValidDeliveryFrequency } from "@/types/delivery"

// Helper function to calculate stage
function calculateStage(shop: { isPartner?: boolean; visited?: boolean }): Stage {
  if (shop.isPartner) return "WON"
  if (shop.visited) return "QUALIFICATION"
  return "PROSPECTING"
}

const DELIVERY_FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "THREE_WEEKS",
  "FOUR_WEEKS",
  "FIVE_WEEKS",
  "SIX_WEEKS"
] as const



function parseNumericFields(data: any) {
  return {
    ...data,
    followers: data.followers ? parseInt(data.followers) : null,
    volume: data.volume ? parseFloat(data.volume) : null,
    rating: data.rating ? parseFloat(data.rating) : null,
    reviews: data.reviews ? parseInt(data.reviews) : null,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    priority: data.priority ? parseInt(data.priority) : 0,
    first_delivery_week: data.first_delivery_week ? parseInt(data.first_delivery_week) : null
  }
}
// Helper function to clean company data
function cleanCompanyData(data: any) {
  if (!data.company_data) return null
  
  return {
    size: data.company_data.size || null,
    industry: data.company_data.industry || null,
    founded_in: data.company_data.founded_in || null,
    description: data.company_data.description || null,
    linkedin: data.company_data.linkedin || null
  }
}

export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Get and validate coffee shop data
    const data = await request.json()
    
    // 4. Parse numeric values and clean data
    const parsedData = parseNumericFields(data)
    const companyData = cleanCompanyData(data)
    
    // Ensure visited is true if first_visit is set
    if (parsedData.first_visit) {
      parsedData.visited = true
    }
    
    // Calculate initial stage based on first visit
    const initialStage = parsedData.first_visit ? "QUALIFICATION" : calculateStage({
      isPartner: parsedData.isPartner,
      visited: parsedData.visited
    })

    // 5. Create the coffee shop with all necessary fields
    const coffeeShop = await prisma.coffeeShop.create({
      data: {
        title: parsedData.title,
        address: parsedData.address,
        website: parsedData.website || null,
        manager_present: parsedData.manager_present || null,
        contact_name: parsedData.contact_name || null,
        contact_email: parsedData.contact_email || null,
        phone: parsedData.phone || null,
        visited: parsedData.visited || false,
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
        priority: parsedData.priority || 0,
        stage: parsedData.stage || initialStage,
        userId: user.id,
        company_data: companyData,
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
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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

    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase()
    const area = searchParams.get('area')
    const isPartner = searchParams.get('isPartner') === 'true'
    const visited = searchParams.get('visited') === 'true'
    const stage = searchParams.get('stage') as Stage | null

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
        stage ? { stage: stage } : {},
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

    // Validate delivery frequency if present
    if (updateData.delivery_frequency) {
      if (!isValidDeliveryFrequency(updateData.delivery_frequency)) {
        return NextResponse.json(
          { error: "Invalid delivery frequency" },
          { status: 400 }
        )
      }
    }

    // Validate first delivery week if present
    if (updateData.first_delivery_week !== undefined) {
      const weekNum = parseInt(updateData.first_delivery_week)
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
        return NextResponse.json(
          { error: "First delivery week must be between 1 and 53" },
          { status: 400 }
        )
      }
    }

    // Parse numeric values
    const parsedData = parseNumericFields(updateData)

    // Handle date fields
    if (parsedData.first_visit) parsedData.first_visit = new Date(parsedData.first_visit)
    if (parsedData.second_visit) parsedData.second_visit = new Date(parsedData.second_visit)
    if (parsedData.third_visit) parsedData.third_visit = new Date(parsedData.third_visit)

    // Handle domain search updates
    if (domainEmails) {
      parsedData.domainEmails = domainEmails
      parsedData.lastDomainSearch = new Date()
    }

    // Update stage if partner or visited status changes
    if (parsedData.isPartner !== undefined || parsedData.visited !== undefined) {
      const currentShop = await prisma.coffeeShop.findUnique({
        where: { id },
        select: { isPartner: true, visited: true }
      })

      if (currentShop) {
        parsedData.stage = calculateStage({
          isPartner: parsedData.isPartner ?? currentShop.isPartner,
          visited: parsedData.visited ?? currentShop.visited
        })
      }
    }

    // Ensure delivery frequency is set when first delivery week is set
    if (parsedData.first_delivery_week && !parsedData.delivery_frequency) {
      parsedData.delivery_frequency = "WEEKLY" // Default to weekly if not specified
    }

    // Log the update for debugging
    console.log("Updating shop with data:", {
      id,
      delivery_frequency: parsedData.delivery_frequency,
      first_delivery_week: parsedData.first_delivery_week
    })

    const updatedShop = await prisma.coffeeShop.update({
      where: { id },
      data: {
        ...parsedData,
        owners: owners ? {
          deleteMany: {},
          create: owners.map((owner: any) => ({
            name: owner.name,
            email: owner.email
          }))
        } : undefined,
        people: people ? {
          createMany: {
            data: people.map((person: any) => ({
              ...person,
              userId: session.user.id
            }))
          }
        } : undefined
      },
      include: {
        owners: true,
        people: true
      }
    })

    console.log("Shop updated successfully:", {
      id: updatedShop.id,
      delivery_frequency: updatedShop.delivery_frequency,
      first_delivery_week: updatedShop.first_delivery_week
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

    // Delete related records in a transaction
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