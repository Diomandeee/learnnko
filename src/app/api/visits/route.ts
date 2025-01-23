import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const visits = await prisma.visit.findMany({
      where: {
        userId: session.user.id
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

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
