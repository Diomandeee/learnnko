// src/app/api/pos/menu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        active: true,
        userId: user.id
      },
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal error", 
        message: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ 
      error: "Internal error" 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        price: data.price,
        category: data.category,
        popular: data.popular,
        active: true,
        userId: user.id
      }
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal error", 
        message: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ 
      error: "Internal error" 
    }, { status: 500 });
  }
}