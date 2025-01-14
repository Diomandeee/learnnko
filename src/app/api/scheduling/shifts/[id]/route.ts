import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const shift = await prisma.shift.findUnique({
      where: {
        id: params.id,
      },
      include: {
        assignedStaff: true,
        breaks: true,
      },
    });

    if (!shift) {
      return new NextResponse("Shift not found", { status: 404 });
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const shift = await prisma.shift.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
      },
      include: {
        assignedStaff: true,
        breaks: true,
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.shift.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SHIFT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
