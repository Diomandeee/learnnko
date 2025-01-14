cat > src/app/api/scheduling/shifts/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate) {
      where.startTime = {
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      where.endTime = {
        lte: new Date(endDate),
      };
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        assignedStaff: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        breaks: {
          select: {
            id: true,
            startTime: true,
            duration: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("[SHIFTS_GET]", error);
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
    
    const shift = await prisma.shift.create({
      data: {
        type: body.type,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: 'DRAFT',
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

    return NextResponse.json(shift);
  } catch (error) {
    console.error("[SHIFTS_POST]", error);
    return new NextResponse(
      `Failed to create shift: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
EOF