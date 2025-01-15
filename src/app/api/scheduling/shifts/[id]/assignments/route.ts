import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request, { params: { id } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        staffId,
        shiftId: id,
        status: "SCHEDULED"
      },
      include: {
        staff: true
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return new NextResponse("Failed to assign staff", { status: 500 });
  }
}
