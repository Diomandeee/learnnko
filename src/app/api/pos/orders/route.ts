// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/options";

// export async function GET() {
//   try {
//     // Get the session
//     const session = await getServerSession(authOptions);
    
//     // Check if user is authenticated
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Get the user
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email }
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Get user's orders with included items and menu items
//     const orders = await prisma.order.findMany({
//       where: {
//         userId: user.id
//       },
//       include: {
//         items: {
//           include: {
//             menuItem: true
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });

//     return NextResponse.json(orders);
//   } catch (error) {
//     console.error("[ORDERS_GET]", error);
//     return NextResponse.json(
//       { error: "Internal error" }, 
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email }
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const data = await request.json();

//     // Create order with items
//     const order = await prisma.order.create({
//       data: {
//         orderNumber: data.orderNumber,
//         customerName: data.customerName,
//         status: data.status || 'PENDING',
//         total: data.total,
//         isComplimentary: data.isComplimentary,
//         queueTime: data.queueTime,
//         startTime: data.startTime,
//         customerEmail: data.customerEmail,
//         customerPhone: data.customerPhone,
//         notes: data.notes,
//         userId: user.id,
//         items: {
//           create: data.items.map((item: any) => ({
//             menuItemId: item.id,
//             quantity: item.quantity,
//             price: item.price
//           }))
//         }
//       },
//       include: {
//         items: {
//           include: {
//             menuItem: true
//           }
//         }
//       }
//     });

//     return NextResponse.json(order);
//   } catch (error) {
//     console.error("[ORDERS_POST]", error);
//     return NextResponse.json(
//       { error: "Failed to create order" }, 
//       { status: 500 }
//     );
//   }
// }