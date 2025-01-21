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

    // Delete existing availability for this staff member
    await prisma.availability.deleteMany({
      where: { staffId: body.staffId }
    });

    // Create new availability records
    const availability = await prisma.$transaction(
      body.availability.map((avail: any) => 
        prisma.availability.create({
          data: {
            staffId: body.staffId,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: true
          }
        })
      )
    );

    return NextResponse.json(availability);
  } catch (error) {
    return new NextResponse("Error updating availability", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json(availability);
  } catch (error) {
    return new NextResponse("Error fetching availability", { status: 500 });
  }
}
