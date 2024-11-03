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

    if (!params.id) {
      return new NextResponse("Contact ID required", { status: 400 });
    }

    const contact = await prisma.contact.findUnique({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const contact = await prisma.contact.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.contact.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONTACT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
