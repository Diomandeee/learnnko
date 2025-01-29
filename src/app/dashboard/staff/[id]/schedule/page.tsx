import { Metadata } from "next";
import { getStaffById } from "@/lib/staff";
import { StaffSchedule } from "@/components/directory/schedules/staff-schedule";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Staff Schedule | Milk Man CRM",
  description: "View and manage staff schedule",
};

interface StaffSchedulePageProps {
  params: {
    id: string;
  };
}

export default async function StaffSchedulePage({ params }: StaffSchedulePageProps) {
  const staff = await getStaffById(params.id);

  if (!staff) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{staff.name}'s Schedule</h1>
          <p className="text-muted-foreground">View and manage schedule</p>
        </div>
      </div>
      <StaffSchedule staffId={params.id} />
    </div>
  );
}
