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

    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      select: {
        maxHoursPerWeek: true,
        maxHoursPerDay: true,
        preferredShifts: true,
        emergencyContact: true,
        address: true,
        notes: true,
      },
    });

    if (!staff) {
      return new NextResponse("Staff not found", { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    return new NextResponse("Error fetching staff settings", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(staff);
  } catch (error) {
    return new NextResponse("Error updating staff settings", { status: 500 });
  }
}
