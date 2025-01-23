import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const visitSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = visitSchema.parse(json)

    // Get previous visits count for visitNumber
    const visitCount = await prisma.visit.count({
      where: { shopId: params.shopId }
    })

    const visit = await prisma.visit.create({
      data: {
        ...body,
        shopId: params.shopId,
        visitNumber: visitCount + 1,
        userId: session.user.id
      }
    })

    // Update shop's visited status
    await prisma.shop.update({
      where: { id: params.shopId },
      data: { visited: true }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error("[VISIT_CREATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const visits = await prisma.visit.findMany({
      where: { shopId: params.shopId },
      orderBy: { date: "desc" },
      include: {
        photos: true
      }
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error("[VISITS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
