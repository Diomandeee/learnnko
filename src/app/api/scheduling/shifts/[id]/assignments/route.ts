import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return new NextResponse("Staff ID is required", { status: 400 });
    }

    // Check if staff member exists
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return new NextResponse("Staff member not found", { status: 404 });
    }

    // Check if shift exists
    const shift = await prisma.shift.findUnique({
      where: { id: params.id }
    });

    if (!shift) {
      return new NextResponse("Shift not found", { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.shiftAssignment.findFirst({
      where: {
        shiftId: params.id,
        staffId: staffId
      }
    });

    if (existingAssignment) {
      return new NextResponse("Staff member already assigned to this shift", { status: 400 });
    }

    // Create the assignment
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId: params.id,
        staffId: staffId,
        status: "SCHEDULED"
      },
      include: {
        staff: true,
        shift: true
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[SHIFT_ASSIGNMENT_ERROR]", error);
    return new NextResponse(
      "Failed to assign staff to shift", 
      { status: 500 }
    );
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

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return new NextResponse("Staff ID is required", { status: 400 });
    }

    // Delete the assignment
    await prisma.shiftAssignment.deleteMany({
      where: {
        shiftId: params.id,
        staffId: staffId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SHIFT_UNASSIGNMENT_ERROR]", error);
    return new NextResponse(
      "Failed to remove staff from shift", 
      { status: 500 }
    );
  }
}
