import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request, { params: { id } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const shift = await prisma.shift.update({
      where: { id },
      data: {
        ...body,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime)
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

    return NextResponse.json(shift);
  } catch (error) {
    return new NextResponse(`Failed to update shift: ${error.message}`, { 
      status: 500 
    });
  }
}
