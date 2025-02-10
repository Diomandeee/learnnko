import { ScheduleViewProvider } from "@/contexts/schedule-view-context"

export default function PriorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScheduleViewProvider>
      {children}
    </ScheduleViewProvider>
  );
}
