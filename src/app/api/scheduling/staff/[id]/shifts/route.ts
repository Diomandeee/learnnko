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

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return new NextResponse("Date parameter is required", { status: 400 });
    }

    const date = new Date(dateParam);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const shifts = await prisma.shiftAssignment.findMany({
      where: {
        staffId: params.id,
        shift: {
          startTime: {
            gte: date,
            lt: nextDay,
          },
        },
      },
      include: {
        shift: true,
      },
      orderBy: {
        shift: {
          startTime: 'asc',
        },
      },
    });

    return NextResponse.json(shifts.map(assignment => assignment.shift));
  } catch (error) {
    console.error("[STAFF_SHIFTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}