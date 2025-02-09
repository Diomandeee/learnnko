import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function POST(request: Request) {
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

    const data = await request.json()
    
    const followUp = await prisma.followUp.create({
      data: {
        ...data,
        assignedTo: user.id,
      },
      include: {
        coffeeShop: true,
        user: true,
      },
    })

    return NextResponse.json({ data: followUp })
  } catch (error) {
    console.error("[FOLLOW_UP_CREATE]", error)
    return NextResponse.json(
      { error: "Failed to create follow-up" },
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

    const followUps = await prisma.followUp.findMany({
      where: {
        assignedTo: user.id,
      },
      include: {
        coffeeShop: true,
        user: true,
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    })

    return NextResponse.json({ data: followUps })
  } catch (error) {
    console.error("[FOLLOW_UPS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch follow-ups" },
      { status: 500 }
    )
  }
}