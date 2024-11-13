import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"

const createFolderSchema = z.object({
  name: z.string().min(2),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { qrCodes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("[FOLDERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const json = await request.json()
    const data = createFolderSchema.parse(json)

    const folder = await prisma.folder.create({
      data: {
        name: data.name,
        userId: user.id,
      },
      include: {
        _count: {
          select: { qrCodes: true }
        }
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[FOLDER_CREATE]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    )
  }
}

