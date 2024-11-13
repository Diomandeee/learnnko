import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession(authOptions);
   if (!session?.user?.email) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   const data = await request.json();
   const menuItem = await prisma.menuItem.update({
     where: { id: params.id },
     data: {
       name: data.name,
       price: data.price,
       category: data.category,
       popular: data.popular
     }
   });

   return NextResponse.json(menuItem);
 } catch (error) {
   console.error("[MENU_PATCH]", error);
   return NextResponse.json({ error: "Internal error" }, { status: 500 });
 }
}

export async function DELETE(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession(authOptions);
   if (!session?.user?.email) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   await prisma.menuItem.update({
     where: { id: params.id },
     data: { active: false }
   });

   return new NextResponse(null, { status: 204 });
 } catch (error) {
   console.error("[MENU_DELETE]", error);
   return NextResponse.json({ error: "Internal error" }, { status: 500 });
 }
}
