// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { prisma } from "@/lib/db/prisma";
// import { authOptions } from "@/lib/auth/options";

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email }
//     });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     const menuItemData = await request.json();
//     const menuItem = await prisma.menuItem.create({
//       data: {
//         ...menuItemData,
//         userId: user.id
//       }
//     });

//     return NextResponse.json(menuItem);
//   } catch (error) {
//     console.error("[MENU_ITEM_CREATE]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const menuItems = await prisma.menuItem.findMany({
//       orderBy: { name: 'asc' }
//     });

//     return NextResponse.json(menuItems);
//   } catch (error) {
//     console.error("[MENU_ITEMS_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
