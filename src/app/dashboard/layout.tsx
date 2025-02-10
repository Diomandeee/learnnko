import { SideNav } from "@/components/dashboard/navigation/side-nav";
import { ScheduleViewProvider } from "@/contexts/schedule-view-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
            <ScheduleViewProvider>

      <div className="flex min-h-screen flex-col md:flex-row">
        <div className="w-full md:w-auto">
          <SideNav />
        </div>
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="h-full pt-0">
            <div className="max-w-[2000px] mx-auto p-4 md:px-6 md:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
      </ScheduleViewProvider>

    </div>
  );
}