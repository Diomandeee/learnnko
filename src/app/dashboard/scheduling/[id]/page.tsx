import { Metadata } from "next";
import { StaffCalendar } from "@/components/scheduling/calendar/staff-calendar";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
 title: "Staff Schedule | Milk Man CRM",
 description: "View and manage individual staff schedule",
};

interface StaffSchedulePageProps {
 params: { id: string };
}

export default async function StaffSchedulePage({ params }: StaffSchedulePageProps) {
 const session = await getServerSession();
 if (!session) {
   redirect('/auth/login');
 }

 const staff = await prisma.staff.findUnique({
   where: { id: params.id },
   include: {
     availability: true,
   },
 });

 if (!staff) {
   notFound();
 }

 return (
   <div className="space-y-6 p-8">
     <div>
       <h2 className="text-3xl font-bold tracking-tight">{staff.name}'s Schedule</h2>
       <p className="text-muted-foreground">{staff.role} - {staff.email}</p>
     </div>

     <div className="grid gap-6">
       <StaffCalendar staff={staff} />
     </div>
   </div>
 );
}
