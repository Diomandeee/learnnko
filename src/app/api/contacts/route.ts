// src/app/api/contacts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  console.log("[CONTACTS_POST] Starting request handler");

  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions);
    console.log("[CONTACTS_POST] Session data:", {
      email: session?.user?.email,
      exists: !!session
    });

    if (!session?.user?.email) {
      console.log("[CONTACTS_POST] No valid session found");
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // 2. Find user and create if not exists
    let user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log("[CONTACTS_POST] Found user:", user);

    if (!user) {
      console.log("[CONTACTS_POST] User not found, creating new user");
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          password: '', // You might want to handle this differently
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
      console.log("[CONTACTS_POST] Created new user:", user);
    }

    // 3. Get and validate contact data
    const contactData = await request.json();
    console.log("[CONTACTS_POST] Contact data:", contactData);

    // 4. Create the contact
    const contact = await prisma.contact.create({
      data: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone || null,
        company: contactData.company || null,
        notes: contactData.notes || null,
        status: "NEW",
        userId: user.id,
      },
    });

    console.log("[CONTACTS_POST] Created contact:", contact);

    // 5. Return success response
    return NextResponse.json(
      { message: "Contact created successfully", contact },
      { status: 201 }
    );

  } catch (error) {
    console.error("[CONTACTS_POST] Error:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[CONTACTS_GET] Session:", session);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACTS_GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}