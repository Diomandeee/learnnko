// src/app/api/coffee-shops/reports/visits/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      )
    }

    const shops = await prisma.coffeeShop.findMany({
      where: {
        visited: true,
        first_visit: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) })
        }
      },
      include: {
        visits: {
          where: {
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        }
      },
      orderBy: {
        first_visit: 'desc'
      }
    })

    const shopsWithNotes = shops.map(shop => {
      const arr = shop.volume ? ((parseFloat(shop.volume) * 52) * 18) : 0
      
      let note = `First visited on ${new Date(shop.first_visit!).toLocaleDateString()}. `
      
      if (shop.manager_present) {
        note += `Manager ${shop.manager_present} present. `
      } else {
        note += 'No manager information. '
      }

      if (shop.volume) {
        note += `Weekly volume: ${shop.volume} units. `
      }

      if (arr > 0) {
        note += `Potential annual revenue: $${arr.toLocaleString()}.`
      }

      return {
        name: shop.title,
        address: shop.address,
        area: shop.area || '',
        website: shop.website || '',
        store_doors: shop.store_doors || '',
        manager_present: shop.manager_present || '',
        contact_name: shop.contact_name || '',
        contact_email: shop.contact_email || '',
        weeklyVolume: shop.volume || '',
        annualRevenue: arr > 0 ? `$${arr.toLocaleString()}` : '',
        visitDate: shop.first_visit ? new Date(shop.first_visit).toLocaleDateString() : '',
        stage: shop.stage || '',
        rating: shop.rating || '',
        notes: note
      }
    })

    return NextResponse.json(shopsWithNotes)
  } catch (error) {
    console.error("[VISIT_REPORT_GET]", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}