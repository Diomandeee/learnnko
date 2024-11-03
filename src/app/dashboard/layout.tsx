import { SideNav } from "@/components/dashboard/side-nav";
import { useSidebar } from "@/store/use-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SideNav />
      <main className="min-h-screen transition-all duration-300 ease-in-out">
        <div className="h-full pt-20 md:pt-0">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
