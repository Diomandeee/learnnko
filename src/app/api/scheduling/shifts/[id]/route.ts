import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

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

    // Validate the shift exists
    const existingShift = await prisma.shift.findUnique({
      where: { id: params.id }
    });

    if (!existingShift) {
      return new NextResponse("Shift not found", { status: 404 });
    }

    // Update the shift
    const updatedShift = await prisma.shift.update({
      where: { id: params.id },
      data: {
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status,
        notes: body.notes,
        requiredRoles: body.requiredRoles
      },
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      }
    });

    return NextResponse.json(updatedShift);
  } catch (error) {
    console.error("[SHIFT_UPDATE_ERROR]", error);
    return new NextResponse("Failed to update shift", { status: 500 });
  }
}

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
      where: { id: params.id },
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      }
    });

    if (!shift) {
      return new NextResponse("Shift not found", { status: 404 });
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFT_GET_ERROR]", error);
    return new NextResponse("Failed to fetch shift", { status: 500 });
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

    // Delete related records first
    await prisma.$transaction([
      prisma.shiftAssignment.deleteMany({
        where: { shiftId: params.id }
      }),
      prisma.break.deleteMany({
        where: { shiftId: params.id }
      }),
      prisma.shift.delete({
        where: { id: params.id }
      })
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SHIFT_DELETE_ERROR]", error);
    return new NextResponse("Failed to delete shift", { status: 500 });
  }
}
