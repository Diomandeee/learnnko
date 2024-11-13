import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"

// DELETE handler
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    // Extract `id` from the URL
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()

    const folder = await prisma.folder.findUnique({
      where: { id: id as string }
    })

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 })
    }

    if (folder.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Delete the folder and set any QR codes in it to have null folderId
    await prisma.$transaction([
      prisma.qRCode.updateMany({
        where: { folderId: id },
        data: { folderId: null }
      }),
      prisma.folder.delete({
        where: { id: id as string }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FOLDER_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// PATCH handler
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    // Extract `id` from the URL
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()

    const folder = await prisma.folder.findUnique({
      where: { id: id as string }
    })

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 })
    }

    if (folder.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: id as string },
      data: {
        name: json.name,
      }
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error("[FOLDER_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
