import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      include: {
        availability: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Create staff member with availability
    const staff = await prisma.staff.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        maxHoursPerWeek: body.maxHoursPerWeek || 40,
        hourlyRate: body.hourlyRate || 15,
        certifications: body.certifications || [],
        availability: {
          create: body.availability.map((avail: any) => ({
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: avail.recurring || true,
          })),
        },
      },
      include: {
        availability: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_POST]", error);
    return new NextResponse(
      `Failed to create staff: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
