import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    
    const updatedSettings = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        // Add the fields you want to update
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("[SETTINGS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        name: true,
        email: true,
        // Add other fields you want to return
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
