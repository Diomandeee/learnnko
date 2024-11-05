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

//     const { content } = await request.json();
//     const quickNote = await prisma.quickNote.create({
//       data: {
//         content,
//         userId: user.id
//       }
//     });

//     return NextResponse.json(quickNote);
//   } catch (error) {
//     console.error("[QUICK_NOTE_CREATE]", error);
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

//     const quickNotes = await prisma.quickNote.findMany({
//       where: { userId: user.id },
//       orderBy: { createdAt: 'desc' }
//     });

//     return NextResponse.json(quickNotes);
//   } catch (error) {
//     console.error("[QUICK_NOTES_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
