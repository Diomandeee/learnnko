import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    if (!body.startTime || !body.endTime || !body.type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: "DRAFT",
        requiredRoles: body.requiredRoles || [],
        notes: body.notes
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
    return new NextResponse("Failed to create shift", { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const shifts = await prisma.shift.findMany({
      include: {
        assignedStaff: {
          include: {
            staff: true
          }
        },
        breaks: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(shifts);
  } catch (error) {
    return new NextResponse("Failed to fetch shifts", { status: 500 });
  }
}
