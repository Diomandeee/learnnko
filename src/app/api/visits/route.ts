import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { createAutoFollowUps } from "@/lib/follow-ups/auto-create"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data = await request.json()
    
    // Create the visit
    const visit = await prisma.visit.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    // Generate automatic follow-ups
    await createAutoFollowUps(user.id)

    return NextResponse.json({ data: visit })
  } catch (error) {
    console.error("[VISIT_CREATE]", error)
    return NextResponse.json(
      { error: "Failed to create visit" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const visits = await prisma.visit.findMany({
      where: {
        userId: user.id
      },
      include: {
        coffeeShop: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    })

    await createAutoFollowUps(user.id)

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
