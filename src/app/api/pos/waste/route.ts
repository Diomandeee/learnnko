// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth/options";

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
    
//     const wasteLog = await prisma.wasteLog.create({
//       data: {
//         itemName: data.itemName,
//         quantity: data.quantity,
//         reason: data.reason,
//         userId: user.id
//       }
//     });

//     return NextResponse.json(wasteLog);
//   } catch (error) {
//     console.error("[WASTE_POST]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const wasteLogs = await prisma.wasteLog.findMany({
//       orderBy: { createdAt: "desc" }
//     });

//     return NextResponse.json(wasteLogs);
//   } catch (error) {
//     console.error("[WASTE_GET]", error);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }
