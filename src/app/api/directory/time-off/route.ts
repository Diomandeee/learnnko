import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const timeOff = await prisma.timeOff.create({
      data: {
        staffId: body.staffId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        type: body.type,
        status: "PENDING",
        notes: body.notes
      }
    });

    return NextResponse.json(timeOff);
  } catch (error) {
    return new NextResponse("Error creating time off request", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const timeOffRequests = await prisma.timeOff.findMany({
      include: {
        staff: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json(timeOffRequests);
  } catch (error) {
    return new NextResponse("Error fetching time off requests", { status: 500 });
  }
}
