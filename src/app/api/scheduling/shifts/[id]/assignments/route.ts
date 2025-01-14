import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession();
   if (!session?.user?.email) {
     return new NextResponse("Unauthorized", { status: 401 });
   }

   const body = await request.json();
   const { staffId } = body;

   // Verify staff exists
   const staff = await prisma.staff.findUnique({
     where: { id: staffId },
   });

   if (!staff) {
     return new NextResponse("Staff member not found", { status: 404 });
   }

   // Verify shift exists
   const shift = await prisma.shift.findUnique({
     where: { id: params.id },
     include: {
       assignedStaff: true,
     },
   });

   if (!shift) {
     return new NextResponse("Shift not found", { status: 404 });
   }

   // Check if staff is already assigned
   const existingAssignment = await prisma.shiftAssignment.findFirst({
     where: {
       shiftId: params.id,
       staffId: staffId,
     },
   });

   if (existingAssignment) {
     return new NextResponse(
       "Staff member is already assigned to this shift",
       { status: 400 }
     );
   }

   // Create the assignment
   const assignment = await prisma.shiftAssignment.create({
     data: {
       shiftId: params.id,
       staffId: staffId,
       roleId: staff.role,
       status: "SCHEDULED",
     },
     include: {
       staff: {
         select: {
           id: true,
           name: true,
           email: true,
           role: true,
         },
       },
     },
   });

   return NextResponse.json(assignment);
 } catch (error) {
   console.error("[SHIFT_ASSIGNMENT_POST]", error);
   return new NextResponse(
     `Failed to assign staff: ${error instanceof Error ? error.message : "Unknown error"}`,
     { status: 500 }
   );
 }
}

export async function DELETE(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession();
   if (!session?.user?.email) {
     return new NextResponse("Unauthorized", { status: 401 });
   }

   const { searchParams } = new URL(request.url);
   const staffId = searchParams.get("staffId");

   if (!staffId) {
     return new NextResponse("Staff ID is required", { status: 400 });
   }

   await prisma.shiftAssignment.deleteMany({
     where: {
       shiftId: params.id,
       staffId: staffId,
     },
   });

   return new NextResponse(null, { status: 204 });
 } catch (error) {
   console.error("[SHIFT_ASSIGNMENT_DELETE]", error);
   return new NextResponse("Internal error", { status: 500 });
 }
}

export async function GET(
 request: Request,
 { params }: { params: { id: string } }
) {
 try {
   const session = await getServerSession();
   if (!session?.user?.email) {
     return new NextResponse("Unauthorized", { status: 401 });
   }

   const assignments = await prisma.shiftAssignment.findMany({
     where: {
       shiftId: params.id,
     },
     include: {
       staff: {
         select: {
           id: true,
           name: true,
           email: true,
           role: true,
         },
       },
     },
   });

   return NextResponse.json(assignments);
 } catch (error) {
   console.error("[SHIFT_ASSIGNMENTS_GET]", error);
   return new NextResponse("Internal error", { status: 500 });
 }
}
