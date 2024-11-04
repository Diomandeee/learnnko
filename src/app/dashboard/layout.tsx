import { SideNav } from "@/components/dashboard/navigation/side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <div className="flex min-h-screen">
        <SideNav />
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="h-full pt-0">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
