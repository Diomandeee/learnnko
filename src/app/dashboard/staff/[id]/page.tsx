import { StaffSchedule } from "@/components/directory/schedules/staff-schedule";

export default function StaffSchedulePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Staff Schedule</h1>
      <StaffSchedule staffId={params.id} />
    </div>
  );
}