import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: {
        contactId: params.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
