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

//     const orderData = await request.json();
//     const order = await prisma.order.create({
//       data: {
//         ...orderData,
//         userId: user.id,
//         items: orderData.items.map((item: any) => ({
//           ...item,
//           price: parseFloat(item.price)
//         }))
//       }
//     });

//     return NextResponse.json(order);
//   } catch (error) {
//     console.error("[ORDER_CREATE]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

// export async function GET(request: Request) {
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

//     const orders = await prisma.order.findMany({
//       where: { userId: user.id },
//       orderBy: { timestamp: 'desc' }
//     });

//     return NextResponse.json(orders);
//   } catch (error) {
//     console.error("[ORDERS_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
