import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const filterSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  type: z.string(),
  label: z.string()
})

const savedFilterSchema = z.object({
  name: z.string().min(1, "Filter name is required"),
  filters: z.array(filterSchema),
  isDefault: z.boolean().optional()
})

export async function GET() {
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

    const savedFilters = await prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(savedFilters)
  } catch (error) {
    console.error("[SAVED_FILTERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch saved filters" },
      { status: 500 }
    )
  }
}

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

    const json = await request.json()
    const { name, filters, isDefault } = savedFilterSchema.parse(json)

    // If setting as default, remove existing default
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        filters,
        isDefault: isDefault || false,
        userId: user.id
      }
    })

    return NextResponse.json(savedFilter)
  } catch (error) {
    console.error("[SAVED_FILTERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save filter" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) {
      return NextResponse.json(
        { error: "Filter ID is required" },
        { status: 400 }
      )
    }

    await prisma.savedFilter.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Filter deleted successfully" })
  } catch (error) {
    console.error("[SAVED_FILTERS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete filter" },
      { status: 500 }
    )
  }
}
