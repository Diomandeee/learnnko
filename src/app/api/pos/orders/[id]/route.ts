// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/options";

// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const data = await request.json();
//     const orderId = params.id;

//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         status: data.status,
//         notes: data.notes,
//         leadInterest: data.leadInterest,
//         preparationTime: data.preparationTime,
//         items: data.items ? {
//           deleteMany: {},
//           create: data.items.map((item: any) => ({
//             menuItemId: item.id,
//             quantity: item.quantity,
//             price: item.price
//           }))
//         } : undefined
//       },
//       include: {
//         items: {
//           include: {
//             menuItem: true
//           }
//         }
//       }
//     });

//     // Update localStorage
//     const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
//     const updatedOrders = existingOrders.map((order: any) => 
//       order.id === orderId ? updatedOrder : order
//     );
//     localStorage.setItem('orders', JSON.stringify(updatedOrders));

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     console.error("[ORDERS_PATCH]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const orderId = params.id;

//     // Set order status to cancelled instead of deleting
//     await prisma.order.update({
//       where: { id: orderId },
//       data: { status: 'CANCELLED' }
//     });

//     // Update localStorage
//     const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
//     const updatedOrders = existingOrders.filter((order: any) => order.id !== orderId);
//     localStorage.setItem('orders', JSON.stringify(updatedOrders));

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     console.error("[ORDERS_DELETE]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }
