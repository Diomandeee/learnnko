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
     console.log("[COFFEE_SHOPS_POST] No valid session found")
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
     console.log("[COFFEE_SHOPS_POST] User not found")
     return NextResponse.json(
       { error: "User not found" },
       { status: 404 }
     )
   }

   // 3. Get and validate coffee shop data
   const data = await request.json()
   console.log("[COFFEE_SHOPS_POST] Received data:", data)

   // 4. Create the coffee shop with owners
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
       owners: {
         create: data.owners?.map((owner: { name: string; email: string }) => ({
           name: owner.name,
           email: owner.email
         })) || []
       }
     },
     include: {
       owners: true
     }
   })

   console.log("[COFFEE_SHOPS_POST] Created coffee shop:", coffeeShop)

   return NextResponse.json(
     { message: "Coffee shop created successfully", coffeeShop },
     { status: 201 }
   )

 } catch (error) {
   console.error("[COFFEE_SHOPS_POST] Error:", error)
   
   // Handle specific errors
   if (error instanceof Error) {
     if (error.message.includes('Prisma')) {
       return NextResponse.json(
         { error: "Database error", details: error.message },
         { status: 500 }
       )
     }
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

   // Get coffee shops with owners included
   const coffeeShops = await prisma.coffeeShop.findMany({
     include: {
       owners: true
     },
     orderBy: {
       createdAt: "desc"
     }
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

// Update a coffee shop - includes owner updates
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
   const { id, owners, ...updateData } = data

   // Update coffee shop and handle owners
   const updatedShop = await prisma.coffeeShop.update({
     where: { id },
     data: {
       ...updateData,
       // Handle owner updates if present
       ...(owners && {
         owners: {
           deleteMany: {},  // Remove existing owners
           create: owners.map((owner: { name: string; email: string }) => ({
             name: owner.name,
             email: owner.email
           }))
         }
       })
     },
     include: {
       owners: true
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

// Delete a coffee shop and its owners
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

   // Delete coffee shop (will cascade delete owners)
   await prisma.coffeeShop.delete({
     where: { id }
   })

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
