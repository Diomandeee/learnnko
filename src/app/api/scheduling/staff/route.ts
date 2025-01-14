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

    // Create the staff member with their availability
    const staff = await prisma.staff.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        certifications: body.certifications,
        maxHoursPerWeek: body.maxHoursPerWeek,
        hourlyRate: body.hourlyRate,
        availability: {
          create: body.availability.map((avail: any) => ({
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: avail.recurring,
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
    return new NextResponse("Internal error", { status: 500 });
  }
}

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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    await prisma.staff.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STAFF_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Staff ID required", { status: 400 });
    }

    const body = await request.json();

    const staff = await prisma.staff.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        certifications: body.certifications,
        maxHoursPerWeek: body.maxHoursPerWeek,
        hourlyRate: body.hourlyRate,
        availability: {
          deleteMany: {},
          create: body.availability.map((avail: any) => ({
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            recurring: avail.recurring,
          })),
        },
      },
      include: {
        availability: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
